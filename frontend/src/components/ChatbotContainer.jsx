// NOTE: Possible duplicate with Chatbot.jsx - this component appears to not be used directly in Home.jsx
// The App.jsx imports it but Home.jsx uses Chatbot.jsx instead - verify usage before deleting

import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaTimes, FaCommentAlt } from 'react-icons/fa';
import { getMovieRecommendationsWithHistory, isMovieRelatedQuery } from '../utils/geminiAPI';
import ChatMessage from './ChatMessage';
import MarkdownFormatter from './MarkdownFormatter';

const ChatbotContainer = ({ isMovieDetail = false, movieTitle = null }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize with welcome message when chat opens
  useEffect(() => {
    if (isVisible && messages.length === 0) {
      const initialMessage = movieTitle 
        ? `Hi there! You're viewing "${movieTitle}". What kind of similar movies are you in the mood for?`
        : "Hi there! What kind of movie are you in the mood for today?";
      
      const initialSystemMessage = { 
        text: initialMessage, 
        isUser: false 
      };
      
      setMessages([initialSystemMessage]);
      setConversationContext([{
        role: "assistant",
        parts: [{ text: initialMessage }]
      }]);
    }
  }, [isVisible, messages.length, movieTitle]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isVisible]);

  const toggleChat = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    
    // Clear chat history when closing the chat
    if (!newVisibility) {
      setMessages([]);
      setConversationContext([]);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    
    // Add user message to UI
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    
    // Update conversation context with user message
    const updatedContext = [
      ...conversationContext,
      { role: "user", parts: [{ text: userMessage }] }
    ];
    setConversationContext(updatedContext);
    
    setInput("");
    setIsLoading(true);
    
    try {
      // Check if it's a simple mood word
      const isMoodWord = /^(happy|sad|excited|relaxed|bored|romantic|thoughtful|scared)$/i.test(userMessage);
      
      // Skip relevance check for single mood words or if on movie detail page
      const skipRelevanceCheck = isMoodWord || isMovieDetail || conversationContext.length > 0;
      
      // Enhanced movie context handling
      const isAboutThisMovie = isMovieDetail && movieTitle && 
        (userMessage.toLowerCase().includes('this movie') || 
         userMessage.toLowerCase().includes('the movie') ||
         userMessage.toLowerCase().includes('similar') ||
         userMessage.toLowerCase().includes('like it') ||
         userMessage.toLowerCase().includes('recommend'));
      
      // If on movie detail page, enhance the query with movie context
      const enhancedMessage = isMovieDetail && movieTitle ? 
        isAboutThisMovie ?
          `About the movie "${movieTitle}": ${userMessage}` :
          `${userMessage} (Context: User is viewing the movie "${movieTitle}")` :
        userMessage;
      
      let isRelated = skipRelevanceCheck ? true : await isMovieRelatedQuery(userMessage);
      
      if (isRelated) {
        // Use the updated API function that supports history
        const response = await getMovieRecommendationsWithHistory(
          enhancedMessage, 
          updatedContext
        );
        
        // Add AI response to UI
        setMessages(prev => [...prev, { text: response.text, isUser: false }]);
        
        // Update conversation context with AI response
        setConversationContext([
          ...updatedContext,
          { role: "assistant", parts: [{ text: response.text }] }
        ]);
        
      } else {
        const errorMessage = "I'm sorry, I can only help with movie-related questions. Can you tell me what kind of movie you're looking for?";
        
        // Add error message to UI
        setMessages(prev => [...prev, { text: errorMessage, isUser: false }]);
        
        // Update conversation context with error response
        setConversationContext([
          ...updatedContext,
          { role: "assistant", parts: [{ text: errorMessage }] }
        ]);
      }
    } catch (error) {
      console.error("Error in chat:", error);
      
      const errorMessage = "Sorry, I'm having trouble processing your request. Can you try again?";
      
      setMessages(prev => [...prev, { text: errorMessage, isUser: false }]);
      
      // Update conversation context with error response
      setConversationContext([
        ...updatedContext,
        { role: "assistant", parts: [{ text: errorMessage }] }
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Render floating button when chat is closed
  if (!isVisible) {
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
    <div className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-gray-800 rounded-lg shadow-xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
        <h3 className="text-white font-medium">Movie Recommendations</h3>
        <button 
          onClick={toggleChat}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close chat"
        >
          <FaTimes />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <ChatMessage 
            key={index} 
            message={msg.text} 
            isUser={msg.isUser} 
          />
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-700 rounded-lg rounded-tl-none px-4 py-3 text-white">
              <div className="flex gap-2">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form 
        onSubmit={handleSendMessage}
        className="border-t border-gray-700 p-3 flex items-center"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your mood or movie question..."
          className="flex-1 bg-gray-700 text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-r-lg px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isLoading || !input.trim()}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ChatbotContainer;
