'use strict';
/**
 * chatbotService.js
 *
 * Pipeline:
 *   1. Load/create ChatHistory for user
 *   2. Build role-specific system prompt
 *   3. Call HF Inference API → structured intent JSON
 *   4. Dispatch intent → fetch DB data (reusing existing services/models)
 *   5. Strip image fields from all DB results
 *   6. Pass DB context back to LLM for natural-language formatting
 *   7. Save updated history
 *   8. Return { reply, pendingAction }
 */

const mongoose      = require('mongoose');
const ChatHistory   = require('../models/ChatHistory');
const Transport     = require('../models/Transport');
const Route         = require('../models/Route');
const User          = require('../models/User');
const Authority     = require('../models/Authority');
const Incident      = require('../models/Incident');
const CrowdReport   = require('../models/CrowdReport');
const transportSvc  = require('./transportService');
const routeSvc      = require('./routeService');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Strip ALL image fields from any DB object before processing */
function stripImages(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(stripImages);
  const stripped = {};
  const IMAGE_KEYS = ['img', 'image', 'photo', 'picture', 'base64', 'avatar'];
  for (const [k, v] of Object.entries(obj)) {
    if (IMAGE_KEYS.some((ik) => k.toLowerCase().includes(ik))) continue;
    stripped[k] = stripImages(v);
  }
  return stripped;
}

/** Convert a Mongoose lean doc (with _id, __v etc.) to a clean text-only object */
function cleanDoc(doc) {
  if (!doc) return null;
  const copy = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  // Remove internal Mongo fields
  delete copy.__v;
  delete copy.passwordHash;
  delete copy.refreshTokenHash;
  return stripImages(copy);
}

// ─── HF Inference API ─────────────────────────────────────────────────────────

const HF_API_URL = 'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct/v1/chat/completions';

