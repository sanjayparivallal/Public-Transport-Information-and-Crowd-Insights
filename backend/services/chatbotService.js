'use strict';
/**
 * chatbotService.js
 *
 * Pipeline:
 *   1. Load/create ChatHistory for user
 *   2. Normalize user input
 *   3. Build role-specific system prompt
 *   4. Call HF Inference API (with retry) → structured intent JSON
 *   5. Dispatch intent → fetch DB data (reusing existing services/models)
 *   6. Strip image fields from all DB results
 *   7. Pass DB context back to LLM for natural-language formatting
 *   8. Save updated history
 *   9. Return { reply, pendingAction }
 */

const mongoose      = require('mongoose');
const ChatHistory   = require('../models/ChatHistory');
const Transport     = require('../models/Transport');
const Route         = require('../models/Route');
const User          = require('../models/User');
const Authority     = require('../models/Authority');
const Incident      = require('../models/Incident');
const CrowdReport   = require('../models/CrowdReport');
const LivePosition  = require('../models/LivePosition');
const transportSvc  = require('./transportService');
const routeSvc      = require('./routeService');
const crowdSvc      = require('./crowdService');

// ─── Standard reply constants ─────────────────────────────────────────────────

const MSG_NO_DATA       = 'No relevant data found for this query.';
const MSG_NO_ACCESS     = "I don't have access to that information.";
const MSG_OFFLINE       = "I'm currently unable to process your request due to a connectivity issue. Please try again in a moment.";
const MSG_GENERAL_HELP  = "I'm here to help with transit information. Ask me about routes, fares, schedules, or crowd status!";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Escape special RegExp characters in a string so user input is always treated
 * as a literal search term, not a regex pattern (prevents ReDoS).
 */
function escapeRegex(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalize user input: trim edges, collapse internal whitespace, and strip
 * common Unicode smart-quotes/apostrophes that might confuse the LLM.
 */
function normalizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/\s+/g, ' ')                // collapse multiple spaces/tabs/newlines
    .replace(/[\u2018\u2019]/g, "'")     // smart single quotes → '
    .replace(/[\u201C\u201D]/g, '"')     // smart double quotes → "
    .replace(/[\u2013\u2014]/g, '-');    // en/em dash → hyphen
}

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
  delete copy.__v;
  delete copy.passwordHash;
  delete copy.refreshTokenHash;
  return stripImages(copy);
}

/** Sleep helper for retry delays */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── HF Inference API ─────────────────────────────────────────────────────────

const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';

