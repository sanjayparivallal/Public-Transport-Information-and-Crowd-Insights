const express    = require('express');
const { default: rateLimit, ipKeyGenerator } = require('express-rate-limit');
const router     = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, getHistory, clearHistory } = require('../controllers/chatbotController');

// Chatbot-specific rate limiter: 30 requests per 15 minutes per authenticated user (or IP as fallback)
const chatbotLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             30,
  standardHeaders: true,
  legacyHeaders:   false,
  // Key by userId when JWT is already decoded (protect runs before this limiter)
  keyGenerator: (req, res) => req.user?.id || ipKeyGenerator(req, res),
  message: { success: false, message: 'Too many chatbot requests. Please wait a moment before trying again.' },
});

// All chatbot routes require authentication (protect must come before chatbotLimiter
// so req.user is populated for the keyGenerator above)
router.use(protect);
router.use(chatbotLimiter);

// POST /api/chatbot/message  — send a message
router.post('/message', sendMessage);

// GET  /api/chatbot/history  — fetch conversation history
router.get('/history', getHistory);

// DELETE /api/chatbot/history — clear conversation history
router.delete('/history', clearHistory);

module.exports = router;
