import React from 'react';
import MarkdownFormatter from './MarkdownFormatter';

/**
 * Component for rendering formatted chat messages
 */
const ChatMessage = ({ message, isUser = false }) => {
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser 
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-gray-700 text-white rounded-tl-none'
        }`}
      >
        {isUser ? (
          <p className="m-0">{message}</p>
        ) : (
          <MarkdownFormatter content={message} />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
