import React from 'react';
import { FaCommentAlt } from 'react-icons/fa';

const ChatbotButton = ({ toggleChatbot }) => {
  return (
    <button
      onClick={toggleChatbot}
      className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-50"
      aria-label="Open chat"
    >
      <FaCommentAlt size={20} />
    </button>
  );
};

export default ChatbotButton;
