import React from 'react';
import { Bot, User } from 'lucide-react';

/**
 * Single chat message bubble.
 * - User messages: right-aligned, indigo gradient
 * - Assistant messages: left-aligned, dark card with bot icon
 */
const ChatMessage = ({ role, content, timestamp }) => {
  const isUser = role === 'user';

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '';

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-3 items-end`}>
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
        ${isUser ? 'bg-indigo-500' : 'bg-slate-700 border border-slate-600'}
      `}>
        {isUser
          ? <User size={14} className="text-white" />
          : <Bot  size={14} className="text-indigo-400" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        <div className={`
          px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words
          ${isUser
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm'
            : 'bg-slate-800/90 border border-slate-700/60 text-slate-100 rounded-bl-sm'
          }
        `}>
          {content}
        </div>
        {formattedTime && (
          <span className="text-[10px] text-slate-500 px-1">{formattedTime}</span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