/** Make a single call to the Hugging Face API */
async function callHF(messages) {
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(HF_API_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_TOKEN || process.env.HF_API_KEY}`,
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
      const err     = new Error(`HF API HTTP ${res.status}: ${errBody}`);
      err.statusCode = res.status;
      throw err;
    }

    const data    = await res.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Call HF with one automatic retry on transient network errors or 5xx responses.
 * Client errors (4xx) are not retried.
 */
async function callHFWithRetry(messages) {
  try {
    return await callHF(messages);
  } catch (firstErr) {
    const status = firstErr.statusCode || 0;
    // Only retry on network errors (no statusCode) or server-side 5xx
    if (status >= 400 && status < 500) throw firstErr;

    console.warn('[Chatbot] HF API call failed, retrying in 1.5 s…', firstErr.message);
    await sleep(1500);
    return callHF(messages); // let the second failure propagate
  }
}

/** Parse the LLM response into a guaranteed-shape intent object */
function parseIntentResponse(raw) {
  if (!raw || !raw.trim()) {
    return { intent: 'general_help', entities: {}, missingFields: [], responseText: MSG_GENERAL_HELP };
  }
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

function buildSystemPrompt(role, userName) {
  const base = `You are a transit information assistant for a Tamil Nadu public transport system, currently talking to a user named ${userName || 'Commuter'}.
You MUST respond with a valid JSON object in EXACTLY this format (no extra text outside the JSON):
{
  "intent": "<intent_name>",
  "entities": { <key-value pairs extracted from the user message> },
  "missingFields": [ <list of field names still needed> ],
  "responseText": "<natural language reply to show the user>"
}

STRICT RULES:
- Your ONLY job is to identify the intent and extract EVERY POSSIBLE ENTITY from the user's message.
- Tolerate minor typos and abbreviations when identifying intents and entities (e.g. "buss"→"bus", "schedual"→"schedule", "rout"→"route").
- "details of [BUS]" literally means intent="search_route" and busName="[BUS]". NEVER LEAVE ENTITIES EMPTY IF A TRANSPORT IS MENTIONED!
- Do NOT attempt to answer transit questions in responseText unless you are asking to clarify a missing field or acknowledging a command.
- If the user asks for unauthorized data or restricted actions (like managing fleets if they are a commuter), set intent to "unauthorized" and responseText to "${MSG_NO_ACCESS}".
- Keep responseText concise and friendly.`;

  const rolePrompts = {
    commuter: `${base}

Your role is COMMUTER assistant.
Valid intents: search_route, get_fare, get_stops, get_schedule, get_crowd_status, general_help, unknown.

For search_route: Use this intent when the user asks for routes, "details", or "information" about specific buses or locations. Extract: origin, destination, busName (even if there are multiple buses, put them all in busName), routeNumber.
For get_fare, extract: origin, destination, routeNumber (any combination).
For get_stops, extract: routeNumber or busName.
For get_schedule, extract: routeNumber or busName, departureTime (optional).
For get_crowd_status, extract: routeNumber or busName.`,

    driver: `${base}

Your role is DRIVER/CONDUCTOR assistant.
Valid intents: view_assigned_bus, update_live_tracking, search_route, get_fare, get_stops, get_schedule, get_crowd_status, report_incident, general_help, unknown.

For update_live_tracking, required: origin, destination (to identify your current route direction). Optional: currentStop, availableSeats, crowdLevel, status (on-time|delayed), delayMinutes.
For report_incident, extract: incidentType (delay|breakdown|accident|overcrowding|other), severity (low|medium|high|critical), description, location.`,

    conductor: `${base}

Your role is CONDUCTOR assistant. Same as driver.
Valid intents: view_assigned_bus, update_live_tracking, search_route, get_fare, get_stops, get_schedule, get_crowd_status, report_incident, general_help, unknown.

For update_live_tracking, required: origin, destination (to identify your current route direction). Optional: currentStop, availableSeats, crowdLevel, status (on-time|delayed), delayMinutes.
For report_incident, extract: incidentType (delay|breakdown|accident|overcrowding|other), severity (low|medium|high|critical), description, location.`,

    authority: `${base}

Your role is TRANSPORT AUTHORITY assistant.
Valid intents: view_incidents, view_crowd_reports, view_my_fleet, add_transport, update_transport, delete_transport, pause_transport, resume_transport, add_route, delete_route, delete_incident, update_live_tracking, search_route, get_fare, get_stops, get_crowd_status, general_help, unknown.

For add_transport, required fields: transportNumber, name, type (bus|train). Optional: operator, totalSeats, vehicleNumber, amenities.
For update_transport, required: transportNumber or name to identify transport. Include only fields to update.
For delete_transport / pause_transport / resume_transport, required: transportNumber or name.
For add_route, required: transportNumber or name (which transport), routeNumber, routeName, origin, destination. Optional: totalDistance, estimatedDuration, stops.
For delete_route, required: routeNumber.
For update_live_tracking, required: transportNumber or name, origin, destination (to identify the exact route). Optional: currentStop, availableSeats, crowdLevel, status (on-time|delayed), delayMinutes.
For delete_incident, required: incidentId (user may refer by description — extract what they give).
For view_incidents, extract: status (open|acknowledged|resolved), severity, transportNumber (all optional filters). Use this when asking for incidents, reports, or counts of incidents.
For view_crowd_reports, extract: transportNumber (optional).
For view_my_fleet, no extra entities are needed. Use this when the user asks about their own fleet, buses under their control, or transport count.
For search_route: Use this intent when the user asks for routes, "details", or "information" about specific buses or locations. Extract: origin, destination, busName (even if there are multiple buses, put them all in busName), routeNumber.
For get_fare / get_stops / get_schedule / get_crowd_status, extract: routeNumber or busName.

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
    return result.results.map((r) => {
      const clean = cleanDoc(r);
      const transportSnippet = clean.transportId ? {
        transportNumber: clean.transportId.transportNumber,
        name:            clean.transportId.name,
        type:            clean.transportId.type,
        amenities:       (clean.transportId.amenities || []).slice(0, 3),
        totalSeats:      clean.transportId.totalSeats,
      } : null;

      const simpleStops = (clean.stops || []).map((s) => s.stopName).slice(0, 10);

      return {
        routeNumber:       clean.routeNumber,
        routeName:         clean.routeName,
        origin:            clean.origin,
        destination:       clean.destination,
        estimatedDuration: clean.estimatedDuration,
        transport:         transportSnippet,
        stops:             simpleStops.length > 0 ? simpleStops : undefined,
        departureTime:     clean.schedule?.departureTime,
        availableSeats:    clean.availableSeats,
        crowdLevel:        clean.crowdLevel,
      };
    });
  } catch (err) {
    console.error('[Chatbot] fetchRoutes error:', err.message);
    return [];
  }
}

