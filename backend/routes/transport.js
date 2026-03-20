const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  searchTransports,
  getTransportById,
  getMyTransports,
  createTransport,
  updateTransport,
  deleteTransport,
  assignStaff,
  unassignStaff,
} = require('../controllers/transportController');

// All transport routes require authentication
router.use(protect);

// GET  /api/transport/search — all logged-in users
router.get('/search', searchTransports);

// GET  /api/transport/mine — authority gets their own transports (flat list, not routes)
router.get('/mine', requireRole('authority'), getMyTransports);

// GET  /api/transport/:id — all logged-in users
router.get('/:id', getTransportById);

// POST /api/transport — authority only
router.post('/', requireRole('authority'), createTransport);

// PUT  /api/transport/:id — authority only
router.put('/:id', requireRole('authority'), updateTransport);

// DELETE /api/transport/:id — authority only
router.delete('/:id', requireRole('authority'), deleteTransport);

// POST /api/transport/:id/assign — authority only
router.post('/:id/assign', requireRole('authority'), assignStaff);

// DELETE /api/transport/:id/unassign/:role — authority only
router.delete('/:id/unassign/:role', requireRole('authority'), unassignStaff);

module.exports = router;
