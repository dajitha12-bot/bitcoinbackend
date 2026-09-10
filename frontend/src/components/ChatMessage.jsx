import React from 'react';

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`rf-chat-message ${isUser ? 'rf-chat-message-user' : 'rf-chat-message-bot'}`}>
      <div className="rf-chat-bubble">
        <div>{message.text}</div>
        {message.data?.length > 0 && (
          <ul className="rf-chat-data-list">
            {message.data.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
          </ul>
        )}
        {message.wallets?.length > 0 && (
          <div className="rf-chat-topology">
            <div className="rf-chat-topology-label">Topology chain</div>
            <div className="rf-chat-topology-value">{message.wallets.join(' -> ')}</div>
          </div>
        )}
      </div>
      <span className="rf-chat-timestamp">{message.timestamp}</span>
    </div>
  );
};

export default ChatMessage;
