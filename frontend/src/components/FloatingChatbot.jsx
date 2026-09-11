import React, { useState, useContext } from 'react';
import { ChatContext, ChatProvider } from '../context/ChatContext';
import ChatMessage from './ChatMessage';
import '../styles/floating-chatbot.css';

const ChatWidgetInner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isTyping, sendMessage } = useContext(ChatContext);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

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
              <div className="rf-chat-title">AI Graph Assistant</div>
              <div className="rf-chat-subtitle">Explainability Engine</div>
            </div>
            <button className="rf-chat-close-btn" onClick={() => setIsOpen(false)}>✖</button>
          </div>

          <div className="rf-chat-messages">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isTyping && <div style={{ color: '#00d4ff', fontSize: '0.8rem' }}>AI Assistant is analyzing graph...</div>}
          </div>

          <div className="rf-chat-prompts">
            <button onClick={() => sendMessage("Which wallet is the ring leader?")}>Leader Wallet?</button>
            <button onClick={() => sendMessage("What pattern does this ring match?")}>Pattern Match?</button>
          </div>

          <form onSubmit={handleSend} className="rf-chat-input-form">
            <input
              type="text"
              placeholder="Ask about graph topology..."
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

export const FloatingChatbot = () => (
  <ChatProvider>
    <ChatWidgetInner />
  </ChatProvider>
);

export default FloatingChatbot;
