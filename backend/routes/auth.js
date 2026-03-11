const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { registerCommuter, registerAuthority, login, refreshToken, logout } = require('../controllers/authController');

// POST /api/auth/register/commuter
router.post('/register/commuter', registerCommuter);

// POST /api/auth/register/authority
router.post('/register/authority', registerAuthority);

// POST /api/auth/login  (all roles)
router.post('/login', login);

// POST /api/auth/refresh  (public — client sends refreshToken in body)
router.post('/refresh', refreshToken);

// POST /api/auth/logout  (protected — clears refresh token hash in DB)
router.post('/logout', protect, logout);

module.exports = router;