async function fetchAssignedBus(userId) {
  try {
    const user = await User.findById(userId)
      .populate({ path: 'assignedTransport', populate: { path: 'authorityId', select: 'organizationName' } })
      .lean();
    if (!user?.assignedTransport) return null;
    const routes = await Route.find({ transportId: user.assignedTransport._id }).lean();
    return cleanDoc({ ...user.assignedTransport, routes: routes.map(cleanDoc) });
  } catch (err) {
    console.error('[Chatbot] fetchAssignedBus error:', err.message);
    return null;
  }
}

async function fetchIncidents(authorityId, filters = {}) {
  try {
    const managedTransports = await Transport.find({ authorityId }, '_id').lean();
    const tIds  = managedTransports.map((t) => t._id);
    const query = { transportId: { $in: tIds } };

    const validStatuses   = ['open', 'acknowledged', 'resolved'];
    const validSeverities = ['low', 'medium', 'high', 'critical'];

    if (filters.status && validStatuses.includes(String(filters.status).toLowerCase())) {
      query.status = String(filters.status).toLowerCase();
    }
    if (filters.severity && validSeverities.includes(String(filters.severity).toLowerCase())) {
      query.severity = String(filters.severity).toLowerCase();
    }
    if (filters.transportId) query.transportId = filters.transportId;

    const incidents = await Incident.find(query)
      .sort({ reportedAt: -1 })
      .populate('transportId', 'transportNumber name')
      .populate('reportedBy',  'name role')
      .select('-img')
      .lean();
    return incidents.map(cleanDoc);
  } catch (err) {
    console.error('[Chatbot] fetchIncidents error:', err.message);
    return [];
  }
}

async function fetchCrowdReports(authorityId, filters = {}) {
  try {
    const managedTransports = await Transport.find({ authorityId }, '_id').lean();
    const tIds   = managedTransports.map((t) => t._id);
    const routes = await Route.find({ transportId: { $in: tIds } }, '_id origin destination').lean();
    const rIds   = routes.map((r) => r._id);
    const routeMap = {};
    routes.forEach((r) => { routeMap[String(r._id)] = r; });

    const reports = await CrowdReport.find({ routeId: { $in: rIds } })
      .sort({ reportedAt: -1 })
      .populate('reportedBy', 'name')
      .lean();

    return reports.map((r) => ({
      ...cleanDoc(r),
      route: routeMap[String(r.routeId)] || null,
    }));
  } catch (err) {
    console.error('[Chatbot] fetchCrowdReports error:', err.message);
    return [];
  }
}

/**
 * Find a transport by transportNumber or name using escaped regex (safe from ReDoS).
 */
async function findTransportByIdentifier(authorityId, identifier) {
  if (!identifier) return null;
  const safePattern = escapeRegex(String(identifier).trim());
  const query = {
    authorityId,
    $or: [
      { transportNumber: { $regex: safePattern, $options: 'i' } },
      { name:            { $regex: safePattern, $options: 'i' } },
    ],
  };
  return Transport.findOne(query).lean();
}

// ─── Pre-action field validation ──────────────────────────────────────────────

/**
 * Returns a string error message if required fields are missing, else null.
 */
