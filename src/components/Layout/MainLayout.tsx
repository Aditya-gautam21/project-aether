import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import ChatArea from '../Chat/ChatArea';
import { Chat, Message } from '../../types';
import './Layout.css';

const MainLayout: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setMessages(chat.messages);
  };

  const handleNewChat = () => {
    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      name: 'New chat',
      messages: [],
      createdAt: new Date(),
      isActive: true,
    };
    setSelectedChat(newChat);
    setMessages([]);
  };

  return (
    <div className="main-layout">
      <Sidebar
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        selectedChat={selectedChat}
      />
      <ChatArea
        selectedChat={selectedChat}
        messages={messages}
        setMessages={setMessages}
      />
    </div>
  );
};

export default MainLayout;
