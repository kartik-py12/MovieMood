import { useState } from 'react';
import { FaCommentDots } from 'react-icons/fa';
import Chatbot from './Chatbot';
import { Link } from 'react-router-dom';

const ChatContainer = ({ movieTitle = null }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // If chat is not open, show only the button
  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-indigo-500/30 transition-all z-40"
        aria-label="Open chat"
      >
        <FaCommentDots size={20} />
      </button>
    );
  }

  return <Chatbot closeChatbot={handleClose} isMovieDetail={Boolean(movieTitle)} movieTitle={movieTitle} />;
};

export default ChatContainer;
