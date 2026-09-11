import React, { useState, useContext } from 'react';
import { ChatContext, ChatProvider } from '../context/ChatContext';
import ChatMessage from './ChatMessage';
import '../styles/floating-chatbot.css';

const ChatWidgetInner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isTyping, sendMessage, role } = useContext(ChatContext);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const isAdmin = role === 'admin';

  return (
    <div className="rf-floating-chat-container">
      {!isOpen && (
        <button className="rf-chat-trigger-btn" onClick={() => setIsOpen(true)}>
          🤖
        </button>
      )}

      {isOpen && (
        <div className="rf-chat-box">
          <div className="rf-chat-header">
            <div>
              <div className="rf-chat-title">
                {isAdmin ? 'AI System Assistant' : 'AI Graph Assistant'}
              </div>
              <div className="rf-chat-subtitle">
                {isAdmin ? 'Admin Operations Engine' : 'Explainability Engine'}
              </div>
            </div>
            <button className="rf-chat-close-btn" onClick={() => setIsOpen(false)}>✖</button>
          </div>

          <div className="rf-chat-messages">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isTyping && (
              <div style={{ color: '#00d4ff', fontSize: '0.8rem' }}>
                {isAdmin ? 'AI Operations Engine is executing query...' : 'AI Assistant is analyzing graph...'}
              </div>
            )}
          </div>

          <div className="rf-chat-prompts">
            {isAdmin ? (
              <>
                <button onClick={() => sendMessage("What is current system health?")}>System Health?</button>
                <button onClick={() => sendMessage("What is current model F1 score?")}>Model F1?</button>
                <button onClick={() => sendMessage("Which analyst accounts are pending approval?")}>Pending Approvals?</button>
              </>
            ) : (
              <>
                <button onClick={() => sendMessage("Which wallet is the ring leader?")}>Leader Wallet?</button>
                <button onClick={() => sendMessage("What common patterns do the top 5 riskiest rings share?")}>Pattern Match?</button>
              </>
            )}
          </div>

          <form onSubmit={handleSend} className="rf-chat-input-form">
            <input
              type="text"
              placeholder={isAdmin ? "Ask about model controls, system health..." : "Ask about graph topology..."}
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export const FloatingChatbot = ({ role = 'analyst' }) => (
  <ChatProvider role={role}>
    <ChatWidgetInner />
  </ChatProvider>
);

export default FloatingChatbot;
