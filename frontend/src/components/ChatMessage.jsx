import React from 'react';

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '12px'
    }}>
      <div style={{
        maxWidth: '85%',
        padding: '12px 16px',
        borderRadius: '10px',
        backgroundColor: isUser ? 'rgba(0, 212, 255, 0.15)' : '#1a1f3a',
        border: isUser ? '1px solid #00d4ff' : '1px solid #2a3055',
        color: '#f0f4f8',
        fontSize: '0.88rem',
        lineHeight: '1.5'
      }}>
        {message.text}

        {message.data && (
          <ul style={{ marginTop: '8px', paddingLeft: '18px', color: '#00d4ff' }}>
            {message.data.map((item, i) => (
              <li key={i} style={{ color: '#fff', fontSize: '0.82rem' }}>{item}</li>
            ))}
          </ul>
        )}

        {message.wallets && message.wallets.length > 0 && (
          <div style={{ marginTop: '10px', padding: '8px', background: '#0a0e27', borderRadius: '6px', border: '1px dashed #00d4ff' }}>
            <div style={{ fontSize: '0.72rem', color: '#00d4ff', fontWeight: 600 }}>Topology Chain:</div>
            <div style={{ fontSize: '0.78rem', color: '#8c9ba5', wordBreak: 'break-all' }}>
              {message.wallets.join(' ➔ ')}
            </div>
          </div>
        )}
      </div>

      <span style={{ fontSize: '0.68rem', color: '#8c9ba5', marginTop: '2px', padding: '0 4px' }}>
        {message.timestamp}
      </span>
    </div>
  );
};

export default ChatMessage;
