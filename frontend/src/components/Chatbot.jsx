import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaTimes, FaForward } from 'react-icons/fa';
import { getMovieRecommendationsWithHistory, isMovieRelatedQuery, updateConversationHistory } from '../utils/geminiAPI';
import { Link } from 'react-router-dom';

const Chatbot = ({ closeChatbot, isMovieDetail = false, movieTitle = null }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // States for typing effect
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingIndex, setCurrentTypingIndex] = useState(-1);
  const [displayedText, setDisplayedText] = useState("");
  const [fullText, setFullText] = useState("");
  const [typingSpeed] = useState(15); // ms per character
  const [skipTyping, setSkipTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const initialMessage = isMovieDetail && movieTitle
        ? `Welcome! Ask me anything about "${movieTitle}" or any other movie recommendations.`
        : "Hi! I'm MovieMood's AI assistant. Tell me what kind of movies you're in the mood for, and I'll suggest some great options for you.";
      
      setMessages([{ text: initialMessage, isUser: false, fullyTyped: true }]);
      // Don't initialize conversation history with empty user message - let it start fresh
    }
  }, [messages.length, isMovieDetail, movieTitle]);

  // Typing effect
  useEffect(() => {
    if (isTyping && currentTypingIndex >= 0 && currentTypingIndex < messages.length) {
      if (skipTyping) {
        // Skip typing animation
        const updatedMessages = [...messages];
        updatedMessages[currentTypingIndex].text = fullText;
        updatedMessages[currentTypingIndex].fullyTyped = true;
        setMessages(updatedMessages);
        
        setDisplayedText(fullText);
        setIsTyping(false);
        setSkipTyping(false);
        return;
      }
      
      if (displayedText.length < fullText.length) {
        // Clear any existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Set a new timeout to add the next character
        typingTimeoutRef.current = setTimeout(() => {
          const nextChar = fullText.charAt(displayedText.length);
          const newDisplayedText = displayedText + nextChar;
          setDisplayedText(newDisplayedText);
          
          // Update the actual message with the current display text
          const updatedMessages = [...messages];
          if (updatedMessages[currentTypingIndex]) {
            updatedMessages[currentTypingIndex].text = newDisplayedText;
            setMessages(updatedMessages);
          }
        }, typingSpeed);
      } else {
        // Typing completed
        const updatedMessages = [...messages];
        updatedMessages[currentTypingIndex].fullyTyped = true;
        setMessages(updatedMessages);
        setIsTyping(false);
      }
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, displayedText, fullText, currentTypingIndex, messages, skipTyping, typingSpeed]);

  // Scroll to bottom when messages change or during typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayedText]);

  // Focus input when component mounts
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const startTypingEffect = (messageIndex, text) => {
    setCurrentTypingIndex(messageIndex);
    setFullText(text);
    setDisplayedText("");
    setIsTyping(true);
    setSkipTyping(false);
    
    // Update the message with the current display text in each typing step
    const updatedMessages = [...messages];
    if (updatedMessages[messageIndex]) {
      updatedMessages[messageIndex].text = ""; // Start with empty text
      setMessages(updatedMessages);
    }
  };

  const handleSkipTyping = () => {
    setSkipTyping(true);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!input.trim() || isTyping) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isUser: true, fullyTyped: true }]);
    
    setInput("");
    setIsLoading(true);
    
    try {
      // First check if the query is movie-related
      const isRelevant = await isMovieRelatedQuery(userMessage);
      
      if (isRelevant) {
        const response = await getMovieRecommendationsWithHistory(userMessage);
        
        // Instead of adding the complete message first and then starting the typing effect,
        // we'll add a placeholder message and start typing immediately
        const newMessageIndex = messages.length + 1;
        setMessages(prev => [
          ...prev, 
          { 
            text: "", // Start with an empty message
            isUser: false,
            source: response.source,
            fullyTyped: false
          }
        ]);
        
        // Update conversation history centrally
        updateConversationHistory(userMessage, response.text);
        
        // Start typing effect immediately
        setTimeout(() => {
          startTypingEffect(newMessageIndex, response.text);
        }, 10); // Very short delay
      } else {
        // Handle non-movie queries
        const notRelevantMessage = "I'm specialized in movie recommendations. Could you ask something about movies, actors, or TV shows instead?";
        
        const newMessageIndex = messages.length + 1;
        setMessages(prev => [
          ...prev,
          {
            text: "", // Start with an empty message
            isUser: false,
            fullyTyped: false
          }
        ]);
        
        // Update conversation history centrally
        updateConversationHistory(userMessage, notRelevantMessage);
        
        // Start typing effect immediately
        setTimeout(() => {
          startTypingEffect(newMessageIndex, notRelevantMessage);
        }, 10); // Very short delay
      }
    } catch (error) {
      console.error("Error in chatbot:", error);
      const errorMessage = "Sorry, I encountered an error. Please try asking something else.";
      
      const newMessageIndex = messages.length + 1;
      setMessages(prev => [...prev, { 
        text: "", // Start with an empty message
        isUser: false,
        fullyTyped: false
      }]);
      
      // Start typing effect immediately
      setTimeout(() => {
        startTypingEffect(newMessageIndex, errorMessage);
      }, 10); // Very short delay
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Extract movie links from messages (used for recommendations)
  const getMovieLinks = (text) => {
    const links = [];
    const regex = /<span class="font-bold"(?:\s+data-id="(\d+)")?>(.*?)\s*\((\d{4})\)<\/span>/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      const id = match[1]; // This may be undefined if no data-id
      const title = match[2];
      const year = match[3];
      
      if (id) {
        links.push({ id, title, year });
      }
    }
    
    return links;
  };

  return (
    <div className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-gray-800 rounded-lg shadow-lg flex flex-col z-50 overflow-hidden md:w-[400px] md:h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-900 to-purple-900">
        <h3 className="text-white font-bold">MovieMood Assistant</h3>
        <button 
          onClick={() => closeChatbot()}
          className="text-white hover:text-gray-300 transition-colors p-1"
          aria-label="Close chat"
        >
          <FaTimes />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-800">
        {messages.map((msg, index) => {
          // Only process movie links for fully typed messages
          const movieLinks = (!msg.isUser && msg.fullyTyped) ? getMovieLinks(msg.text) : [];
          
          return (
            <div 
              key={index} 
              className={`flex w-full ${msg.isUser ? 'justify-end' : 'justify-start'} mb-4`}
            >
              {/* Avatar for bot messages */}
              {!msg.isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white mr-2 flex-shrink-0 shadow-md">
                  <span className="text-sm font-bold">M</span>
                </div>
              )}
              
              <div 
                onClick={() => {
                  // Skip typing when clicking on the message being typed
                  if (isTyping && index === currentTypingIndex) {
                    handleSkipTyping();
                  }
                }}
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.isUser 
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                    : 'bg-gray-700 text-white rounded-tl-none shadow-md'
                } ${isTyping && index === currentTypingIndex ? 'cursor-pointer' : ''}`}
              >
                {msg.isUser ? (
                  <p className="m-0">{msg.text}</p>
                ) : (
                  <>
                    <div 
                      className="markdown-content" 
                      dangerouslySetInnerHTML={{ 
                        __html: msg.text
                          .replace(/\*\*([^*]+)\*\*/g, '<span class="text-yellow-300 font-bold">$1</span>')
                          .replace(/\*([^*]+)\*/g, '<span class="italic">$1</span>')
                          .replace(/\n/g, '<br />')
                      }}
                    />
                    
                    {/* Skip button for when typing */}
                    {isTyping && index === currentTypingIndex && (
                      <button
                        onClick={handleSkipTyping}
                        className="mt-2 text-xs text-gray-400 hover:text-white flex items-center"
                      >
                        <FaForward size={10} className="mr-1" /> Skip
                      </button>
                    )}
                    
                    {/* Movie links extracted from response - only show when fully typed */}
                    {msg.fullyTyped && movieLinks.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-600">
                        <p className="text-xs text-gray-400 mb-1">Movie links:</p>
                        <div className="flex flex-wrap gap-1">
                          {movieLinks.map((movie, idx) => (
                            <Link 
                              key={idx}
                              to={`/movie/${movie.id}`}
                              onClick={() => closeChatbot()}
                              className="text-xs bg-indigo-900 hover:bg-indigo-800 text-white px-2 py-1 rounded-full transition-colors"
                            >
                              {movie.title} ({movie.year})
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Fallback indicator - only show when fully typed */}
                    {msg.fullyTyped && msg.source === 'fallback' && (
                      <div className="mt-1">
                        <span className="text-xs text-yellow-500 italic">
                          (Fallback mode - limited data)
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* User avatar for user messages */}
              {msg.isUser && (
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white ml-2 flex-shrink-0 shadow-md">
                  <span className="text-sm font-bold">U</span>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Loading indicator */}
        {isLoading && !isTyping && (
          <div className="flex justify-start mb-4 items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white mr-2 flex-shrink-0 shadow-md">
              <span className="text-sm font-bold">M</span>
            </div>
            <div className="bg-gray-700 rounded-2xl rounded-tl-none px-4 py-3 text-white shadow-md">
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
        className="border-t border-gray-700 p-3 flex items-center bg-gray-800"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about movies or recommendations..."
          className="flex-1 bg-gray-700 text-white rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading || isTyping}
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-r-lg px-4 py-3 h-[46px] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
          disabled={isLoading || isTyping || !input.trim()}
        >
          <FaPaperPlane />
        </button>
      </form>
      
      {/* Custom CSS for typing animation */}
      <style>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #e2e8f0;
          animation: typing 1.4s infinite both;
        }
        
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typing {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
