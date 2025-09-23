import React from 'react';
import MessageInput from './MessageInput';

interface WelcomeScreenProps {
  onMessageSend: (message: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onMessageSend }) => {
  const suggestions = [
    {
      icon: '📄',
      title: 'Saved Prompt Templates',
      description: 'Access saved prompt templates for common scenarios'
    },
    {
      icon: '🎯',
      title: 'Media Topic Selection',
      description: 'Generate responses with selected media preferences'
    },
    {
      icon: '🎭',
      title: 'Multilingual Support',
      description: 'Converse with the bot in multiple languages'
    }
  ];

  const quickActions = ['All', 'Text', 'Image', 'Video', 'Music', 'Analytics'];

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-icon">⚡</div>
        <h1 className="welcome-title">How can I help you today?</h1>
        <p className="welcome-subtitle">
          I can help you create a prompt based on the type of task would like to
          work on it will display a greeting message with the name entered by the user.
        </p>

        <div className="suggestions-grid">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="suggestion-card">
              <div className="suggestion-icon">{suggestion.icon}</div>
              <div className="suggestion-content">
                <h3 className="suggestion-title">{suggestion.title}</h3>
                <p className="suggestion-description">{suggestion.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="quick-actions">
          {quickActions.map((action) => (
            <button key={action} className="quick-action-button">
              {action}
            </button>
          ))}
        </div>
      </div>

      <MessageInput onSendMessage={onMessageSend} />
    </div>
  );
};

export default WelcomeScreen;
