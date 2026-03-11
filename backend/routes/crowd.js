const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  submitCrowdReport,
  getCrowd,
  updateCrowdLevel,
  updateLivePosition,
  getLivePosition,
} = require('../controllers/crowdController');

router.use(protect);

// Commuter submits crowd feedback
router.post('/report', requireRole('commuter'), submitCrowdReport);

// Driver / Conductor / Authority updates official crowd level
router.put('/level', requireRole('driver', 'conductor', 'authority'), updateCrowdLevel);

// Driver / Conductor updates live position
router.put('/live', requireRole('driver', 'conductor'), updateLivePosition);

// Get live position for a transport (all authenticated)
router.get('/live/:transportId', getLivePosition);

// Get aggregated crowd data for a transport (all authenticated)
router.get('/:transportId', getCrowd);

module.exports = router;
