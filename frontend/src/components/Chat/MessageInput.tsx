import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="input-wrapper">
          <div className="input-icon">⚡</div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your prompt here..."
            className="message-input"
          />
          <button
            type="submit"
            className="send-button"
            disabled={!message.trim()}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
      <p className="input-disclaimer">
        ChatGPT can make mistakes. Consider checking important information.
      </p>
    </div>
  );
};

export default MessageInput;
