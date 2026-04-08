require('dotenv').config();

const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';

async function callHF(messages) {
  const res = await fetch(HF_API_URL, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HF_TOKEN || process.env.HF_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/Meta-Llama-3-8B-Instruct',
      messages,
      max_tokens: 1024,
      temperature: 0.1,
    }),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`HF API HTTP ${res.status}: ${errBody}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

const base = `You are a transit information assistant for a Tamil Nadu public transport system, currently talking to a user named TNSTC - Salem.
You MUST respond with a valid JSON object in EXACTLY this format (no extra text outside the JSON):
{
  "intent": "<intent_name>",
  "entities": { <key-value pairs extracted from the user message> },
  "missingFields": [ <list of field names still needed> ],
  "responseText": "<natural language reply to show the user>"
}

STRICT RULES:
- Your ONLY job is to identify the intent and extract EVERY POSSIBLE ENTITY from the user's message.
- "details of [BUS]" literally means intent="search_route" and busName="[BUS]". NEVER LEAVE ENTITIES EMPTY IF A TRANSPORT IS MENTIONED!
- Do NOT attempt to answer transit questions in responseText unless you are asking to clarify a missing field or acknowledging a command.
- If the user asks for unauthorized data or restricted actions (like managing fleets if they are a commuter), set intent to "unauthorized" and responseText to "no access to the data".
- Keep responseText concise and friendly.

Your role is TRANSPORT AUTHORITY assistant.
Valid intents: view_incidents, view_crowd_reports, view_my_fleet, add_transport, update_transport, delete_transport, pause_transport, resume_transport, add_route, delete_route, delete_incident, update_live_tracking, search_route, get_fare, get_stops, general_help, unknown.

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
When all fields are collected (missingFields is empty), set intent accordingly and ask for confirmation in responseText.`;

async function test(msg) {
    console.log(`Testing query: "${msg}"`);
    try {
        const raw = await callHF([
            { role: 'system', content: base },
            { role: 'user', content: msg }
        ]);
        console.log("Response:", raw);
    } catch(e) { console.error(e); }
}

test("show incidents under my control").then(() => {
    return test("show count of all incident under me");
});
