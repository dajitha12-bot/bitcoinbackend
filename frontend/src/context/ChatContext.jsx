import React, { createContext, useState } from 'react';
import { chatbotService } from '../services/chatbotService';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      type: 'DATA_ANSWER',
      text: 'Hello Analyst. I am your AI Graph Assistant. Ask me about wallet flows, ring leaders, fraud patterns, or what-if scenarios.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (queryText) => {
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const response = await chatbotService.answerQuestion(queryText);

    const botMsg = {
      id: Date.now() + 1,
      sender: 'bot',
      ...response,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <ChatContext.Provider value={{ messages, isTyping, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};
