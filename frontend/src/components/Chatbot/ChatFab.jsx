import React from 'react';
import { Bot, MessageCircle } from 'lucide-react';

/**
 * Floating action button to toggle the chat panel.
 * Shows an unread indicator dot when there are unread replies.
 */
const ChatFab = ({ onClick, isOpen, hasUnread = false }) => {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
      className="
        fixed bottom-6 right-6 z-[9999]
        w-14 h-14 rounded-full
        bg-gradient-to-br from-indigo-500 to-purple-600
        shadow-lg shadow-indigo-500/40
        text-white
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/50
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-transparent
      "
      style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(0deg)' }}
    >
      <span className={`transition-all duration-300 ${isOpen ? 'opacity-0 scale-0 absolute' : 'opacity-100 scale-100'}`}>
        <MessageCircle size={24} strokeWidth={2} />
      </span>
      <span className={`transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 absolute'}`}>
        <Bot size={24} strokeWidth={2} />
      </span>

      {/* Unread indicator */}
      {hasUnread && !isOpen && (
        <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
      )}
    </button>
  );
};

export default ChatFab;