function validateCollectedFields(actionIntent, collectedFields) {
  const f = collectedFields || {};

  const hasIdentifier = !!(f.transportNumber || f.name || f.transportName || f.busName);

  const required = {
    add_transport:      () => !f.transportNumber ? 'transportNumber' : !f.name ? 'name' : !f.type ? 'type (bus or train)' : null,
    update_transport:   () => !hasIdentifier ? 'transport name or number' : null,
    delete_transport:   () => !hasIdentifier ? 'transport name or number' : null,
    pause_transport:    () => !hasIdentifier ? 'transport name or number' : null,
    resume_transport:   () => !hasIdentifier ? 'transport name or number' : null,
    add_route:          () => !hasIdentifier ? 'transport name or number' : !f.routeNumber ? 'routeNumber' : !f.origin ? 'origin' : !f.destination ? 'destination' : null,
    delete_route:       () => !f.routeNumber ? 'routeNumber' : null,
    delete_incident:    () => !f.incidentId ? 'incidentId' : null,
    update_live_tracking: () => !f.origin ? 'origin' : !f.destination ? 'destination' : null,
  };

  const checker = required[actionIntent];
  if (!checker) return null;
  const missingField = checker();
  return missingField ? `Missing required field: ${missingField}. Please provide it before proceeding.` : null;
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
  // Intent is not actionable but is valid (general_help, unknown)
  return { dbData: null, dataType: 'no_handler' };
}

async function dispatchDriverConductor(intent, entities, userId) {
  if (intent === 'view_assigned_bus') {
    const bus = await fetchAssignedBus(userId);
    return { dbData: bus, dataType: 'assigned_bus' };
  }
  if (intent === 'update_live_tracking') {
    return { dbData: null, dataType: 'multi_step', needsDB: false };
  }
  if (intent === 'report_incident') {
    // Acknowledge the intent — actual DB write is done through the Incident API
    // (chatbot does not write incidents directly on behalf of driver/conductor)
    return { dbData: null, dataType: 'incident_ack' };
  }
  // Fall through to commuter read-intents
  return dispatchCommuter(intent, entities);
}

