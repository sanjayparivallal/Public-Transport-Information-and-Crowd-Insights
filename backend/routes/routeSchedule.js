const express = require('express');
// mergeParams lets us access :transportId from the parent router
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { getRoutes, createRoute, updateRoute, deleteRoute } = require('../controllers/routeController');

router.use(protect);

// GET  /api/transport/:transportId/routes
router.get('/', getRoutes);

// POST /api/transport/:transportId/routes  — authority only
router.post('/', requireRole('authority'), createRoute);

// PUT  /api/transport/:transportId/routes/:routeId — authority only
router.put('/:routeId', requireRole('authority'), updateRoute);

// DELETE /api/transport/:transportId/routes/:routeId — authority only
router.delete('/:routeId', requireRole('authority'), deleteRoute);

module.exports = router;
