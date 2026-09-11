import React, { useState, useContext } from 'react';
import { ChatContext, ChatProvider } from '../context/ChatContext';
import ChatMessage from './ChatMessage';
import '../styles/floating-chatbot.css';

const ChatWidgetInner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [adminCategory, setAdminCategory] = useState('system');
  const [analystCategory, setAnalystCategory] = useState('flows');
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
                {isAdmin ? '🛡️ Admin System Chatbot' : '🕵️ Analyst Graph Chatbot'}
              </div>
              <div className="rf-chat-subtitle">
                {isAdmin ? 'System Controls, Model Health & User Admin' : 'Case Investigation & Graph Reasoning Engine'}
              </div>
            </div>
            <button className="rf-chat-close-btn" onClick={() => setIsOpen(false)}>✖</button>
          </div>

          <div className="rf-chat-messages">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isTyping && (
              <div style={{ color: '#00d4ff', fontSize: '0.8rem', padding: '4px 8px' }}>
                {isAdmin ? '🤖 Admin Operations Engine executing system query...' : '🧠 Graph Reasoning Engine analyzing network topology...'}
              </div>
            )}
          </div>

          {/* UNIQUE CATEGORY SELECTORS & PROMPT BUTTONS */}
          <div className="rf-chat-category-tabs" style={{ display: 'flex', gap: '4px', padding: '6px 10px', background: '#0a0f1d', borderTop: '1px solid rgba(0,212,255,0.1)' }}>
            {isAdmin ? (
              <>
                <button style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', borderRadius: '4px', background: adminCategory === 'system' ? '#00d4ff' : '#1a233a', color: adminCategory === 'system' ? '#000' : '#8a99ad', border: 'none', cursor: 'pointer' }} onClick={() => setAdminCategory('system')}>Health/Model</button>
                <button style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', borderRadius: '4px', background: adminCategory === 'flows' ? '#00d4ff' : '#1a233a', color: adminCategory === 'flows' ? '#000' : '#8a99ad', border: 'none', cursor: 'pointer' }} onClick={() => setAdminCategory('flows')}>Wallet/Rings</button>
                <button style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', borderRadius: '4px', background: adminCategory === 'control' ? '#00d4ff' : '#1a233a', color: adminCategory === 'control' ? '#000' : '#8a99ad', border: 'none', cursor: 'pointer' }} onClick={() => setAdminCategory('control')}>Controls/Users</button>
                <button style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', borderRadius: '4px', background: adminCategory === 'rejection' ? '#ff4d4d' : '#1a233a', color: adminCategory === 'rejection' ? '#fff' : '#8a99ad', border: 'none', cursor: 'pointer' }} onClick={() => setAdminCategory('rejection')}>Rejections</button>
              </>
            ) : (
              <>
                <button style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', borderRadius: '4px', background: analystCategory === 'flows' ? '#00d4ff' : '#1a233a', color: analystCategory === 'flows' ? '#000' : '#8a99ad', border: 'none', cursor: 'pointer' }} onClick={() => setAnalystCategory('flows')}>Tx Flows</button>
                <button style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', borderRadius: '4px', background: analystCategory === 'rings' ? '#00d4ff' : '#1a233a', color: analystCategory === 'rings' ? '#000' : '#8a99ad', border: 'none', cursor: 'pointer' }} onClick={() => setAnalystCategory('rings')}>Ring Leaders</button>
                <button style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', borderRadius: '4px', background: analystCategory === 'whatif' ? '#00d4ff' : '#1a233a', color: analystCategory === 'whatif' ? '#000' : '#8a99ad', border: 'none', cursor: 'pointer' }} onClick={() => setAnalystCategory('whatif')}>What-If</button>
                <button style={{ flex: 1, padding: '3px 6px', fontSize: '0.7rem', borderRadius: '4px', background: analystCategory === 'rejection' ? '#ff4d4d' : '#1a233a', color: analystCategory === 'rejection' ? '#fff' : '#8a99ad', border: 'none', cursor: 'pointer' }} onClick={() => setAnalystCategory('rejection')}>Rejections</button>
              </>
            )}
          </div>

          <div className="rf-chat-prompts">
            {isAdmin ? (
              adminCategory === 'system' ? (
                <>
                  <button onClick={() => sendMessage("What is the current system health?")}>System Health?</button>
                  <button onClick={() => sendMessage("What is the current model's F1 score?")}>Model F1 Score?</button>
                  <button onClick={() => sendMessage("When was the model last retrained?")}>Last Retrained?</button>
                  <button onClick={() => sendMessage("What is the current data drift percentage?")}>Data Drift %?</button>
                </>
              ) : adminCategory === 'flows' ? (
                <>
                  <button onClick={() => sendMessage("Which wallet has the most incoming transactions this week?")}>Top Incoming Wallet?</button>
                  <button onClick={() => sendMessage("Show me the top 10 wallets by transaction volume.")}>Top 10 Wallets?</button>
                  <button onClick={() => sendMessage("Which ring is the largest across the entire system?")}>Largest Ring?</button>
                  <button onClick={() => sendMessage("How many rings are currently active?")}>Active Rings Count?</button>
                </>
              ) : adminCategory === 'control' ? (
                <>
                  <button onClick={() => sendMessage("Retrain the model with the latest data.")}>Retrain Model</button>
                  <button onClick={() => sendMessage("Roll back to the previous model version.")}>Rollback Model</button>
                  <button onClick={() => sendMessage("Which analyst accounts are pending approval?")}>Pending Analysts?</button>
                  <button onClick={() => sendMessage("Set the fraud threshold to 0.85.")}>Set Threshold 0.85</button>
                </>
              ) : (
                <>
                  <button onClick={() => sendMessage("Who sent money to wallet 0xA1b2C3 in case #42?")}>Case #42 Query</button>
                  <button onClick={() => sendMessage("Which wallet is the ring leader in my assigned case?")}>Assigned Case Query</button>
                  <button onClick={() => sendMessage("File a new case for wallet 0xDEF...")}>File Case Query</button>
                </>
              )
            ) : (
              analystCategory === 'flows' ? (
                <>
                  <button onClick={() => sendMessage("Who sent money to wallet 0xA1b2C3?")}>Who sent money to 0xA1b2C3?</button>
                  <button onClick={() => sendMessage("What are the top 5 outgoing destinations from wallet 0xF4e5?")}>Top 5 Outgoing?</button>
                  <button onClick={() => sendMessage("Show the transaction path from wallet 0x123 to wallet 0x9AB")}>Tx Path 0x123 ➔ 0x9AB</button>
                </>
              ) : analystCategory === 'rings' ? (
                <>
                  <button onClick={() => sendMessage("Which wallet is the current ring leader?")}>Current Ring Leader?</button>
                  <button onClick={() => sendMessage("Who are the top 3 most central wallets in ring 42?")}>Top 3 Central in Ring 42</button>
                  <button onClick={() => sendMessage("Which rings have a fraud score > 80?")}>Rings Score &gt; 80</button>
                </>
              ) : analystCategory === 'whatif' ? (
                <>
                  <button onClick={() => sendMessage("If I remove wallet 0xABC123, how does the ring structure change?")}>Remove Node Simulation</button>
                  <button onClick={() => sendMessage("What happens to the fraud score of wallet 0xDEF456 if I blacklist it?")}>Blacklist Simulation</button>
                  <button onClick={() => sendMessage("Simulate dropping all edges from wallet 0x123 - does any ring break apart?")}>Drop Edges Simulation</button>
                </>
              ) : (
                <>
                  <button onClick={() => sendMessage("Retrain the model with the latest data.")}>Retrain Model Query</button>
                  <button onClick={() => sendMessage("Approve analyst account for john@example.com")}>Approve Account Query</button>
                  <button onClick={() => sendMessage("Set the fraud threshold to 0.85")}>Set Threshold Query</button>
                </>
              )
            )}
          </div>

          <form onSubmit={handleSend} className="rf-chat-input-form">
            <input
              type="text"
              placeholder={isAdmin ? "Ask Admin chatbot (e.g. system health, model retrain...)" : "Ask Analyst chatbot (e.g. wallet path, ring leader...)"}
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
