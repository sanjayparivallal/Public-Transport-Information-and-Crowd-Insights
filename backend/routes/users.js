const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  addFavourite,
  removeFavourite,
} = require('../controllers/userController');

// All user routes are protected
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/favourites/:transportId', addFavourite);
router.delete('/favourites/:transportId', removeFavourite);

module.exports = router;
