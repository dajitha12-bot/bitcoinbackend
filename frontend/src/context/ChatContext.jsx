import React, { createContext, useState } from 'react';
import { chatbotService } from '../services/chatbotService';

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      type: 'DATA_ANSWER',
      text: 'Hello Analyst. I am your AI Graph Assistant. Ask me about wallet flows, ring leaders, fraud patterns, or what-if scenarios.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (queryText) => {
    const query = queryText.trim();
    if (!query) return;

    setMessages((previousMessages) => [
      ...previousMessages,
      { id: `${Date.now()}-user`, sender: 'user', text: query, timestamp: new Date().toLocaleTimeString() }
    ]);
    setIsTyping(true);

    try {
      const response = await chatbotService.answerQuestion(query);
      setMessages((previousMessages) => [
        ...previousMessages,
        { id: `${Date.now()}-bot`, sender: 'bot', ...response, timestamp: new Date().toLocaleTimeString() }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, isTyping, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};
