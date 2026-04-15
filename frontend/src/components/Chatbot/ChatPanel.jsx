import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Trash2, Send, Bot, Loader } from 'lucide-react';
import ChatMessage from './ChatMessage';
import QuickChips from './QuickChips';
import {  sendChatMessage, getChatHistory, clearChatHistory  } from '../../api';

const ROLE_LABELS = {
  commuter:  'Commuter',
  driver:    'Driver',
  conductor: 'Conductor',
  authority: 'Authority',
};

const ROLE_COLORS = {
  commuter:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  driver:    'bg-blue-500/20 text-blue-300 border-blue-500/30',
  conductor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  authority: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

/**
 * Main chat panel — slide-in from bottom-right.
 */
const ChatPanel = ({ isOpen, onClose, user, onNewMessage }) => {
  const [messages,    setMessages]    = useState([]);
  const [inputValue,  setInputValue]  = useState('');
  const [isLoading,   setIsLoading]   = useState(false);
  const [showChips,   setShowChips]   = useState(true);
  const [greeted,     setGreeted]     = useState(false);
  const [error,       setError]       = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const userRole = user?.role || 'commuter';
  const userName = user?.name || 'there';

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Load history and greet on first open
  useEffect(() => {
    if (!isOpen) return;

    const init = async () => {
      try {
        const data = await getChatHistory();
        const existingMessages = data?.messages || [];

        if (existingMessages.length > 0) {
          setMessages(existingMessages);
          setGreeted(true);
          setShowChips(false);
        } else if (!greeted) {
          const greetingRole = ROLE_LABELS[userRole] || userRole;
          const greeting = `👋 Hello, **${userName}**! I'm your TransitInfo AI assistant.\n\nYou're logged in as a **${greetingRole}**. I can help you with:\n${getRoleHint(userRole)}\n\nHow can I assist you today?`;
          setMessages([{ role: 'assistant', content: greeting, timestamp: new Date() }]);
          setGreeted(true);
        }
      } catch {
        // Non-fatal — just start fresh
        if (!greeted) {
          const greetingRole = ROLE_LABELS[userRole] || userRole;
          const greeting = `👋 Hello, **${userName}**! I'm your TransitInfo AI assistant — logged in as **${greetingRole}**. How can I help you?`;
          setMessages([{ role: 'assistant', content: greeting, timestamp: new Date() }]);
          setGreeted(true);
        }
      }

      setTimeout(() => inputRef.current?.focus(), 100);
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function getRoleHint(role) {
    switch (role) {
      case 'commuter':  return '🔍 Search routes & fares\n🕐 Check schedules & stops\n👥 View crowd status';
      case 'driver':    return '🚌 View your assigned bus\n⏱ Submit duty updates\n🔍 Search any route';
      case 'conductor': return '🚌 View your assigned bus\n⏱ Submit duty updates\n🔍 Search any route';
      case 'authority': return '📋 View & manage incidents\n🚌 Add/update/delete transports\n⏸ Pause or resume services\n🔍 Search any route';
      default:          return '🔍 Ask me about any bus or route';
    }
  }

  const handleSend = useCallback(async (messageText) => {
    const text = (messageText || inputValue).trim();
    if (!text || isLoading) return;

    setError(null);
    setInputValue('');
    setShowChips(false);

    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const data = await sendChatMessage(text);
      const replyText = data?.reply || "I'm sorry, I couldn't find relevant data for your query. Please try rephrasing.";
      const botMsg = { role: 'assistant', content: replyText, timestamp: new Date() };
      setMessages((prev) => [...prev, botMsg]);
      onNewMessage?.();
    } catch (err) {
      const errMsg = err?.message || 'Something went wrong. Please try again.';
      setError(errMsg);
      setMessages((prev) => [...prev, {
        role:      'assistant',
        content:   '⚠️ ' + errMsg,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [inputValue, isLoading, onNewMessage]);

  const handleChipClick = useCallback((chipText) => {
    handleSend(chipText);
  }, [handleSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) handleSend();
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearChatHistory();
      const greeting = `👋 Hello again, **${userName}**! Conversation cleared. How can I help you?`;
      setMessages([{ role: 'assistant', content: greeting, timestamp: new Date() }]);
      setShowChips(true);
      setError(null);
    } catch { /* ignore */ }
  };

  return (
    <>
      {/* Backdrop (mobile close) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9990] sm:hidden bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`
          fixed bottom-0 right-0 z-[9998]
          w-full sm:bottom-24 sm:right-6 sm:w-96 sm:rounded-2xl
          h-[80vh] sm:h-[600px] max-h-[90vh]
          flex flex-col
          bg-slate-900/95 backdrop-blur-xl
          border border-slate-700/50
          shadow-2xl shadow-black/60
          transition-all duration-300 ease-in-out
          ${isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
          }
        `}
        role="dialog"
        aria-label="TransitInfo AI Assistant"
        aria-modal="true"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">TransitInfo AI</p>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border mt-0.5 inline-block ${ROLE_COLORS[userRole]}`}>
                {ROLE_LABELS[userRole] || userRole}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClearHistory}
              title="Clear chat history"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={onClose}
              title="Close chat"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scroll-smooth">
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
            />
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-2 items-end mb-3">
              <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-indigo-400" />
              </div>
              <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Quick Chips ── */}
        {showChips && !isLoading && messages.length <= 1 && (
          <div className="border-t border-slate-700/40 shrink-0">
            <QuickChips role={userRole} onChipClick={handleChipClick} />
          </div>
        )}

        {/* ── Input ── */}
        <div className="px-3 pb-3 pt-2 border-t border-slate-700/50 shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              id="chatbot-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about transit…"
              rows={1}
              maxLength={1000}
              disabled={isLoading}
              className="
                flex-1 resize-none rounded-xl px-3.5 py-2.5
                bg-slate-800/80 border border-slate-600/60
                text-sm text-slate-100 placeholder-slate-500
                focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30
                transition-all duration-150 disabled:opacity-50
                min-h-[44px] max-h-32 leading-snug
              "
              style={{ height: 'auto', overflowY: inputValue.split('\n').length > 3 ? 'scroll' : 'hidden' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send message"
              className="
                w-10 h-10 rounded-xl flex-shrink-0
                bg-gradient-to-br from-indigo-500 to-purple-600
                text-white flex items-center justify-center
                disabled:opacity-40 disabled:cursor-not-allowed
                hover:opacity-90 active:scale-95
                transition-all duration-150 shadow-md shadow-indigo-500/30
              "
            >
              {isLoading ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-1 flex justify-between">
            <span>Press Enter to send · Shift+Enter for new line</span>
            {inputValue.length > 800 && (
              <span className={inputValue.length >= 1000 ? 'text-red-400' : 'text-amber-400'}>
                {inputValue.length}/1000
              </span>
            )}
          </p>
        </div>
      </div>
    </>
  );
};

export default ChatPanel;
