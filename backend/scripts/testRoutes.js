/**
 * API route tester — runs against http://localhost:5000
 * Usage: node backend/scripts/testRoutes.js
 */

'use strict';

const BASE = 'http://localhost:5000';

let passed = 0;
let failed = 0;
const results = [];

// ── HTTP helpers ─────────────────────────────────────────────────────────────
async function req(method, path, { body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try { data = await res.json(); } catch { data = {}; }
  return { status: res.status, data };
}

// ── Assertion helper ─────────────────────────────────────────────────────────
function assert(label, condition, detail = '') {
  if (condition) {
    passed++;
    results.push(`  ✔  ${label}`);
  } else {
    failed++;
    results.push(`  ✘  ${label}${detail ? ' — ' + detail : ''}`);
  }
}

// ── State shared across tests ────────────────────────────────────────────────
let authorityToken, authorityRefreshToken;
let driverToken;
let commuterToken, commuterRefreshToken;
let transportId, routeId, incidentId;

// ── Tests ────────────────────────────────────────────────────────────────────

async function testHealthCheck() {
  console.log('\n[1] Health Check');
  const { status, data } = await req('GET', '/');
  assert('GET /  → 200', status === 200, `status=${status}`);
  assert('GET /  → success=true', data.success === true);
}

async function testAuthority() {
  console.log('\n[2] Authority Login');
  const { status, data } = await req('POST', '/api/auth/login', {
    body: { email: 'admin@tnstc-nth.tn.gov.in', password: 'Password@123' },
  });
  assert('Authority login → 200', status === 200, `status=${status} msg=${data.message}`);
  assert('Authority login → accessToken', !!data.data?.accessToken);
  assert('Authority login → role=authority', data.data?.authority?.role === 'authority' || data.data?.user?.role === 'authority');
  authorityToken = data.data?.accessToken;
  authorityRefreshToken = data.data?.refreshToken;
}

async function testDriverLogin() {
  console.log('\n[3] Driver Login');
  const { status, data } = await req('POST', '/api/auth/login', {
    body: { email: 'murugan.s@tnstc-nth.in', password: 'Password@123' },
  });
  assert('Driver login → 200', status === 200, `status=${status} msg=${data.message}`);
  assert('Driver login → accessToken', !!data.data?.accessToken);
  assert('Driver login → role=driver', data.data?.user?.role === 'driver');
  driverToken = data.data?.accessToken;
}

async function testCommuterRegister() {
  console.log('\n[4] Commuter Register + Login');
  // Register
  const ts = Date.now();
  const { status: s1, data: d1 } = await req('POST', '/api/auth/register/commuter', {
    body: { name: 'Test Commuter', email: `commuter_${ts}@test.com`, password: 'Test@1234', phone: '9000000001' },
  });
  assert('Register commuter → 201', s1 === 201, `status=${s1} msg=${d1.message}`);
  commuterToken = d1.data?.accessToken;
  commuterRefreshToken = d1.data?.refreshToken;
}

async function testRegisterAuthorityDuplicate() {
  console.log('\n[5] Duplicate Authority Registration (should 409)');
  const { status, data } = await req('POST', '/api/auth/register/authority', {
    body: {
      name: 'Dupe', email: 'admin@tnstc-nth.tn.gov.in', password: 'Password@123',
      organizationName: 'Dupe Org', authorityCode: 'DUPE-001', region: 'Salem',
    },
  });
  assert('Duplicate authority → 409', status === 409, `status=${status}`);
}

async function testTokenRefresh() {
  console.log('\n[6] Token Refresh');
  // Commuter refresh
  const { status, data } = await req('POST', '/api/auth/refresh', {
    body: { refreshToken: commuterRefreshToken },
  });
  assert('Refresh token → 200', status === 200, `status=${status} msg=${data.message}`);
  assert('Refresh → new accessToken', !!data.data?.accessToken);
  // Update token to new one
  if (data.data?.accessToken) commuterToken = data.data.accessToken;
}

async function testUserProfile() {
  console.log('\n[7] User Profile');
  const { status, data } = await req('GET', '/api/users/profile', { token: commuterToken });
  assert('GET /api/users/profile → 200', status === 200, `status=${status}`);
  assert('Profile → has email', !!data.data?.email);
  assert('Profile → role=commuter', data.data?.role === 'commuter');
}

async function testNoTokenRejected() {
  console.log('\n[8] Protected route without token → 401');
  const { status } = await req('GET', '/api/users/profile');
  assert('No token → 401', status === 401, `status=${status}`);
}

async function testTransportSearch() {
  console.log('\n[9] Transport Search');
  // General search
  const { status, data } = await req('GET', '/api/transport/search?page=1&limit=10', { token: commuterToken });
  assert('Transport search → 200', status === 200, `status=${status}`);
  assert('Transport search → has results array', Array.isArray(data.data?.results));
  assert('Transport search → pagination present', !!data.data?.pagination);

  // Filter by origin
  const { status: s2, data: d2 } = await req('GET', '/api/transport/search?origin=Salem', { token: commuterToken });
  assert('Transport search origin=Salem → 200', s2 === 200, `status=${s2}`);

  // Authority scoped: myTransports=true
  const { status: s3, data: d3 } = await req('GET', '/api/transport/search?myTransports=true', { token: authorityToken });
  assert('Transport search myTransports=true (authority) → 200', s3 === 200, `status=${s3}`);
  assert('myTransports → results count <= 4', (d3.data?.results?.length ?? 0) <= 4);

  // Capture a transport ID for later tests
  if (d3.data?.results?.length > 0) {
    transportId = d3.data.results[0].transportId?._id || d3.data.results[0]._id;
  }
}

async function testTransportById() {
  console.log('\n[10] Transport By ID');
  if (!transportId) {
    results.push('  ⚠  Skipped (no transportId from search)');
    return;
  }
  const { status, data } = await req('GET', `/api/transport/${transportId}`, { token: commuterToken });
  assert('GET /api/transport/:id → 200', status === 200, `status=${status}`);
  assert('Transport detail → has transportNumber', !!data.data?.transportNumber);
  assert('Transport detail → has routes array', Array.isArray(data.data?.routes));
}

async function testCreateTransport() {
  console.log('\n[11] Create Transport (authority only)');
  // Should fail for commuter
  const { status: s1 } = await req('POST', '/api/transport', {
    token: commuterToken,
    body: { transportNumber: 'TST-999', name: 'Test Bus', type: 'bus' },
  });
  assert('Create transport as commuter → 403', s1 === 403, `status=${s1}`);

  // Should work for authority
  const ts = Date.now();
  const { status: s2, data: d2 } = await req('POST', '/api/transport', {
    token: authorityToken,
    body: { transportNumber: `TST-${ts}`, name: 'Test Bus Temporary', type: 'bus', totalSeats: 40 },
  });
  assert('Create transport as authority → 201', s2 === 201, `status=${s2} msg=${d2.message}`);
  if (d2.data?._id) {
    // Clean up — delete it
    const { status: sd } = await req('DELETE', `/api/transport/${d2.data._id}`, { token: authorityToken });
    assert('Delete the test transport → 200', sd === 200, `status=${sd}`);
  }
}

async function testGetRoutes() {
  console.log('\n[12] Routes for Transport');
  if (!transportId) {
    results.push('  ⚠  Skipped (no transportId)');
    return;
  }
  const { status, data } = await req('GET', `/api/transport/${transportId}/routes`, { token: commuterToken });
  assert('GET /api/transport/:id/routes → 200', status === 200, `status=${status}`);
  assert('Routes → is array', Array.isArray(data.data));
  if (data.data?.length > 0) routeId = data.data[0]._id;
}

async function testCrowdEndpoints() {
  console.log('\n[13] Crowd Endpoints');
  if (!transportId) {
    results.push('  ⚠  Skipped (no transportId)');
    return;
  }
  // GET crowd level
  const { status: s1, data: d1 } = await req('GET', `/api/crowd/${transportId}`, { token: commuterToken });
  assert('GET /api/crowd/:transportId → 200', s1 === 200, `status=${s1}`);

  // GET live position
  const { status: s2 } = await req('GET', `/api/crowd/live/${transportId}`, { token: commuterToken });
  assert('GET /api/crowd/live/:transportId → 200', s2 === 200, `status=${s2}`);

  // Commuter submits crowd report (requires routeId from the transport)
  if (routeId) {
    const { status: s3, data: d3 } = await req('POST', '/api/crowd/report', {
      token: commuterToken,
      body: { routeId, crowdLevel: 'average', boardingStop: 'Salem' },
    });
    assert('POST /api/crowd/report (commuter) → 201', s3 === 201, `status=${s3} msg=${d3.message}`);
  }

  // Driver updates official crowd level
  if (routeId) {
    const { status: s4, data: d4 } = await req('PUT', '/api/crowd/level', {
      token: driverToken,
      body: { transportId, routeId, tripId: 'SLM001-F-0600', crowdLevel: 'crowded', currentStop: 'Salem' },
    });
    assert('PUT /api/crowd/level (driver) → 200', s4 === 200, `status=${s4} msg=${d4.message}`);

    // Driver updates live position
    const { status: s5, data: d5 } = await req('PUT', '/api/crowd/live', {
      token: driverToken,
      body: { transportId, routeId, tripId: 'SLM001-F-0600', currentStop: 'Salem', nextStop: 'Dharmapuri', stopIndex: 0, delayMinutes: 0, status: 'on-time' },
    });
    assert('PUT /api/crowd/live (driver) → 200', s5 === 200, `status=${s5} msg=${d5.message}`);
  }
}

async function testIncidentEndpoints() {
  console.log('\n[14] Incident Endpoints');
  if (!transportId || !routeId) {
    results.push('  ⚠  Skipped (no transportId/routeId)');
    return;
  }

  // Driver reports incident
  const { status: s1, data: d1 } = await req('POST', '/api/incidents/report', {
    token: driverToken,
    body: { transportId, routeId, incidentType: 'delay', severity: 'low', location: 'Salem', description: 'Minor delay at bus stand' },
  });
  assert('POST /api/incidents/report (driver) → 201', s1 === 201, `status=${s1} msg=${d1.message}`);
  incidentId = d1.data?._id;

  // Commuter cannot access GET /api/incidents (all) — commuter only sees own
  const { status: s2, data: d2 } = await req('GET', '/api/incidents', { token: commuterToken });
  assert('GET /api/incidents (commuter) → 200', s2 === 200, `status=${s2}`);

  // Authority sees all incidents
  const { status: s3, data: d3 } = await req('GET', '/api/incidents', { token: authorityToken });
  assert('GET /api/incidents (authority) → 200', s3 === 200, `status=${s3}`);
  assert('Authority incidents → pagination present', !!d3.data?.pagination);

  // GET incidents for transport
  const { status: s4 } = await req('GET', `/api/incidents/${transportId}`, { token: commuterToken });
  assert('GET /api/incidents/:transportId → 200', s4 === 200, `status=${s4}`);

  // Authority resolves incident
  if (incidentId) {
    const { status: s5, data: d5 } = await req('PUT', `/api/incidents/${incidentId}/resolve`, {
      token: authorityToken,
      body: { status: 'resolved', notes: 'Resolved — delay cleared' },
    });
    assert('PUT /api/incidents/:id/resolve (authority) → 200', s5 === 200, `status=${s5} msg=${d5.message}`);
  }

  // Commuter cannot resolve
  if (incidentId) {
    const { status: s6 } = await req('PUT', `/api/incidents/${incidentId}/resolve`, {
      token: commuterToken,
      body: {},
    });
    assert('PUT /api/incidents/:id/resolve (commuter) → 403', s6 === 403, `status=${s6}`);
  }
}

async function testLogout() {
  console.log('\n[15] Logout');
  const { status, data } = await req('POST', '/api/auth/logout', { token: commuterToken });
  assert('POST /api/auth/logout → 200', status === 200, `status=${status} msg=${data.message}`);

  // After logout the old refresh token should fail
  const { status: s2 } = await req('POST', '/api/auth/refresh', {
    body: { refreshToken: commuterRefreshToken },
  });
  assert('Refresh after logout → 401', s2 === 401, `status=${s2}`);
}

// ── Runner ───────────────────────────────────────────────────────────────────
(async () => {
  console.log('='.repeat(60));
  console.log('  API Route Test Suite  —  http://localhost:5000');
  console.log('='.repeat(60));

  try {
    await testHealthCheck();
    await testAuthority();
    await testDriverLogin();
    await testCommuterRegister();
    await testRegisterAuthorityDuplicate();
    await testTokenRefresh();
    await testUserProfile();
    await testNoTokenRejected();
    await testTransportSearch();
    await testTransportById();
    await testCreateTransport();
    await testGetRoutes();
    await testCrowdEndpoints();
    await testIncidentEndpoints();
    await testLogout();
  } catch (err) {
    console.error('\nFATAL:', err.message);
  }

  console.log('\n' + '='.repeat(60));
  results.forEach((r) => console.log(r));
  console.log('='.repeat(60));
  console.log(`\n  PASSED: ${passed}   FAILED: ${failed}   TOTAL: ${passed + failed}`);
  if (failed > 0) process.exit(1);
})();
