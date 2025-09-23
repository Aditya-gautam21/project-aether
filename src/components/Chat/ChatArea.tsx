import React from 'react';
import WelcomeScreen from './WelcomeScreen';
import MessageInput from './MessageInput';
import { Chat, Message } from '../../types';
import './Chat.css';

interface ChatAreaProps {
  selectedChat: Chat | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatArea: React.FC<ChatAreaProps> = ({ selectedChat, messages, setMessages }) => {
  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response for UI demo
    setTimeout(() => {
      const aiMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        content: 'Thanks for your message! This is a demo response. Your FastAPI backend will replace this when integrated.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  if (!selectedChat) {
    return (
      <div className="chat-area">
        <WelcomeScreen onMessageSend={handleSendMessage} />
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="chat-header">
        <div className="chat-title">
          {selectedChat.name}
          <span className="chat-status">Oct 24 at 9:04AM</span>
        </div>
        <div className="chat-controls">
          <button className="icon-button">📋</button>
          <button className="icon-button">↗</button>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">{message.content}</div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatArea;
