import React, { useContext, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { ChatContext, ChatProvider } from '../context/ChatContext';
import ChatMessage from './ChatMessage';
import '../styles/floating-chatbot.css';

const ChatWidgetInner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isTyping, sendMessage } = useContext(ChatContext);

  const handleSend = (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const askPrompt = (prompt) => sendMessage(prompt);

  return (
    <div className="rf-floating-chat-container">
      {!isOpen && (
        <button className="rf-chat-trigger-btn" onClick={() => setIsOpen(true)} aria-label="Open AI Graph Assistant" title="Open AI Graph Assistant">
          <MessageCircle size={25} />
        </button>
      )}
      {isOpen && (
        <section className="rf-chat-box" aria-label="AI Graph Assistant">
          <header className="rf-chat-header">
            <div>
              <div className="rf-chat-title">AI Graph Assistant</div>
              <div className="rf-chat-subtitle">Explainability Engine</div>
            </div>
            <button className="rf-chat-close-btn" onClick={() => setIsOpen(false)} aria-label="Close assistant" title="Close assistant">
              <X size={18} />
            </button>
          </header>
          <div className="rf-chat-messages" aria-live="polite">
            {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
            {isTyping && <div className="rf-chat-typing">AI Assistant is analyzing graph...</div>}
          </div>
          <div className="rf-chat-prompts">
            <button onClick={() => askPrompt('Which wallet is the ring leader?')}>Leader wallet?</button>
            <button onClick={() => askPrompt('What pattern does this ring match?')}>Pattern match?</button>
          </div>
          <form onSubmit={handleSend} className="rf-chat-input-form">
            <input aria-label="Ask about graph topology" type="text" placeholder="Ask about graph topology..." value={input} onChange={(event) => setInput(event.target.value)} />
            <button type="submit" aria-label="Send question" title="Send question"><Send size={16} /></button>
          </form>
        </section>
      )}
    </div>
  );
};

export const FloatingChatbot = () => (
  <ChatProvider>
    <ChatWidgetInner />
  </ChatProvider>
);
