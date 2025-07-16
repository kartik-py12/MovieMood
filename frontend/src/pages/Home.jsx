import { useEffect, useState } from "react"
import { useDebounce } from "react-use";
import Search from "../components/Search"
import Spinner from "../components/Spinner";
import MovieCard from "../components/MovieCard";
import { getTrending, updateSearchCount } from "../appwrite";
import ChatContainer from "../components/ChatContainer";
import Footer from "../components/common/Footer";
import Pagination from "../components/common/Pagination";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser,FaHeart,FaBookmark,FaCheck } from "react-icons/fa";
import AuthModal from "../components/auth/AuthModal";

// const API_BASE_URL = "https://trendingmoviebackend-fkde.onrender.com/api";
const API_BASE_URL = "https://tmdbproxy-eedtf6bxbae2f4d3.westindia-01.azurewebsites.net/api";
// Get TMDB credentials from environment variables

// const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
// const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_API_KEY;
// const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setdebouncedSearchTerm] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([]);
  // const [useDirectApi, setUseDirectApi] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { currentUser } = useAuth();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useDebounce(() => setdebouncedSearchTerm(searchTerm), 800, [searchTerm])

  // // Function to fetch data directly from TMDB using API key
  // const fetchFromTMDB = async (endpoint, query = "", page = 1) => {
  //   let url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&page=${page}`;
  //   if (query) {
  //     url += `&query=${encodeURIComponent(query)}`;
  //   }
    
  //   console.log(`Fetching from TMDB: ${url}`);
  //   const response = await fetch(url);
  //   if (!response.ok) {
  //     console.error(`TMDB API error: ${response.status}`);
  //     throw new Error(`TMDB API error: ${response.status}`);
  //   }
  //   return await response.json();
  // };

  // Alternative function using Authorization header method
  // const fetchFromTMDBWithToken = async (endpoint, query = "", page = 1) => {
  //   let url = `${TMDB_BASE_URL}${endpoint}?page=${page}`;
  //   if (query) {
  //     url += `&query=${encodeURIComponent(query)}`;
  //   }
    
  //   const options = {
  //     method: 'GET',
  //     headers: {
  //       accept: 'application/json',
  //       Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`
  //     }
  //   };
    
  //   const response = await fetch(url, options);
  //   if (!response.ok) {
  //     throw new Error(`TMDB API error: ${response.status}`);
  //   }
  //   return await response.json();
  // };

  const fetchMovies = async (query = "", page = 1, retryCount = 0) => {
    setIsLoading(true);
    // Don't set error message visible to users
    setErrorMessage("");
  
    try {
      // Use our backend
      const endpoint = `${API_BASE_URL}/movies?query=${encodeURIComponent(query)}&page=${page}`;
      const response = await fetch(endpoint);
  
      // Handle different response statuses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 503 && errorData.retryable && retryCount < 2) {
          // Service unavailable but retryable - wait and retry
          setErrorMessage("Service temporarily busy, retrying...");
          await new Promise(resolve => setTimeout(resolve, 2000));
          return fetchMovies(query, page, retryCount + 1);
        }
        
        if (response.status === 503 && errorData.fallback) {
          // Circuit breaker is open, but we might have fallback data
          if (errorData.results) {
            setMovieList(errorData.results);
            setTotalPages(errorData.total_pages || 1);
            setErrorMessage("⚠️ Using cached data due to service issues");
            return;
          }
        }
        
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
  
      const data = await response.json();
      
      // Handle fallback responses
      if (data.fallback) {
        setErrorMessage("⚠️ " + (data.message || "Using cached data"));
      }
      
      if (data.Response === "False") {
        setMovieList([]);
        setTotalPages(0);
        return;
      }

      setMovieList(data.results || []);
      setTotalPages(data.total_pages || 0);
      console.error(errorMessage);
  
      if (query && data.results && data.results.length > 0) {
        try {
          await updateSearchCount(query, data.results[0]);
        } catch (error) {
          // Silently log search count update errors
          console.error("Error updating search count:", error);
        }
      }
    } catch (error) {
      // Only log to console, don't show to user
      console.error(`Error fetching movies: ${error}`);
      
      // Provide user-friendly error messages
      if (error.message.includes('ECONNRESET')) {
        setErrorMessage("Connection issue with movie service. Please try again in a moment.");
      } else if (error.message.includes('timeout')) {
        setErrorMessage("Request timed out. Please check your connection and try again.");
      } else if (error.message.includes('503') || error.message.includes('temporarily unavailable')) {
        setErrorMessage("Movie service is temporarily busy. Please try again in a few minutes.");
      } else {
        setErrorMessage("Failed to fetch movies. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadTrendingMovies = async() => {
    try{
      const movies = await getTrending();
      // Ensure we always set an array, even if we get undefined or null
      setTrendingMovies(movies || []);
    }catch(error){
      console.error("Error loading trending movies:", error);
      setTrendingMovies([]); // Set empty array on error
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm, currentPage);
  }, [debouncedSearchTerm, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadTrendingMovies()
  }, [])

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };



  const toggleAuthModal = () => {
    setShowAuthModal(!showAuthModal);
  };

  return (
    <main>
      <div className="pattern"/>
      <div className="wrapper">
        <header>

          
          {/* Add auth button in the top right corner */}
          <div className="flex justify-end mb-4">
            {currentUser ? (
              <Link to="/profile" className="flex items-center gap-2 bg-indigo-700/50 hover:bg-indigo-700/70 text-white px-4 py-2 rounded-full transition-colors">
                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <span>{currentUser.username}</span>
              </Link>
            ) : (
              <button 
                onClick={toggleAuthModal}
                className="flex items-center gap-2 bg-indigo-700/50 hover:bg-indigo-700/70 text-white px-4 py-2 rounded-full transition-colors"
              >
                <FaUser />
                <span>Sign In</span>
              </button>
            )}
          </div>
          
          <img src="/hero.png" alt="hero banner"></img>
          <h1>Find <span className="text-gradient">Movies</span> You&apos;ll Love Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
          
          {/* Improved Visual Recommender Button */}
          <div className="mt-6 mb-2">
            <Link 
              to="/visual-recommender" 
              className="block max-w-md mx-auto overflow-hidden group"
            >
              <div className="relative bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 rounded-xl p-1 shadow-lg transition-all duration-300 hover:shadow-indigo-500/30 hover:shadow-xl group-hover:scale-[1.01]">
                <div className="bg-gray-900/90 rounded-lg p-4 flex items-center">
                  <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gradient text-lg">Visual Movie Recommendations</h3>
                    <p className="text-gray-400 text-sm">Get AI-powered movie suggestions with posters</p>
                  </div>
                  <div className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-300 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </header>

        {/* Refined minimalist banner for non-authenticated users */}
        {!currentUser && (
          <div className="mb-6 px-4 mt-6">
            <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-indigo-500/20">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <span className="text-white font-medium">Enhance your movie experience</span>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2">
                  <div className="flex items-center rounded-full px-3 py-1 bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/30">
                    <FaHeart className="text-red-400 mr-1.5 text-xs" />
                    <span className="text-gray-200 text-xs">Like</span>
                  </div>
                  <div className="flex items-center rounded-full px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30">
                    <FaBookmark className="text-indigo-400 mr-1.5 text-xs" />
                    <span className="text-gray-200 text-xs">Watchlist</span>
                  </div>
                  <div className="flex items-center rounded-full px-3 py-1 bg-gradient-to-r from-green-500/20 to-green-600/10 border border-green-500/30">
                    <FaCheck className="text-green-400 mr-1.5 text-xs" />
                    <span className="text-gray-200 text-xs">Watched</span>
                  </div>
                </div>
                
                <button 
                onClick={toggleAuthModal}
                className="flex items-center gap-2 bg-indigo-700/50 hover:bg-indigo-700/70 text-white px-4 py-2 rounded-full transition-colors"
              >
                <FaUser />
                <span>Sign In</span>
              </button>
            
              </div>
            </div>
          </div>
        )}

        {/* Add null/undefined check with optional chaining */}
        {trendingMovies?.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <Link to={`/movie/${movie?.movie_id}`} key={movie?.$id || `trending-${index}`}>
                  <li key={movie?.$id || `trending-item-${index}`}>
                    <p>{index+1}</p>
                    <img 
                      src={movie?.poster_url || '/placeholder-poster.png'} 
                      alt={movie?.title || 'Movie poster'} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-poster.png';
                      }}
                    />
                  </li>
                </Link>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies {currentPage > 1 && <span className="text-sm font-normal text-gray-400">(Page {currentPage})</span>}</h2>

          {isLoading ? (
            <Spinner/>
          ) : movieList.length === 0 ? (
            // Show a more generic message or no results message instead of error
            <div className="text-center py-8">
              <p className="text-gray-400">No movies found. Try a different search term.</p>
            </div>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && !isLoading && (
            <div className="flex justify-center mt-10 pb-6">
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                <h3 className="text-center text-white text-lg mb-3">Browse More Movies</h3>
                <Pagination 
                  currentPage={currentPage}
                  totalPages={Math.min(totalPages, 10)} // Limit to 10 pages
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          )}
        </section>
      </div>
      
      <ChatContainer />
      
      <Footer/>
      
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={toggleAuthModal} />
      
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={toggleAuthModal} />
    </main>
  )
}

export default Home
