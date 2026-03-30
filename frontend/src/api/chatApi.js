import api from './axiosInstance';

/**
 * Send a chat message to the chatbot.
 * @param {string} message
 * @returns {Promise<{ reply: string, pendingAction: object, userName: string, userRole: string }>}
 */
export const sendChatMessage = (message) =>
  api.post('/chatbot/message', { message }).then((res) => res.data?.data);

/**
 * Fetch the current user's conversation history.
 * @returns {Promise<{ messages: Array<{ role, content, timestamp }> }>}
 */
export const getChatHistory = () =>
  api.get('/chatbot/history').then((res) => res.data?.data);

/**
 * Clear the current user's conversation history.
 */
export const clearChatHistory = () =>
  api.delete('/chatbot/history').then((res) => res.data);
