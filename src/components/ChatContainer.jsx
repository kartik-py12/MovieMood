import { useState } from 'react';
import { FaCommentAlt } from 'react-icons/fa';
import Chatbot from './Chatbot';
import MovieRecommender from './MovieRecommender';

const ChatContainer = ({ movieTitle = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState('conversation'); // 'conversation' or 'recommender'

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = (switchToMode = null) => {
    // If a specific mode is provided, switch to that mode instead of closing
    if (switchToMode) {
      setChatMode(switchToMode);
    } else {
      setIsOpen(false);
    }
  };

  // If chat is not open, show only the button
  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-50"
        aria-label="Open chat"
      >
        <FaCommentAlt size={20} />
      </button>
    );
  }

  return (
    <>
      {chatMode === 'conversation' ? (
        <Chatbot 
          closeChatbot={(mode) => handleClose(mode)} 
          isMovieDetail={Boolean(movieTitle)}
          movieTitle={movieTitle}
        />
      ) : (
        <MovieRecommender 
          closeChatbot={(mode) => handleClose(mode)} 
        />
      )}
    </>
  );
};

export default ChatContainer;