async function dispatchAuthority(intent, entities, userId, pending, userMessage) {
  switch (intent) {
    case 'view_my_fleet': {
      const fleet = await Transport.find({ authorityId: userId })
        .sort({ isActive: -1, name: 1 })
        .lean();
      return { dbData: fleet.map(cleanDoc), dataType: 'my_fleet' };
    }
    case 'view_incidents': {
      let tFilter = {};
      if (entities.transportNumber) {
        const t = await findTransportByIdentifier(userId, entities.transportNumber);
        if (t) tFilter.transportId = t._id;
      }
      const incidents = await fetchIncidents(userId, {
        status:   entities.status,
        severity: entities.severity,
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
    case 'get_crowd_status':
      return dispatchCommuter(intent, entities);

    case 'add_transport':
      return { dbData: null, dataType: 'multi_step', needsDB: false };

    case 'update_transport':
    case 'delete_transport':
    case 'pause_transport':
    case 'resume_transport': {
      const identifier = entities.transportNumber || entities.name || entities.transportName || entities.busName;
      if (!identifier) return { dbData: null, dataType: 'multi_step', needsDB: false };
      const t = await findTransportByIdentifier(userId, identifier);
      if (!t) return { dbData: null, dataType: 'not_found' };
      return { dbData: cleanDoc(t), dataType: 'transport_for_action', actionIntent: intent };
    }
    case 'delete_incident': {
      const incidentId = entities.incidentId;
      if (!incidentId || !mongoose.isValidObjectId(incidentId)) {
        return { dbData: null, dataType: 'multi_step', needsDB: false };
      }
      const inc = await Incident.findById(incidentId).select('-img').lean();
      if (!inc) return { dbData: null, dataType: 'not_found' };
      return { dbData: cleanDoc(inc), dataType: 'incident_for_delete', actionIntent: 'delete_incident' };
    }
    default:
      return { dbData: null, dataType: 'no_handler' };
  }
}

// ─── Execute confirmed authority actions ──────────────────────────────────────

async function executeAuthorityAction(actionIntent, collectedFields, userId) {
  // Validate required fields before writing to DB
  const validationError = validateCollectedFields(actionIntent, collectedFields);
  if (validationError) return { success: false, message: validationError };

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
          amenities:       collectedFields.amenities
            ? String(collectedFields.amenities).split(',').map((a) => a.trim())
            : [],
        });
        return { success: true, message: `Transport "${t.name}" (${t.transportNumber}) has been added successfully.` };
      }
      case 'pause_transport': {
        const ident = collectedFields.transportNumber || collectedFields.name || collectedFields.transportName || collectedFields.busName;
        const t = await findTransportByIdentifier(userId, ident);
        if (!t) return { success: false, message: MSG_NO_DATA };
        await transportSvc.updateTransport(userId, String(t._id), { isActive: false });
        return { success: true, message: `Transport "${t.name}" has been paused.` };
      }
      case 'resume_transport': {
        const ident = collectedFields.transportNumber || collectedFields.name || collectedFields.transportName || collectedFields.busName;
        const t = await findTransportByIdentifier(userId, ident);
        if (!t) return { success: false, message: MSG_NO_DATA };
        await transportSvc.updateTransport(userId, String(t._id), { isActive: true });
        return { success: true, message: `Transport "${t.name}" has been resumed.` };
      }
      case 'update_transport': {
        const ident = collectedFields.transportNumber || collectedFields.name || collectedFields.transportName || collectedFields.busName;
        const t = await findTransportByIdentifier(userId, ident);
        if (!t) return { success: false, message: `${MSG_NO_DATA} Please specify the correct transport number or name.` };

        const updates = { ...collectedFields };
        delete updates.transportNumber;
        delete updates.name;
        delete updates.transportName;
        delete updates.busName;

        await transportSvc.updateTransport(userId, String(t._id), updates);
        return { success: true, message: `Transport "${t.name}" has been updated successfully.` };
      }
      case 'delete_transport': {
        const ident = collectedFields.transportNumber || collectedFields.name || collectedFields.transportName || collectedFields.busName;
        const t = await findTransportByIdentifier(userId, ident);
        if (!t) return { success: false, message: MSG_NO_DATA };
        await transportSvc.deleteTransport(userId, String(t._id));
        return {
          success: true,
          message: `Transport "${t.name}" and all associated routes, incidents, and crowd data have been permanently deleted.`,
        };
      }
      case 'add_route': {
        const ident = collectedFields.transportNumber || collectedFields.name || collectedFields.transportName || collectedFields.busName;
        const t = await findTransportByIdentifier(userId, ident);
        if (!t) return { success: false, message: `${MSG_NO_DATA} Please provide a valid transport name or number.` };

        await routeSvc.createRoute(userId, String(t._id), {
          routeNumber:       collectedFields.routeNumber,
          routeName:         collectedFields.routeName,
          origin:            collectedFields.origin,
          destination:       collectedFields.destination,
          totalDistance:     collectedFields.totalDistance ? Number(collectedFields.totalDistance) : undefined,
          estimatedDuration: collectedFields.estimatedDuration,
        });
        return {
          success: true,
          message: `Route ${collectedFields.routeNumber} '${collectedFields.routeName}' has been successfully added to transport "${t.name}".`,
        };
      }
      case 'delete_route': {
        const route = await Route.findOne({ routeNumber: collectedFields.routeNumber }).lean();
        if (!route) return { success: false, message: `Route ${collectedFields.routeNumber} not found.` };

        await routeSvc.deleteRoute(userId, String(route.transportId), String(route._id));
        return { success: true, message: `Route ${collectedFields.routeNumber} has been deleted successfully.` };
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
    console.error('[Chatbot] executeAuthorityAction error:', err.message);
    return { success: false, message: err.message || 'Action failed.' };
  }
}

