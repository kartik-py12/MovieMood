import React, { useState, useRef, useEffect } from 'react';
import { getMovieRecommendations, isMovieRelatedQuery } from '../utils/geminiAPI';

const Chatbot = ({ closeChatbot }) => {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: "Hi there! I'm your movie recommendation assistant. Tell me how you're feeling or what kind of movies you're interested in.",
      source: "initial"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Set a timeout to ensure the typing indicator displays for at least 1 second
    const minTypingTime = new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // In parallel: Check if the query is movie-related + ensure typing indicator shows for a min time
      const [isMovieRelated] = await Promise.all([
        isMovieRelatedQuery(input),
        minTypingTime
      ]);
      
      if (isMovieRelated) {
        // Get response from Gemini API (or fallback)
        const { text, source } = await getMovieRecommendations(input);
        
        // Add bot response
        setMessages(prevMessages => [
          ...prevMessages,
          { sender: 'bot', text, source }
        ]);
      } else {
        // Add polite decline for non-movie questions
        setMessages(prevMessages => [
          ...prevMessages,
          { 
            sender: 'bot', 
            text: "I'm designed to help with movie recommendations. Could you ask me something about movies, TV shows, or what you'd like to watch?",
            source: "filter"
          }
        ]);
      }
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          sender: 'bot', 
          text: "Sorry, I encountered an error. Please try asking again with a different question about movies.",
          source: "error"
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Generate a typing indicator with random duration to simulate natural typing
  const renderTypingIndicator = () => {
    return (
      <div className="mb-4">
        <div className="inline-block p-3 rounded-lg bg-light-100/10 text-white">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-dark-100 rounded-lg shadow-lg z-50 flex flex-col max-h-[500px] border border-light-100/20">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-light-100/10">
        <h3 className="font-bold text-white">Movie Recommendations</h3>
        <button 
          onClick={closeChatbot}
          className="text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 ${message.sender === 'user' ? 'text-right' : ''}`}
          >
            <div 
              className={`inline-block p-3 rounded-lg max-w-[80%] ${
                message.sender === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-light-100/10 text-white'
              }`}
            >
              <pre className="whitespace-pre-wrap font-dm-sans text-sm">{message.text}</pre>
              
              {/* Show indicator for fallback responses */}
              {message.sender === 'bot' && message.source === 'fallback' && (
                <div className="mt-2 text-xs text-gray-400 italic flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Using offline database (API rate limited)
                </div>
              )}
              
              {/* Show indicator for cached responses */}
              {message.sender === 'bot' && message.source === 'cache' && (
                <div className="mt-2 text-xs text-gray-400 italic flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Cached response
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && renderTypingIndicator()}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSend} className="border-t border-light-100/10 p-4">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for movie recommendations..."
            className="flex-1 bg-light-100/5 rounded-l-lg py-2 px-4 text-white focus:outline-none"
            disabled={isTyping}
          />
          <button
            type="submit"
            className={`bg-indigo-600 text-white rounded-r-lg py-2 px-4 ${
              isTyping ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
            }`}
            disabled={isTyping}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;
