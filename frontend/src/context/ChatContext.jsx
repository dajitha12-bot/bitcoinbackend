import React, { createContext, useState, useEffect } from 'react';
import { chatbotService } from '../services/chatbotService';

export const ChatContext = createContext();

export const ChatProvider = ({ children, role = 'analyst' }) => {
  const initialText =
    role === 'admin'
      ? 'Hello System Administrator. I am your AI System Operations Assistant. Ask me about system health, model controls, analyst management, alerts, or audit reporting.'
      : 'Hello Analyst. I am your AI Graph Assistant. Ask me about wallet flows, ring leaders, fraud patterns, or what-if scenarios.';

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      type: 'DATA_ANSWER',
      text: initialText,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        type: 'DATA_ANSWER',
        text: initialText,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }, [role]);

  const sendMessage = async (queryText) => {
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const response = await chatbotService.answerQuestion(queryText, role);

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
    <ChatContext.Provider value={{ messages, isTyping, sendMessage, role }}>
      {children}
    </ChatContext.Provider>
  );
};
