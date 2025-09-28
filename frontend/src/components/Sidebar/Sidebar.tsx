import React, { useState } from 'react';
import { Search, Plus, Folder, MessageSquare, MoreHorizontal } from 'lucide-react';
import { Chat, Folder as FolderType } from '../../types';
import { initialChats } from '../../data/initialChats';
import './Sidebar.css';

interface SidebarProps {
  onChatSelect: (chat: Chat) => void;
  onNewChat: () => void;
  selectedChat: Chat | null;
}

const Sidebar: React.FC<SidebarProps> = ({ onChatSelect, onNewChat, selectedChat }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const folders: FolderType[] = [
    {
      id: 'work',
      name: 'Work chats',
      chats: initialChats.slice(0, 2)
    },
    {
      id: 'life',
      name: 'Life chats',
      chats: initialChats.slice(2)
    },
    {
      id: 'projects',
      name: 'Projects chats',
      chats: []
    },
    {
      id: 'clients',
      name: 'Clients chats',
      chats: []
    }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">⚡</div>
          <span>My Chats</span>
        </div>
        <div className="header-controls">
          <button className="icon-button">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="search-container">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="folders-section">
        <div className="section-header">
          <span>Folders</span>
          <span className="folder-count">{folders.length}</span>
        </div>

        {folders.map((folder) => (
          <div key={folder.id} className="folder-item">
            <div className="folder-header">
              <Folder size={16} className="folder-icon" />
              <span className="folder-name">{folder.name}</span>
              <button className="icon-button">
                <MoreHorizontal size={14} />
              </button>
            </div>
            {folder.chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => onChatSelect(chat)}
              >
                <MessageSquare size={14} className="chat-icon" />
                <div className="chat-content">
                  <div className="chat-name">{chat.name}</div>
                  {chat.lastMessage && (
                    <div className="chat-preview">{chat.lastMessage}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="chats-section">
        <div className="section-header">
          <span>Chats</span>
        </div>
      </div>

      <button className="new-chat-button" onClick={onNewChat}>
        <Plus size={16} />
        <span>New chat</span>
      </button>
    </div>
  );
};

export default Sidebar;
