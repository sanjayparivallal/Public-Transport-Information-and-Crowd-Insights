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
  deleteCrowdReport,
  getMyCrowdReports,
} = require('../controllers/crowdController');

router.use(protect);

// Commuter/staff/authority submits crowd feedback
router.post('/report', requireRole('commuter', 'driver', 'conductor', 'authority'), submitCrowdReport);

// Driver / Conductor / Authority updates official crowd level
router.put('/level', requireRole('driver', 'conductor', 'authority'), updateCrowdLevel);

// Driver / Conductor / Authority updates live position
router.put('/live', requireRole('driver', 'conductor', 'authority'), updateLivePosition);

// Get live position for a transport (all authenticated)
router.get('/live/:transportId', getLivePosition);

// Get my crowd reports
router.get('/my-reports', getMyCrowdReports);

// Get aggregated crowd data for a transport (all authenticated)
router.get('/:transportId', getCrowd);

// Delete crowd report (authority or owner)
router.delete('/report/:id', requireRole('commuter', 'driver', 'conductor', 'authority'), deleteCrowdReport);

module.exports = router;