async function executeLiveTrackingUpdate(collectedFields, userId, userRole) {
  // Validate required fields before hitting DB
  const validationError = validateCollectedFields('update_live_tracking', collectedFields);
  if (validationError) return { success: false, message: validationError };

  try {
    let t;
    if (userRole === 'authority') {
      const ident = collectedFields.transportNumber || collectedFields.name || collectedFields.transportName || collectedFields.busName;
      t = await Transport.findOne({
        authorityId: userId,
        isActive:    true,
        $or: [
          { transportNumber: new RegExp(escapeRegex(ident), 'i') },
          { name:            new RegExp(escapeRegex(ident), 'i') },
        ],
      });
      if (!t) return { success: false, message: 'Transport not found in your fleet.' };
    } else {
      const u = await User.findById(userId).select('assignedTransport').lean();
      if (!u || !u.assignedTransport) return { success: false, message: 'You are not assigned to any transport.' };
      t = await Transport.findById(u.assignedTransport);
      if (!t) return { success: false, message: 'Assigned transport not found.' };
    }

    const originSafe = escapeRegex(collectedFields.origin);
    const destSafe   = escapeRegex(collectedFields.destination);

    const route = await Route.findOne({
      transportId:  t._id,
      origin:      { $regex: originSafe, $options: 'i' },
      destination: { $regex: destSafe,   $options: 'i' },
    });

    if (!route) {
      return {
        success: false,
        message: `Could not find a route from ${collectedFields.origin} to ${collectedFields.destination} for this transport.`,
      };
    }

    const updatedByModel = userRole === 'authority' ? 'Authority' : 'User';

    // 1. Update LivePosition
    await LivePosition.findOneAndUpdate(
      { transportId: t._id, routeId: route._id },
      {
        transportId:   t._id,
        routeId:       route._id,
        currentStop:   collectedFields.currentStop,
        status:        collectedFields.status || 'on-time',
        delayMinutes:  collectedFields.delayMinutes || 0,
        updatedBy:     userId,
        updatedByModel,
        updatedByRole: userRole,
      },
      { upsert: true, setDefaultsOnInsert: true }
    );

    // 2. Update Crowd Level
    if (collectedFields.crowdLevel) {
      await crowdSvc.updateCrowdLevel(userId, userRole, {
        transportId:  t._id,
        routeId:      route._id,
        crowdLevel:   collectedFields.crowdLevel,
        currentStop:  collectedFields.currentStop,
        manualSeats:  collectedFields.availableSeats,
      });
    }

    // 3. Update Available Seats
    if (collectedFields.availableSeats) {
      await Route.findByIdAndUpdate(route._id, { availableSeats: Number(collectedFields.availableSeats) });
    }

    return { success: true, message: `Live tracking successfully updated for ${t.name || t.transportNumber}.` };
  } catch (err) {
    console.error('[Chatbot] executeLiveTrackingUpdate error:', err.message);
    return { success: false, message: err.message || 'Live tracking update failed.' };
  }
}

// ─── Format DB data via LLM (text-only) ──────────────────────────────────────

async function formatWithLLM(dbData, dataType, userMessage, role, conversationHistory) {
  let displayData = dbData;
  let summaryText = '';
  let totalCount = Array.isArray(dbData) ? dbData.length : 1;

  let extraContext = '';
  if (dataType === 'incidents' && Array.isArray(dbData)) {
    const active = dbData.filter((i) => i.status === 'open' || i.status === 'acknowledged').length;
    const resolved = dbData.filter((i) => i.status === 'resolved').length;
    extraContext = ` (Specifically: ${active} active, ${resolved} resolved). `;
  }

  if (Array.isArray(dbData) && dbData.length > 5) {
    displayData = dbData.slice(0, 5);
    summaryText = `IMPORTANT RULES FOR COUNTING: There are exactly ${dbData.length} records matching this query${extraContext}. *If the user asks for a count (e.g., "how many incidents"), DO NOT mention that you are only seeing 5 items!* Simply state "There are ${dbData.length} [items]" and mention the active/resolved breakdown if applicable.\n`;
  } else if (Array.isArray(dbData)) {
    summaryText = `There are exactly ${dbData.length} records matching this query${extraContext}.\n`;
  }

  // Empty array → no records, return immediately without an LLM call
  if (Array.isArray(dbData) && dbData.length === 0) {
    return MSG_NO_DATA;
  }

  const systemMsg = {
    role:    'system',
    content: `You are a friendly transit assistant. Format the database results below into a clear, helpful natural language response.
Rules:
- Use the data EXACTLY as provided — do not add or infer any extra information.
- If the database results are empty ([]), state: "${MSG_NO_DATA}"
- Don't expose MongoDB IDs or internal field names.
- Only mention information that is explicitly present in the data.
- Keep the response concise (under 300 words).
- ${summaryText}Database results: ${JSON.stringify(displayData)}
- Data type: ${dataType}`,
  };

  const history = conversationHistory.slice(-6).map((m) => ({ role: m.role, content: m.content }));
  history.push({ role: 'user', content: userMessage });

  try {
    const rawResponse = await callHFWithRetry([systemMsg, ...history]);
    return rawResponse.trim() || MSG_NO_DATA;
  } catch (err) {
    console.error('[Chatbot] formatWithLLM error:', err.message);
    return typeof dbData === 'object' && dbData && !Array.isArray(dbData)
      ? 'Here are the details from our records.'
      : MSG_NO_DATA;
  }
}

