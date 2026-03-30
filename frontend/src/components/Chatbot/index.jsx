import React, { useState, useCallback } from 'react';
import ChatFab   from './ChatFab';
import ChatPanel from './ChatPanel';
import { useAuth } from '../../context/AuthContext';

/**
 * Chatbot — combines FAB + Panel.
 * Mount this once inside the authenticated layout.
 */
const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen,    setIsOpen]    = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setHasUnread(false); // clear unread when opening
      return !prev;
    });
  }, []);
   
  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleNewMessage = useCallback(() => {
    if (!isOpen) setHasUnread(true);
  }, [isOpen]);

  if (!user) return null;

  return (
    <>
      <ChatFab
        onClick={handleToggle}
        isOpen={isOpen}
        hasUnread={hasUnread}
      />
      <ChatPanel
        isOpen={isOpen}
        onClose={handleClose}
        user={user}
        onNewMessage={handleNewMessage}
      />
    </>
  );
};

export default Chatbot;