/** Call Hugging Face chat-completions endpoint, timeout 30 s */
async function callHF(messages) {
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(HF_API_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model:       'meta-llama/Meta-Llama-3-8B-Instruct',
        messages,
        max_tokens:  1024,
        temperature: 0.1,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`HF API HTTP ${res.status}: ${errBody}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  } finally {
    clearTimeout(timeout);
  }
}

/** Parse the LLM response into a guaranteed-shape intent object */
function parseIntentResponse(raw) {
  try {
    // Try to extract JSON block if LLM adds markdown fences
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/);
    const jsonStr   = jsonMatch ? jsonMatch[1] : raw;
    const parsed    = JSON.parse(jsonStr.trim());
    return {
      intent:        parsed.intent        || 'unknown',
      entities:      parsed.entities      || {},
      missingFields: parsed.missingFields || [],
      responseText:  parsed.responseText  || '',
    };
  } catch {
    return { intent: 'unknown', entities: {}, missingFields: [], responseText: raw };
  }
}

// ─── Role-specific system prompts ─────────────────────────────────────────────

function buildSystemPrompt(role) {
  const base = `You are a transit information assistant for a Tamil Nadu public transport system.
You MUST respond with a valid JSON object in EXACTLY this format (no extra text outside the JSON):
{
  "intent": "<intent_name>",
  "entities": { <key-value pairs extracted from the user message> },
  "missingFields": [ <list of field names still needed> ],
  "responseText": "<natural language reply to show the user>"
}

STRICT RULES:
- Never invent, assume, or hallucinate any transport, route, fare, or incident data.
- If data is not found in the database context provided, say exactly: "No data found."
- Never expose MongoDB ObjectIds or internal field names to the user.
- If the user asks for unauthorized data or restricted actions (like managing fleets if they are a commuter), set intent to "unauthorized" and responseText to "no access to the data".
- Use Indian Rupee symbol ₹ for fares.
- Keep responseText concise and friendly.`;

  const rolePrompts = {
    commuter: `${base}

Your role is COMMUTER assistant.
Valid intents: search_route, get_fare, get_stops, get_schedule, get_crowd_status, general_help, unknown.

For search_route, extract: origin, destination (both optional but at least one needed).
For get_fare, extract: origin, destination, routeNumber (any combination).
For get_stops, extract: routeNumber or busName.
For get_schedule, extract: routeNumber or busName, departureTime (optional).
For get_crowd_status, extract: routeNumber or busName.`,

    driver: `${base}

Your role is DRIVER/CONDUCTOR assistant.
Valid intents: view_assigned_bus, submit_duty_update, search_route, get_fare, get_stops, get_schedule, get_crowd_status, report_incident, general_help, unknown.

For submit_duty_update, extract: updateType (delay|shift_start|shift_end|at_stop), delayMinutes (if applicable), currentStop (if applicable), description.
For report_incident, extract: incidentType (delay|breakdown|accident|overcrowding|other), severity (low|medium|high|critical), description, location.`,

    conductor: `${base}

Your role is CONDUCTOR assistant. Same as driver.
Valid intents: view_assigned_bus, submit_duty_update, search_route, get_fare, get_stops, get_schedule, get_crowd_status, report_incident, general_help, unknown.

For submit_duty_update, extract: updateType (delay|shift_start|shift_end|at_stop), delayMinutes (if applicable), currentStop (if applicable), description.
For report_incident, extract: incidentType (delay|breakdown|accident|overcrowding|other), severity (low|medium|high|critical), description, location.`,

    authority: `${base}

Your role is TRANSPORT AUTHORITY assistant.
Valid intents: view_incidents, view_crowd_reports, add_transport, update_transport, delete_transport, pause_transport, resume_transport, add_route, delete_route, delete_incident, search_route, get_fare, get_stops, general_help, unknown.

For add_transport, required fields: transportNumber, name, type (bus|train). Optional: operator, totalSeats, vehicleNumber, amenities.
For update_transport, required: transportNumber or name to identify transport. Include only fields to update.
For delete_transport / pause_transport / resume_transport, required: transportNumber or name.
For add_route, required: transportNumber or name (which transport), routeNumber, routeName, origin, destination. Optional: totalDistance, estimatedDuration, stops.
For delete_route, required: routeNumber.
For delete_incident, required: incidentId (user may refer by description — extract what they give).
For view_incidents, extract: status (open|acknowledged|resolved), severity, transportNumber (all optional filters).
For view_crowd_reports, extract: transportNumber (optional).

When missingFields is non-empty, responseText must ask for the NEXT single missing field only (one at a time).
When all fields are collected (missingFields is empty), set intent accordingly and ask for confirmation in responseText.`,
  };

  return rolePrompts[role] || rolePrompts.commuter;
}

// ─── DB data fetchers ─────────────────────────────────────────────────────────

async function fetchRoutes({ origin, destination, busNo, routeNumber }) {
  try {
    const result = await transportSvc.searchTransports({
      origin,
      destination,
      busNo: busNo || routeNumber,
      page:  1,
      limit: 10,
    });
    return result.results.map(cleanDoc);
  } catch { return []; }
}

async function fetchAssignedBus(userId) {
  try {
    const user = await User.findById(userId)
      .populate({ path: 'assignedTransport', populate: { path: 'authorityId', select: 'organizationName' } })
      .lean();
    if (!user?.assignedTransport) return null;
    const routes = await Route.find({ transportId: user.assignedTransport._id }).lean();
    return cleanDoc({ ...user.assignedTransport, routes: routes.map(cleanDoc) });
  } catch { return null; }
}

async function fetchIncidents(authorityId, filters = {}) {
  try {
    const managedTransports = await Transport.find({ authorityId }, '_id').lean();
    const tIds = managedTransports.map((t) => t._id);
    const query = { transportId: { $in: tIds } };
    if (filters.status)       query.status       = filters.status;
    if (filters.severity)     query.severity     = filters.severity;
    if (filters.transportId)  query.transportId  = filters.transportId;

    const incidents = await Incident.find(query)
      .sort({ reportedAt: -1 })
      .limit(20)
      .populate('transportId', 'transportNumber name')
      .populate('reportedBy',  'name role')
      .select('-img') // explicitly exclude image field at query level
      .lean();
    return incidents.map(cleanDoc);
  } catch { return []; }
}

async function fetchCrowdReports(authorityId, filters = {}) {
  try {
    const managedTransports = await Transport.find({ authorityId }, '_id').lean();
    const tIds = managedTransports.map((t) => t._id);
    const routes = await Route.find({ transportId: { $in: tIds } }, '_id origin destination').lean();
    const rIds   = routes.map((r) => r._id);
    const routeMap = {};
    routes.forEach((r) => { routeMap[String(r._id)] = r; });

    const reports = await CrowdReport.find({ routeId: { $in: rIds } })
      .sort({ reportedAt: -1 })
      .limit(30)
      .populate('reportedBy', 'name')
      .lean();

    return reports.map((r) => ({
      ...cleanDoc(r),
      route: routeMap[String(r.routeId)] || null,
    }));
  } catch { return []; }
}

async function findTransportByIdentifier(authorityId, identifier) {
  const query = {
    authorityId,
    $or: [
      { transportNumber: { $regex: identifier, $options: 'i' } },
      { name:            { $regex: identifier, $options: 'i' } },
    ],
  };
  return Transport.findOne(query).lean();
}

// ─── Intent dispatchers ───────────────────────────────────────────────────────

async function dispatchCommuter(intent, entities) {
  if (['search_route', 'get_fare', 'get_stops', 'get_schedule', 'get_crowd_status'].includes(intent)) {
    const routes = await fetchRoutes({
      origin:      entities.origin,
      destination: entities.destination,
      busNo:       entities.busName || entities.routeNumber,
      routeNumber: entities.routeNumber,
    });
    return { dbData: routes, dataType: 'routes' };
  }
  return { dbData: null, dataType: null };
}

async function dispatchDriverConductor(intent, entities, userId) {
  if (intent === 'view_assigned_bus') {
    const bus = await fetchAssignedBus(userId);
    return { dbData: bus, dataType: 'assigned_bus' };
  }
  if (intent === 'submit_duty_update') {
    // Just confirm — no DB write needed for simple duty updates in this scope
    return { dbData: { updateType: entities.updateType, details: entities }, dataType: 'duty_update_ack' };
  }
  // Fall through to commuter intents
  return dispatchCommuter(intent, entities);
}

async function dispatchAuthority(intent, entities, userId, pendingAction, userMessage) {
  switch (intent) {
    case 'view_incidents': {
      let tFilter = {};
      if (entities.transportNumber) {
        const t = await findTransportByIdentifier(userId, entities.transportNumber);
        if (t) tFilter.transportId = t._id;
      }
      const incidents = await fetchIncidents(userId, {
        status:      entities.status,
        severity:    entities.severity,
        ...tFilter,
      });
      return { dbData: incidents, dataType: 'incidents' };
    }
    case 'view_crowd_reports': {
      const reports = await fetchCrowdReports(userId, entities);
      return { dbData: reports, dataType: 'crowd_reports' };
    }
    case 'search_route':
    case 'get_fare':
    case 'get_stops':
    case 'get_schedule':
      return dispatchCommuter(intent, entities);

    case 'add_transport': {
      // Multi-step — delegate to pendingAction accumulation (handled in main flow)
      return { dbData: null, dataType: 'multi_step', needsDB: false };
    }
    case 'delete_transport':
    case 'pause_transport':
    case 'resume_transport': {
      const identifier = entities.transportNumber || entities.name || entities.busName;
      if (!identifier) return { dbData: null, dataType: 'multi_step', needsDB: false };
      const t = await findTransportByIdentifier(userId, identifier);
      if (!t) return { dbData: null, dataType: 'not_found' };
      return { dbData: cleanDoc(t), dataType: 'transport_for_action', actionIntent: intent };
    }
    case 'delete_incident': {
      // Authority can delete incident by reference
      const incidentId = entities.incidentId;
      if (!incidentId || !mongoose.isValidObjectId(incidentId)) {
        return { dbData: null, dataType: 'multi_step', needsDB: false };
      }
      const inc = await Incident.findById(incidentId).select('-img').lean();
      if (!inc) return { dbData: null, dataType: 'not_found' };
      return { dbData: cleanDoc(inc), dataType: 'incident_for_delete', actionIntent: 'delete_incident' };
    }
    default:
      return { dbData: null, dataType: null };
  }
}

// ─── Execute confirmed authority actions ──────────────────────────────────────

async function executeAuthorityAction(actionIntent, collectedFields, userId) {
  try {
    switch (actionIntent) {
      case 'add_transport': {
        const t = await transportSvc.createTransport(userId, {
          transportNumber: collectedFields.transportNumber,
          name:            collectedFields.name,
          type:            collectedFields.type,
          operator:        collectedFields.operator,
          totalSeats:      collectedFields.totalSeats ? Number(collectedFields.totalSeats) : undefined,
          vehicleNumber:   collectedFields.vehicleNumber,
          amenities:       collectedFields.amenities ? String(collectedFields.amenities).split(',').map(a => a.trim()) : [],
        });
        return { success: true, message: `Transport "${t.name}" (${t.transportNumber}) has been added successfully.` };
      }
      case 'pause_transport': {
        const t = await findTransportByIdentifier(userId, collectedFields.transportNumber || collectedFields.name);
        if (!t) return { success: false, message: 'Transport not found.' };
        await transportSvc.updateTransport(userId, String(t._id), { isActive: false });
        return { success: true, message: `Transport "${t.name}" has been paused.` };
      }
      case 'resume_transport': {
        const t = await findTransportByIdentifier(userId, collectedFields.transportNumber || collectedFields.name);
        if (!t) return { success: false, message: 'Transport not found.' };
        await transportSvc.updateTransport(userId, String(t._id), { isActive: true });
        return { success: true, message: `Transport "${t.name}" has been resumed.` };
      }
      case 'delete_transport': {
        const t = await findTransportByIdentifier(userId, collectedFields.transportNumber || collectedFields.name);
        if (!t) return { success: false, message: 'Transport not found.' };
        await transportSvc.deleteTransport(userId, String(t._id));
        return { success: true, message: `Transport "${t.name}" and all associated routes, incidents, and crowd data have been permanently deleted.` };
      }
      case 'delete_incident': {
        if (!mongoose.isValidObjectId(collectedFields.incidentId)) {
          return { success: false, message: 'Invalid incident reference.' };
        }
        const inc = await Incident.findByIdAndDelete(collectedFields.incidentId);
        if (!inc) return { success: false, message: 'Incident not found.' };
        return { success: true, message: 'Incident has been deleted successfully.' };
      }
      default:
        return { success: false, message: 'Action not recognised.' };
    }
  } catch (err) {
    return { success: false, message: err.message || 'Action failed.' };
  }
}

// ─── Format DB data via LLM (text-only) ──────────────────────────────────────

async function formatWithLLM(dbData, dataType, userMessage, role, conversationHistory) {
  const systemMsg = {
    role:    'system',
    content: `You are a friendly transit assistant. Format the database results below into a clear, helpful natural language response.
Rules:
- Use the data EXACTLY as provided — do not add or infer any extra information
- Use ₹ for fares
- Don't expose MongoDB IDs or internal field names
- Keep the response concise (under 300 words)
- Database results: ${JSON.stringify(dbData, null, 2)}
- Data type: ${dataType}`,
  };

  const history = conversationHistory.slice(-6).map((m) => ({ role: m.role, content: m.content }));
  history.push({ role: 'user', content: userMessage });

  try {
    const rawResponse = await callHF([systemMsg, ...history]);
    return rawResponse.trim();
  } catch {
    // Fallback: return a simple text summary without LLM
    if (Array.isArray(dbData) && dbData.length > 0) {
      return `Found ${dbData.length} result(s). Please check the details.`;
    }
    return typeof dbData === 'object' && dbData ? 'Here are the details from our records.' : 'No data found.';
  }
}

// ─── Main entry point ─────────────────────────────────────────────────────────

const CHATBOT_OFFLINE_MSG =
  "I'm currently unable to process your request due to a connectivity issue. Please try again in a moment.";

/**
 * processMessage — main chatbot pipeline
 * @param {{ userId, userRole, userName, userMessage }} params
 * @returns {{ reply: string, pendingAction: object }}
 */
async function processMessage({ userId, userRole, userName, userMessage }) {
  // 1. Load or create chat history
  let history = await ChatHistory.findOne({ userId, userRole });
  if (!history) {
    history = new ChatHistory({ userId, userRole, messages: [], pendingAction: {} });
  }

  const pending = history.pendingAction || {};

  // 2. Handle confirmation for pending authority actions
  if (pending.awaitingConfirm && userRole === 'authority') {
    const confirmYes = /\b(yes|confirm|ok|okay|proceed|sure|do it|yep|yeah)\b/i.test(userMessage);
    const confirmNo  = /\b(no|cancel|stop|abort|nevermind|nope)\b/i.test(userMessage);

    if (confirmYes) {
      history.addMessage('user', userMessage);
      const result = await executeAuthorityAction(pending.intent, pending.collectedFields, userId);
      history.pendingAction = {};
      history.addMessage('assistant', result.message);
      await history.save();
      return { reply: result.message, pendingAction: {} };
    }
    if (confirmNo) {
      history.addMessage('user', userMessage);
      const reply = 'Action cancelled. How else can I help you?';
      history.pendingAction = {};
      history.addMessage('assistant', reply);
      await history.save();
      return { reply, pendingAction: {} };
    }
  }

  // 3. Build intent-parsing messages
  const systemPrompt = buildSystemPrompt(userRole);
  const recentHistory = history.messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));

  // If a pending multi-step flow is in progress, inject context into the system prompt
  let augmentedSystem = systemPrompt;
  if (pending.intent && !pending.awaitingConfirm && Object.keys(pending.collectedFields || {}).length > 0) {
    augmentedSystem += `\n\nONGOING WORKFLOW: intent="${pending.intent}", collected so far=${JSON.stringify(pending.collectedFields)}, still missing=${JSON.stringify(pending.missingFields)}.
Extract any new values from the user's latest message and update missingFields accordingly.`;
  }

  const hfMessages = [
    { role: 'system', content: augmentedSystem },
    ...recentHistory,
    { role: 'user',   content: userMessage },
  ];

  // 4. Call HF API → parse intent
  let intentObj;
  try {
    const raw = await callHF(hfMessages);
    intentObj = parseIntentResponse(raw);
  } catch (err) {
    console.error('[Chatbot] HF API error:', err.message);
    history.addMessage('user', userMessage);
    history.addMessage('assistant', CHATBOT_OFFLINE_MSG);
    await history.save();
    return { reply: CHATBOT_OFFLINE_MSG, pendingAction: pending };
  }

  const { intent, entities, missingFields, responseText } = intentObj;

  const roleValidIntents = {
    commuter: ['search_route', 'get_fare', 'get_stops', 'get_schedule', 'get_crowd_status', 'general_help', 'unknown'],
    driver: ['view_assigned_bus', 'submit_duty_update', 'search_route', 'get_fare', 'get_stops', 'get_schedule', 'get_crowd_status', 'report_incident', 'general_help', 'unknown'],
    conductor: ['view_assigned_bus', 'submit_duty_update', 'search_route', 'get_fare', 'get_stops', 'get_schedule', 'get_crowd_status', 'report_incident', 'general_help', 'unknown'],
    authority: ['view_incidents', 'view_crowd_reports', 'add_transport', 'update_transport', 'delete_transport', 'pause_transport', 'resume_transport', 'add_route', 'delete_route', 'delete_incident', 'search_route', 'get_fare', 'get_stops', 'general_help', 'unknown']
  };

  const allowed = roleValidIntents[userRole] || roleValidIntents.commuter;
  
  if (!allowed.includes(intent) || intent === 'unauthorized') {
    const invalidReply = 'no access to the data';
    history.addMessage('user', userMessage);
    history.addMessage('assistant', invalidReply);
    await history.save();
    return { reply: invalidReply, pendingAction: {} };
  }

  // 5. For multi-step authority flows, merge collected fields
  if (userRole === 'authority' && ['add_transport', 'delete_transport', 'pause_transport', 'resume_transport', 'delete_incident', 'add_route', 'delete_route'].includes(intent)) {
    const newPending = {
      intent,
      collectedFields: { ...((pending.intent === intent ? pending.collectedFields : {})), ...entities },
      missingFields:   missingFields,
      awaitingConfirm: missingFields.length === 0,
    };

    let reply;
    if (missingFields.length > 0) {
      // Ask for next missing field
      reply = responseText || `Got it! What is the ${missingFields[0]}?`;
    } else {
      // All fields collected — show summary and ask for confirmation
      const summary = Object.entries(newPending.collectedFields)
        .map(([k, v]) => `• ${k}: ${v}`)
        .join('\n');
      reply = responseText || `Here's a summary of what I'll do:\n${summary}\n\nShall I proceed? (Yes/No)`;
      newPending.awaitingConfirm = true;
    }

    history.addMessage('user',      userMessage);
    history.addMessage('assistant', reply);
    history.pendingAction = newPending;
    await history.save();
    return { reply, pendingAction: newPending };
  }

  // 6. Reset pending action for non-multi-step intents
  history.pendingAction = {};

  // 7. Dispatch intent → fetch DB data
  let dbResult = { dbData: null, dataType: null };
  try {
    if (userRole === 'authority') {
      dbResult = await dispatchAuthority(intent, entities, userId, pending, userMessage);
    } else if (userRole === 'driver' || userRole === 'conductor') {
      dbResult = await dispatchDriverConductor(intent, entities, userId);
    } else {
      dbResult = await dispatchCommuter(intent, entities);
    }
  } catch (err) {
    console.error('[Chatbot] DB dispatch error:', err.message);
  }

  const { dbData, dataType } = dbResult;

  // 8. Build reply
  let reply;
  if (intent === 'unknown' || intent === 'general_help') {
    reply = responseText || "I'm here to help with transit information. Ask me about routes, fares, schedules, or incidents!";
  } else if (
    dbData === null ||
    (Array.isArray(dbData) && dbData.length === 0)
  ) {
    reply = 'No data found.';
  } else {
    // Pass DB data to LLM for natural language formatting
    try {
      reply = await formatWithLLM(dbData, dataType, userMessage, userRole, history.messages);
    } catch {
      reply = CHATBOT_OFFLINE_MSG;
    }
  }

  // 9. Save history and return
  history.addMessage('user',      userMessage);
  history.addMessage('assistant', reply);
  await history.save();

  return { reply, pendingAction: {} };
}

module.exports = { processMessage };
