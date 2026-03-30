const chatbotService = require('../services/chatbotService');
const ChatHistory    = require('../models/ChatHistory');
const User           = require('../models/User');
const Authority      = require('../models/Authority');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * POST /api/chatbot/message
 * Body: { message: string }
 */
const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return sendError(res, 400, 'message is required');
    }
    if (message.trim().length > 1000) {
      return sendError(res, 400, 'message is too long (max 1000 characters)');
    }

    const { id: userId, role: userRole } = req.user;

    // Resolve display name from correct collection
    let userName = 'User';
    try {
      if (userRole === 'authority') {
        const auth = await Authority.findById(userId).select('name').lean();
        if (auth) userName = auth.name;
      } else {
        const user = await User.findById(userId).select('name').lean();
        if (user) userName = user.name;
      }
    } catch { /* non-fatal — use default */ }

    const { reply, pendingAction } = await chatbotService.processMessage({
      userId,
      userRole,
      userName,
      userMessage: message.trim(),
    });

    return sendSuccess(res, 200, { reply, pendingAction, userName, userRole });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/chatbot/history
 * Returns the user's conversation history
 */
const getHistory = async (req, res, next) => {
  try {
    const { id: userId, role: userRole } = req.user;
    const history = await ChatHistory.findOne({ userId, userRole }).lean();

    const messages = (history?.messages || []).map((m) => ({
      role:      m.role,
      content:   m.content,
      timestamp: m.timestamp,
    }));

    return sendSuccess(res, 200, { messages });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/chatbot/history
 * Clears the user's conversation history and any pending action
 */
const clearHistory = async (req, res, next) => {
  try {
    const { id: userId, role: userRole } = req.user;
    await ChatHistory.findOneAndUpdate(
      { userId, userRole },
      { $set: { messages: [], pendingAction: {} } },
      { upsert: false }
    );
    return sendSuccess(res, 200, null, 'Conversation history cleared');
  } catch (err) {
    next(err);
  }
};

module.exports = { sendMessage, getHistory, clearHistory };
