const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  reportIncident,
  getAllIncidents,
  getIncidentsByTransport,
  resolveIncident,
  deleteIncident,
} = require('../controllers/incidentController');

router.use(protect);

// POST /api/incidents/report  — commuter, driver, conductor
router.post('/report', requireRole('commuter', 'driver', 'conductor'), reportIncident);

// GET /api/incidents  — all incidents (authority) or own reports (others)
router.get('/', getAllIncidents);

// PUT /api/incidents/:incidentId/resolve  — authority only
router.put('/:incidentId/resolve', requireRole('authority'), resolveIncident);

// DELETE /api/incidents/:id — authority only
router.delete('/:id', requireRole('authority'), deleteIncident);

// GET /api/incidents/:transportId  — incidents for a transport
router.get('/:transportId', getIncidentsByTransport);

module.exports = router;
