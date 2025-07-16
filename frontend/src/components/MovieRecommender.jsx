import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaTimes, FaListUl, FaComments } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getMovieRecommendationsWithHistory } from '../utils/geminiAPI';
import { extractMoviesFromResponse } from '../utils/movieExtractor';
import { searchTMDBMovies } from '../utils/tmdbApi';
import Spinner from './Spinner';

const MovieRecommender = ({ closeChatbot }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState([]);
  const [movieResults, setMovieResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const initialMessage = "Welcome to Movie Recommender mode! Tell me what kind of movies you're interested in, or share your mood, and I'll suggest movies with posters you can explore.";
      setMessages([{ text: initialMessage, isUser: false }]);
      setConversationContext([{
        role: "assistant",
        parts: [{ text: initialMessage }]
      }]);
    }
  }, [messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, movieResults]);

  // Focus input when component mounts
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const switchToConversationMode = () => {
    // Call parent component to switch mode
    if (typeof closeChatbot === 'function') {
      closeChatbot('conversation');
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    
    const updatedContext = [
      ...conversationContext,
      { role: "user", parts: [{ text: userMessage }] }
    ];
    setConversationContext(updatedContext);
    
    setInput("");
    setIsLoading(true);
    setMovieResults([]); // Clear previous movie results
    
    try {
      // Enhanced prompt for structured movie recommendations
      const enhancedMessage = `${userMessage} (Please provide movie recommendations in a list format with title and year in parentheses)`;
      
      const response = await getMovieRecommendationsWithHistory(
        enhancedMessage, 
        updatedContext
      );
      
      // Add AI response to messages
      setMessages(prev => [...prev, { text: response.text, isUser: false }]);
      
      // Update conversation context
      setConversationContext([
        ...updatedContext,
        { role: "assistant", parts: [{ text: response.text }] }
      ]);
      
      // Extract movie titles from response
      const extractedMovies = extractMoviesFromResponse(response.text);
      
      if (extractedMovies.length > 0) {
        setIsSearching(true);
        
        // Fetch movie posters
        const movieDetailsPromises = extractedMovies.map(async (movie) => {
          try {
            const searchResults = await searchTMDBMovies(movie.title);
            
            // Try to find closest match by title and year
            const bestMatch = searchResults.results?.find(result => {
              // Check if release year matches (if we have a year)
              const releaseYear = result.release_date ? 
                new Date(result.release_date).getFullYear() : null;
              
              if (movie.year && releaseYear) {
                return (
                  result.title.toLowerCase().includes(movie.title.toLowerCase()) && 
                  releaseYear === parseInt(movie.year)
                );
              }
              
              // Fall back to just title match
              return result.title.toLowerCase().includes(movie.title.toLowerCase());
            }) || searchResults.results?.[0];
            
            if (bestMatch) {
              return {
                id: bestMatch.id,
                title: bestMatch.title,
                poster_path: bestMatch.poster_path,
                year: movie.year || (bestMatch.release_date ? 
                  new Date(bestMatch.release_date).getFullYear() : "Unknown"),
                vote_average: bestMatch.vote_average
              };
            }
            return null;
          } catch (error) {
            console.error(`Failed to fetch poster for ${movie.title}:`, error);
            return null;
          }
        });
        
        // Wait for all movie detail fetches to complete
        const resolvedMovies = await Promise.all(movieDetailsPromises);
        setMovieResults(resolvedMovies.filter(Boolean)); // Filter out null results
        setIsSearching(false);
      }
      
    } catch (error) {
      console.error("Error in movie recommender:", error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I had trouble finding movie recommendations. Could you try rephrasing your request?", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-gray-800 rounded-lg shadow-xl flex flex-col z-50 overflow-hidden md:w-[420px] md:h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-medium">Movie Recommender</h3>
          <div className="flex">
            <button
              onClick={switchToConversationMode}
              className="text-gray-400 hover:text-white transition-colors flex items-center text-xs bg-gray-800/50 rounded-full px-2 py-1"
              title="Switch to conversation mode"
            >
              <FaComments className="mr-1" /> Chat Mode
            </button>
          </div>
        </div>
        <button 
          onClick={() => closeChatbot()}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close movie recommender"
        >
          <FaTimes />
        </button>
      </div>
      
      {/* Messages and movie results */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex w-full ${msg.isUser ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div 
              className={`max-w-[85%] rounded-lg px-4 py-3 ${
                msg.isUser 
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-gray-700 text-white rounded-tl-none'
              }`}
            >
              {msg.isUser ? (
                <p className="m-0">{msg.text}</p>
              ) : (
                <div 
                  className="markdown-content" 
                  dangerouslySetInnerHTML={{ 
                    __html: msg.text
                      .replace(/\*\*([^*]+)\*\*/g, '<span class="text-yellow-300 font-bold">$1</span>')
                      .replace(/\*([^*]+)\*/g, '<span class="italic">$1</span>')
                      .replace(/\n/g, '<br />')
                  }}
                />
              )}
            </div>
          </div>
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
        
        {/* Movie poster grid */}
        {movieResults.length > 0 && (
          <div className="mb-4">
            <h4 className="text-white text-sm font-medium mb-2">
              <FaListUl className="inline mr-1" /> 
              Click on a poster to see details
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {movieResults.map(movie => (
                <Link 
                  to={`/movie/${movie.id}`} 
                  key={movie.id}
                  className="block bg-gray-900 rounded-lg overflow-hidden transition-transform hover:scale-105"
                  onClick={() => closeChatbot()}
                >
                  <div className="aspect-[2/3] relative">
                    <img 
                      src={
                        movie.poster_path 
                          ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                          : 'https://via.placeholder.com/342x513?text=No+Poster'
                      } 
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {movie.vote_average > 0 && (
                      <div className="absolute top-1 right-1 bg-black/70 text-yellow-400 px-1 py-0.5 text-xs rounded font-bold flex items-center">
                        ★ {movie.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-white text-sm font-medium line-clamp-1">{movie.title}</p>
                    <p className="text-gray-400 text-xs">{movie.year}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {isSearching && (
          <div className="flex justify-center my-4">
            <div className="text-sm text-gray-300 flex items-center">
              <Spinner /> 
              <span className="ml-2">Finding movie posters...</span>
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
          placeholder="Describe movies you're interested in..."
          className="flex-1 bg-gray-700 text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isLoading || isSearching}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-r-lg px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isLoading || isSearching || !input.trim()}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default MovieRecommender;
