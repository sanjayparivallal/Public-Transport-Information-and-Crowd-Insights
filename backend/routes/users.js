const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  addFavourite,
  removeFavourite,
  getStaffCandidates,
} = require('../controllers/userController');

// All user routes are protected
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/favourites/:routeId', addFavourite);
router.delete('/favourites/:routeId', removeFavourite);

router.get('/staff-candidates', getStaffCandidates);

module.exports = router;