// ─── Main entry point ─────────────────────────────────────────────────────────

/**
 * processMessage — main chatbot pipeline
 * @param {{ userId, userRole, userName, userMessage }} params
 * @returns {{ reply: string, pendingAction: object }}
 */
async function processMessage({ userId, userRole, userName, userMessage }) {
  // Normalize input first
  const normalizedMessage = normalizeInput(userMessage);

  // Guard: if normalization produces empty string, reject early
  if (!normalizedMessage) {
    return { reply: MSG_GENERAL_HELP, pendingAction: {} };
  }

  // 1. Load or create chat history
  let history = await ChatHistory.findOne({ userId, userRole });
  if (!history) {
    history = new ChatHistory({ userId, userRole, messages: [], pendingAction: {} });
  }

  const pending = history.pendingAction || {};

  // 2. Handle confirmation for pending multi-step actions
  if (pending.awaitingConfirm) {
    const confirmYes = /\b(yes|confirm|ok|okay|proceed|sure|do it|yep|yeah)\b/i.test(normalizedMessage);
    const confirmNo  = /\b(no|cancel|stop|abort|nevermind|nope)\b/i.test(normalizedMessage);

    if (confirmYes) {
      history.addMessage('user', normalizedMessage);

      let result;
      if (pending.intent === 'update_live_tracking') {
        result = await executeLiveTrackingUpdate(pending.collectedFields, userId, userRole);
      } else if (userRole === 'authority') {
        result = await executeAuthorityAction(pending.intent, pending.collectedFields, userId);
      } else {
        result = { success: false, message: 'Action not supported for this role.' };
      }

      history.pendingAction = {};
      history.addMessage('assistant', result.message);
      await history.save();
      return { reply: result.message, pendingAction: {} };
    }
    if (confirmNo) {
      history.addMessage('user', normalizedMessage);
      const reply = 'Action cancelled. How else can I help you?';
      history.pendingAction = {};
      history.addMessage('assistant', reply);
      await history.save();
      return { reply, pendingAction: {} };
    }
  }

  // 3. Build intent-parsing messages
  const systemPrompt  = buildSystemPrompt(userRole, userName);
  const recentHistory = history.messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));

  // Inject ongoing workflow context if in progress
  let augmentedSystem = systemPrompt;
  if (pending.intent && !pending.awaitingConfirm && Object.keys(pending.collectedFields || {}).length > 0) {
    augmentedSystem += `\n\nONGOING WORKFLOW: intent="${pending.intent}", collected so far=${JSON.stringify(pending.collectedFields)}, still missing=${JSON.stringify(pending.missingFields)}.
Extract any new values from the user's latest message and update missingFields accordingly.`;
  }

  const hfMessages = [
    { role: 'system', content: augmentedSystem },
    ...recentHistory,
    { role: 'user',   content: normalizedMessage },
  ];

  // 4. Call HF API (with retry) → parse intent
  let intentObj;
  try {
    const raw = await callHFWithRetry(hfMessages);
    intentObj = parseIntentResponse(raw);
  } catch (err) {
    console.error('[Chatbot] HF API error after retry:', err.message);
    history.addMessage('user',      normalizedMessage);
    history.addMessage('assistant', MSG_OFFLINE);
    await history.save();
    return { reply: MSG_OFFLINE, pendingAction: pending };
  }

  const { intent, entities, missingFields, responseText } = intentObj;

  // Structured logging for debugging
  console.info(`[Chatbot] userId=${userId} role=${userRole} intent=${intent} entities=${JSON.stringify(entities)}`);

  const roleValidIntents = {
    commuter:  ['search_route', 'get_fare', 'get_stops', 'get_schedule', 'get_crowd_status', 'general_help', 'unknown'],
    driver:    ['view_assigned_bus', 'update_live_tracking', 'search_route', 'get_fare', 'get_stops', 'get_schedule', 'get_crowd_status', 'report_incident', 'general_help', 'unknown'],
    conductor: ['view_assigned_bus', 'update_live_tracking', 'search_route', 'get_fare', 'get_stops', 'get_schedule', 'get_crowd_status', 'report_incident', 'general_help', 'unknown'],
    authority: ['view_incidents', 'view_crowd_reports', 'view_my_fleet', 'add_transport', 'update_transport', 'delete_transport', 'pause_transport', 'resume_transport', 'add_route', 'delete_route', 'delete_incident', 'update_live_tracking', 'search_route', 'get_fare', 'get_stops', 'get_crowd_status', 'general_help', 'unknown'],
  };

  const allowed = roleValidIntents[userRole] || roleValidIntents.commuter;

  if (!allowed.includes(intent) || intent === 'unauthorized') {
    history.addMessage('user',      normalizedMessage);
    history.addMessage('assistant', MSG_NO_ACCESS);
    await history.save();
    return { reply: MSG_NO_ACCESS, pendingAction: {} };
  }

  // 5. For multi-step flows, merge collected fields
  const authorityFlows = ['add_transport', 'update_transport', 'delete_transport', 'pause_transport', 'resume_transport', 'delete_incident', 'add_route', 'delete_route'];
  const liveFlow       = ['update_live_tracking'];

  const isMultiStep =
    (userRole === 'authority' && authorityFlows.concat(liveFlow).includes(intent)) ||
    ((userRole === 'driver' || userRole === 'conductor') && liveFlow.includes(intent));

  if (isMultiStep) {
    const newPending = {
      intent,
      collectedFields: { ...((pending.intent === intent ? pending.collectedFields : {})), ...entities },
      missingFields,
      awaitingConfirm: missingFields.length === 0,
    };

    let reply;
    if (missingFields.length > 0) {
      reply = responseText || `Got it! What is the ${missingFields[0]}?`;
    } else {
      const summary = Object.entries(newPending.collectedFields)
        .map(([k, v]) => `• ${k}: ${v}`)
        .join('\n');
      reply = `I have collected the following details:\n${summary}\n\nShall I execute this action? (Yes/No)`;
      newPending.awaitingConfirm = true;
    }

    history.addMessage('user',      normalizedMessage);
    history.addMessage('assistant', reply);
    history.pendingAction = newPending;
    await history.save();
    return { reply, pendingAction: newPending };
  }

  // 6. Reset pending action for non-multi-step intents
  history.pendingAction = {};

  // 7. Dispatch intent → fetch DB data
  let dbResult = { dbData: null, dataType: 'no_handler' };
  try {
    if (userRole === 'authority') {
      dbResult = await dispatchAuthority(intent, entities, userId, pending, normalizedMessage);
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
    reply = responseText || MSG_GENERAL_HELP;

  } else if (dataType === 'incident_ack') {
    // Driver/conductor reporting an incident — guide them to the proper UI
    reply = "I've noted your incident report. Please use the **Report Incident** section in the app to submit the full details so it's recorded in the system. Is there anything else I can help you with?";

  } else if (dataType === 'no_handler' || dbData === null) {
    // The intent was valid for the role but there's no DB result
    reply = MSG_NO_ACCESS;

  } else if (dataType === 'not_found') {
    reply = MSG_NO_DATA;

  } else {
    // Pass DB data to LLM for natural language formatting
    try {
      reply = await formatWithLLM(dbData, dataType, normalizedMessage, userRole, history.messages);
    } catch {
      reply = MSG_OFFLINE;
    }
  }

  // 9. Save history and return
  history.addMessage('user',      normalizedMessage);
  history.addMessage('assistant', reply);
  await history.save();

  return { reply, pendingAction: {} };
}

module.exports = { processMessage };
