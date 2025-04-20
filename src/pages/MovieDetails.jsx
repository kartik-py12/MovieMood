import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import ChatbotButton from "../components/ChatbotButton";
import Chatbot from "../components/Chatbot";
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/auth/AuthModal';
import MovieActions from '../components/movie/MovieActions';
import { FaUser, FaHeart, FaBookmark, FaCheck, FaInfoCircle } from 'react-icons/fa';

const API_BASE_URL = "https://trendingmoviebackend-fkde.onrender.com/api";
// Get TMDB credentials from environment variables
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_API_KEY;

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [cast, setCast] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [useFallbackApi, setUseFallbackApi] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const { currentUser } = useAuth();

  // Function to fetch data directly from TMDB as a fallback
  const fetchFromTMDB = async (endpoint) => {
    // Use the API key in the query string method
    const url = `${API_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}`;
    console.log(`Fetching from TMDB: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`TMDB API error: ${response.status}`);
      console.error(`Response: ${await response.text()}`);
      throw new Error(`TMDB API error: ${response.status}`);
    }
    return await response.json();
  };

  // Alternative function using Authorization header method
  const fetchFromTMDBWithToken = async (endpoint) => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`
      }
    };
    
    console.log(`Fetching from TMDB with token: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      console.error(`TMDB API error: ${response.status}`);
      console.error(`Response: ${await response.text()}`);
      throw new Error(`TMDB API error: ${response.status}`);
    }
    return await response.json();
  };

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching details for movie ID: ${id} (using TMDB direct)`);
        
        // Try with API key method first
        try {
          // Direct TMDB API calls
          const movieData = await fetchFromTMDB(`/movies/${id}`);
          setMovie(movieData);
          
          try {
            const videosData = await fetchFromTMDB(`/movies/${id}/videos`);
            const trailer = videosData.results?.find(
              video => video.type === 'Trailer' && video.site === 'YouTube'
            );
            setTrailer(trailer);
          } catch (err) {
            console.warn("Could not fetch trailer:", err);
          }
          
          try {
            const creditsData = await fetchFromTMDB(`/movies/${id}/credits`);
            setCast(creditsData.cast?.slice(0, 10) || []);
          } catch (err) {
            console.warn("Could not fetch cast:", err);
          }
        } catch (err) {
          console.log("API key method failed, trying token method:", err);
          
          // If API key method fails, try with token method
          const movieData = await fetchFromTMDBWithToken(`/movies/${id}`);
          setMovie(movieData);
          
          try {
            const videosData = await fetchFromTMDBWithToken(`/movies/${id}/videos`);
            const trailer = videosData.results?.find(
              video => video.type === 'Trailer' && video.site === 'YouTube'
            );
            setTrailer(trailer);
          } catch (videoErr) {
            console.warn("Could not fetch trailer:", videoErr);
          }
          
          try {
            const creditsData = await fetchFromTMDBWithToken(`/movies/${id}/credits`);
            setCast(creditsData.cast?.slice(0, 10) || []);
          } catch (castErr) {
            console.warn("Could not fetch cast:", castErr);
          }
        }
      } catch (err) {
        console.error('Failed to load movie details:', err);
        setError('Failed to load movie details. Please try again later.');
        
        // If we have retry attempts left, try again after a delay
        if (retryCount < 2) {
          setTimeout(() => {
            setRetryCount(prevCount => prevCount + 1);
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id, retryCount]);

  const handleRetry = () => {
    setError(null);
    setRetryCount(prevCount => prevCount + 1);
    // If we've been using fallback, try the original API again
    if (useFallbackApi && retryCount > 1) {
      setUseFallbackApi(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const navigateToAuth = () => {
    // We can pass the current location as state to redirect back after login
    navigate('/auth', { state: { from: `/movie/${id}` } });
  };

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <div className="flex gap-4">
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
          <button 
            onClick={handleBackToHome}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;
    
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/no-movie.png';

  return (
    <main>
      {backdropUrl && (
        <div 
          className="absolute top-0 left-0 w-full h-screen bg-cover bg-center opacity-20 z-0"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      )}
      
      <div className="pattern" />
      
      <div className="wrapper">
        {/* Header section with Auth button */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="inline-flex items-center text-indigo-400 hover:text-indigo-300">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          
          {currentUser ? (
            <Link to="/profile" className="flex items-center gap-2 bg-indigo-700/50 hover:bg-indigo-700/70 text-white px-4 py-2 rounded-full transition-colors">
              <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <span>{currentUser.username}</span>
            </Link>
          ) : (
            <button 
              onClick={navigateToAuth}
              className="flex items-center gap-2 bg-indigo-700/50 hover:bg-indigo-700/70 text-white px-4 py-2 rounded-full transition-colors"
            >
              <FaUser />
              <span>Sign In</span>
            </button>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          <div className="md:w-1/3">
            <img 
              src={posterUrl} 
              alt={movie.title} 
              className="w-full h-auto rounded-lg shadow-[0_0_30px_12px_rgba(171,139,255,0.3)]"
            />
            
            {/* Movie Actions or Sign-in Message */}
            <div className="mt-4">
              {currentUser ? (
                <div className="flex justify-center">
                  <MovieActions movie={movie} />
                </div>
              ) : (
                <div className="px-4 py-3 bg-indigo-900/30 border border-indigo-500/20 rounded-lg text-center mt-12">
                  <div className="flex items-center justify-center mb-2 text-indigo-400">
                    <FaInfoCircle className="mr-2" />
                    <span className="font-medium">Unlock Movie Features</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    Sign in to track this movie, add it to your watchlist, mark as watched, or like it
                  </p>
                  <div className="flex justify-center gap-4 text-xs text-gray-400">
                    <div className="flex flex-col items-center">
                      <FaHeart className="text-red-500/70 mb-1" />
                      <span>Like</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <FaBookmark className="text-indigo-500/70 mb-1" />
                      <span>Watchlist</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <FaCheck className="text-green-500/70 mb-1" />
                      <span>Watched</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:w-2/3 text-white">
            <h1 className="text-left mb-2">{movie.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres?.map(genre => (
                <span key={genre.id} className="px-3 py-1 bg-dark-100 rounded-full text-sm">
                  {genre.name}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-4 mb-6 text-light-200">
              <div className="flex items-center">
                <img src="/star.svg" alt="rating" className="w-5 h-5 mr-1" />
                <span className="font-bold">{movie.vote_average?.toFixed(1)}</span>
              </div>
              <span>•</span>
              <span>{movie.release_date?.split('-')[0]}</span>
              <span>•</span>
              <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
            </div>
            
            <div className="mb-6">
              <h2 className="mb-2">Overview</h2>
              <p className="text-light-200">{movie.overview}</p>
            </div>
            
            {trailer && (
              <div className="mb-8">
                <h2 className="mb-4">Trailer</h2>
                <div className="aspect-video">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    title={`${movie.title} Trailer`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
            
            {cast.length > 0 && (
              <div>
                <h2 className="mb-4">Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {cast.map(person => (
                    <div key={person.id} className="text-center">
                      <img
                        src={person.profile_path 
                          ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                          : '/no-profile.png'}
                        alt={person.name}
                        className="w-full h-auto rounded-lg object-cover aspect-[2/3] mb-2"
                      />
                      <p className="font-medium text-sm">{person.name}</p>
                      <p className="text-gray-400 text-xs">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ChatbotButton toggleChatbot={toggleChatbot} />
      {isChatbotOpen && <Chatbot closeChatbot={() => setIsChatbotOpen(false)} />}
    </main>
  );
};

export default MovieDetails;
