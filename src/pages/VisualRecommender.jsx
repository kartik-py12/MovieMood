import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPaperPlane, FaSearch, FaArrowLeft, FaFire } from 'react-icons/fa';
import { getMovieRecommendationsWithHistory } from '../utils/geminiAPI';
import { extractMoviesFromResponse } from '../utils/movieExtractor';
import { searchTMDBMovies } from '../utils/tmdbApi';
import Spinner from '../components/Spinner';
import Footer from '../components/common/Footer';

const VisualRecommender = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [conversationContext, setConversationContext] = useState([]);
  const [movieResults, setMovieResults] = useState([]);
  const [aiResponse, setAiResponse] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [popularPrompts] = useState([
    'Happy movies for family night',
    'Mind-bending sci-fi thrillers',
    'Classic noir detective movies',
    'Feel-good romantic comedies',
    'Animated movies for adults',
    'Foreign language masterpieces'
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true); // Track whether to show suggestions
  
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const API_BASE_URL = "https://trendingmoviebackend-fkde.onrender.com/api";
  // Get TMDB credentials from environment variables
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_API_KEY;
  

  
  // Scroll to results when they load
  useEffect(() => {
    if (movieResults.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [movieResults]);

  // Modified handleSearch function to better handle anime and TV series recommendations
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    const userMessage = query.trim();
    
    // Update search history
    setSearchHistory(prev => {
      const newHistory = [userMessage, ...prev.filter(item => item !== userMessage)].slice(0, 5);
      return newHistory;
    });
    
    // Start loading immediately
    setIsLoading(true);
    setMovieResults([]);
    
    try {
      // Ask for movie recommendations in a clear format
      const enhancedMessage = `${userMessage}
      
      Please recommend MOVIES (not TV series) that match my request. For each recommendation, include:
      1. The exact title
      2. The release year in parentheses (YYYY)
      
      Format each recommendation on a new line like this:
      * Movie Title (YYYY)
      
      If my request is specifically about TV shows or anime series that aren't available as movies, please briefly explain that, then recommend similar MOVIES instead.`;
      
      const updatedContext = [
        ...conversationContext,
        { role: "user", parts: [{ text: enhancedMessage }] }
      ];
      
      const response = await getMovieRecommendationsWithHistory(
        enhancedMessage, 
        updatedContext
      );
      
      // Update conversation context
      setConversationContext([
        ...updatedContext,
        { role: "assistant", parts: [{ text: response.text }] }
      ]);
      
      // Store the AI response but we won't display it to the user
      const aiResponseText = response.text;
      console.log("Raw AI response:", aiResponseText);
      
      // Extract movie titles and years with a more precise pattern
      // Looking specifically for the format: * Title (YYYY) or Title (YYYY)
      const titleYearPattern = /(?:\*\s*|\n\s*|\d+\.\s*)([^*\n(]+)\s*\((\d{4})\)/g;
      let match;
      const extractedMovies = [];
      
      while ((match = titleYearPattern.exec(aiResponseText)) !== null) {
        // Clean the title - remove any ** or other markdown/formatting
        let title = match[1].replace(/\*\*/g, '').trim();
        const year = match[2];
        
        // Skip if the title contains phrases indicating it's not a movie
        const skipPhrases = ['here are', 'recommendations', 'similar to', 'looking for'];
        if (skipPhrases.some(phrase => title.toLowerCase().includes(phrase))) {
          continue;
        }
        
        if (title) {
          extractedMovies.push({ title, year });
        }
      }
      
      console.log("Extracted movies:", extractedMovies);
      
      if (extractedMovies.length > 0) {
        setIsSearching(true);
        
        // Process the extracted movies to search by title and year
        const movieDetailsPromises = extractedMovies.map(async (movie) => {
          try {
            // Clean up the title for search by removing any non-title text
            let searchTitle = movie.title
              .replace(/^\s*\*+\s*/, '')        // Remove leading asterisks
              .replace(/\s*-.*$/, '')          // Remove anything after a dash
              .replace(/\s*:.*$/, '')          // Remove anything after a colon
              .trim();
              
            console.log(`Searching for: "${searchTitle} (${movie.year})"`);
            
            // Use the proxy server to search for movies with clean query
            const response = await fetch(
              `${API_BASE_URL}/search/movie?query=${encodeURIComponent(searchTitle)}&primary_release_year=${movie.year}&include_adult=false&page=1`,
              {
                headers: {
                  'Accept': 'application/json'
                }
              }
            );
            
            if (!response.ok) {
              throw new Error(`Search failed: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Find the best match
            if (data.results && data.results.length > 0) {
              // Take the first result as the best match
              const bestMatch = data.results[0];
              
              return {
                id: bestMatch.id,
                title: bestMatch.title,
                poster_path: bestMatch.poster_path,
                year: movie.year || (bestMatch.release_date ? 
                  new Date(bestMatch.release_date).getFullYear() : "Unknown"),
                vote_average: bestMatch.vote_average,
                overview: bestMatch.overview
              };
            }
            
            // If no results found with movie search, try TV search for anime titles
            if (userMessage.toLowerCase().includes('anime') || 
                searchTitle.toLowerCase().includes('anime')) {
              
              console.log(`No movie found, trying TV search for: "${searchTitle}"`);
              
              const tvResponse = await fetch(
                `${API_BASE_URL}/search/tv?query=${encodeURIComponent(searchTitle)}&first_air_date_year=${movie.year}&include_adult=false&page=1`,
                {
                  headers: {
                    'Accept': 'application/json'
                  }
                }
              );
              
              if (tvResponse.ok) {
                const tvData = await tvResponse.json();
                if (tvData.results && tvData.results.length > 0) {
                  const tvMatch = tvData.results[0];
                  return {
                    id: `tv-${tvMatch.id}`,
                    title: tvMatch.name,
                    poster_path: tvMatch.poster_path,
                    year: movie.year || (tvMatch.first_air_date ? 
                      new Date(tvMatch.first_air_date).getFullYear() : "Unknown"),
                    vote_average: tvMatch.vote_average,
                    overview: tvMatch.overview,
                    media_type: 'tv'
                  };
                }
              }
            }
            
            console.log(`No results found for: "${searchTitle} (${movie.year})"`);
            return null;
          } catch (error) {
            console.error(`Failed to search for movie "${movie.title}":`, error);
            return null;
          }
        });
        
        // Wait for all search requests to complete
        const resolvedMovies = await Promise.all(movieDetailsPromises);
        const filteredMovies = resolvedMovies.filter(Boolean); // Filter out null results
        console.log(`Found ${filteredMovies.length} movies out of ${extractedMovies.length} extracted`);
        setMovieResults(filteredMovies);
      } else {
        console.log("No movie titles found in response");
      }
    } catch (error) {
      console.error("Error in visual recommender:", error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
      // Keep suggestions hidden when we have results, unless explicitly toggled on
      if (movieResults.length > 0) {
        setShowSuggestions(false);
      }
    }
  };
  
  const handlePromptClick = (prompt) => {
    setQuery(prompt);
    inputRef.current?.focus();
  };

  // Toggle suggestions visibility
  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-b from-indigo-900/80 to-gray-900 relative">
        <div className="pattern absolute inset-0 opacity-20"></div>
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex items-center mb-6">
            <Link to="/" className="flex items-center text-gray-200 hover:text-white transition-colors">
              <FaArrowLeft className="mr-2" /> 
              <span>Back to Home</span>
            </Link>
          </div>
          
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Visual Movie Recommendations
            </h1>
            <p className="text-light-200 text-lg mb-8">
              Tell us what you're in the mood for and we'll recommend movies with posters
            </p>
            
            <form onSubmit={handleSearch} className="relative">
              <input
                ref={inputRef}
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe what kind of movies you want to see..."
                className="w-full px-6 py-4 rounded-full bg-gray-800/70 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white text-lg"
                disabled={isLoading || isSearching}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
                disabled={!query.trim() || isLoading || isSearching}
              >
                {isLoading ? <Spinner /> : <FaSearch />}
              </button>
            </form>
          </div>
          
          {/* Quick suggestions with toggle button when results are showing */}
          {(showSuggestions || movieResults.length === 0) && !isLoading && (
            <div className="max-w-3xl mx-auto mb-6">
              {movieResults.length > 0 && (
                <div className="flex justify-center mb-4">
                  <button 
                    onClick={toggleSuggestions}
                    className="bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-full flex items-center"
                  >
                    {showSuggestions ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Hide Suggestions
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        Show Suggestions
                      </>
                    )}
                  </button>
                </div>
              )}
              
              <h2 className="font-medium text-light-100 text-center mb-3 flex items-center justify-center gap-2">
                <FaFire className="text-orange-500" />
                <span>Popular searches</span>
              </h2>
              <div className="flex flex-wrap justify-center gap-2">
                {popularPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className="px-4 py-2 bg-gray-800/60 hover:bg-gray-700/80 rounded-full text-sm text-gray-200 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              
              {/* Recent searches */}
              {searchHistory.length > 0 && (
                <div className="mt-6">
                  <h2 className="font-medium text-light-100 text-center mb-3">Your recent searches</h2>
                  <div className="flex flex-wrap justify-center gap-2">
                    {searchHistory.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handlePromptClick(item)}
                        className="px-4 py-2 bg-indigo-900/40 hover:bg-indigo-800/50 rounded-full text-sm text-gray-200 transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Toggle button when suggestions are hidden and results are showing */}
          {!showSuggestions && movieResults.length > 0 && !isLoading && (
            <div className="flex justify-center mb-8">
              <button 
                onClick={toggleSuggestions}
                className="bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 text-sm px-4 py-2 rounded-full flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Show Search Suggestions
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Movie Results - Show Loading state here */}
      {(isLoading || isSearching) && (
        <div className="container mx-auto px-4 py-12 text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-light-200">
            {isLoading ? "Finding the perfect movies for you..." : "Loading movie posters..."}
          </p>
        </div>
      )}
      
      {/* Movie Results - Only show when not loading */}
      {!isLoading && !isSearching && movieResults.length > 0 && (
        <div className="container mx-auto px-4 py-12" ref={resultsRef}>
          <h2 className="text-2xl font-bold mb-3 text-center">
            AI-Powered Recommendations
            <p className="text-base text-gray-400 font-normal mt-1">
              Movies selected just for you based on your preferences
            </p>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movieResults.map(movie => (
              <Link 
                to={movie.media_type === 'tv' ? `/tv/${movie.id.replace('tv-', '')}` : `/movie/${movie.id}`} 
                key={movie.id}
                className="group"
              >
                <div className="bg-gray-800 rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:shadow-indigo-500/20 group-hover:-translate-y-1">
                  <div className="aspect-[2/3] relative">
                    <img 
                      src={
                        movie.poster_path 
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : 'https://via.placeholder.com/500x750?text=No+Poster'
                      } 
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    {movie.media_type === 'tv' && (
                      <div className="absolute top-2 left-2 bg-indigo-700/90 px-2 py-1 text-xs font-bold rounded">
                        TV Series
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <div>
                        <p className="text-sm text-gray-300 line-clamp-3">{movie.overview}</p>
                      </div>
                    </div>
                    {movie.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 px-2 py-1 rounded font-bold text-sm flex items-center">
                        ★ {movie.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-1 group-hover:text-indigo-400 transition-colors">{movie.title}</h3>
                    <p className="text-gray-400 text-sm">{movie.year}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default VisualRecommender;
