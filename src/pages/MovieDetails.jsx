import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import ChatbotButton from "../components/ChatbotButton";
import Chatbot from "../components/Chatbot";


const API_BASE_URL = "https://trendingmoviebackend-1.onrender.com/api";
// Update with your actual TMDB credentials
const TMDB_API_KEY = "7337f37bbac265f1941b84dbf6976edc";
const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MzM3ZjM3YmJhYzI2NWYxOTQxYjg0ZGJmNjk3NmVkYyIsIm5iZiI6MTczODE3NTc2NS43NDQsInN1YiI6IjY3OWE3NTE1ZDA0YjAzYmQ5ZjM0M2ZhMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A4XPEm7gW3a3ajC1Wo52gXG-QpdSWXtvcmTrrA2vDkY";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

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

    const toggleChatbot = () => {
        setIsChatbotOpen(!isChatbotOpen);
      };
    

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
        <Link to="/" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        
        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          <div className="md:w-1/3">
            <img 
              src={posterUrl} 
              alt={movie.title} 
              className="w-full h-auto rounded-lg shadow-[0_0_30px_12px_rgba(171,139,255,0.3)]"
            />
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
