import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaStar, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { tmdbApi } from '../utils/tmdbApi';
import Loader from './common/Loader';
import ErrorMessage from './common/ErrorMessage';
import CastCarousel from './CastCarousel';
import SimilarMovies from './SimilarMovies';
import MovieTrailerModal from './MovieTrailerModal';
import BackdropImage from './BackdropImage';
import ChatbotContainer from './ChatbotContainer';
import './MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [videos, setVideos] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState('');

  // Function to format runtime as hours and minutes
  const formatRuntime = (minutes) => {
    if (!minutes) return 'Runtime unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return 'Release date unknown';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const fetchMovieDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching details for movie ID: ${id} (using proxy)`);
      
      // Get movie details with credits and videos in a single request through our proxy
      const movieData = await tmdbApi.getMovieDetails(id);
      setMovie(movieData);
      
      // Extract credits from the response if appended
      if (movieData.credits) {
        setCast(movieData.credits.cast?.slice(0, 10) || []);
      } else {
        // Fallback to separate request if needed
        const creditsData = await tmdbApi.getMovieCredits(id);
        setCast(creditsData.cast?.slice(0, 10) || []);
      }
      
      // Extract videos from the response if appended
      if (movieData.videos) {
        setVideos(movieData.videos.results || []);
        
        // Find a trailer if available
        const trailer = movieData.videos.results?.find(
          video => video.type === 'Trailer' && video.site === 'YouTube'
        ) || movieData.videos.results?.[0];
        
        if (trailer) {
          setTrailerKey(trailer.key);
        }
      } else {
        // Fallback to separate request if needed
        const videosData = await tmdbApi.getMovieVideos(id);
        setVideos(videosData.results || []);
        
        const trailer = videosData.results?.find(
          video => video.type === 'Trailer' && video.site === 'YouTube'
        ) || videosData.results?.[0];
        
        if (trailer) {
          setTrailerKey(trailer.key);
        }
      }
      
      // Extract similar movies if appended
      if (movieData.similar) {
        setSimilar(movieData.similar.results || []);
      } else {
        // Fallback to separate request
        const similarData = await tmdbApi.getSimilarMovies(id);
        setSimilar(similarData.results || []);
      }
      
    } catch (err) {
      console.error('Failed to load movie details:', err);
      setError(`Failed to load movie details: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMovieDetails();
    }
    // Clean up function
    return () => {
      setMovie(null);
      setCast([]);
      setVideos([]);
      setSimilar([]);
    };
  }, [id]);

  const openTrailer = () => {
    if (trailerKey) {
      setShowTrailer(true);
    }
  };

  const closeTrailer = () => {
    setShowTrailer(false);
  };

  if (loading) return <Loader message="Loading movie details..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchMovieDetails} />;
  if (!movie) return <ErrorMessage message="Movie not found" />;

  return (
    <div className="relative min-h-[calc(100vh-80px)] pb-10">
      <BackdropImage path={movie.backdrop_path} alt={movie.title} />
      
      <div className="flex relative z-10 p-8 gap-8 max-w-7xl mx-auto md:flex-col md:p-5 md:gap-5">
        <div className="flex-shrink-0 w-[300px] h-[450px] rounded-lg overflow-hidden shadow-2xl md:w-[220px] md:h-[330px] md:mx-auto">
          {movie.poster_path ? (
            <img 
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
              alt={movie.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-center p-5">
              <span>No poster available</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 text-white">
          <h1 className="mt-0 mb-4 text-4xl leading-tight md:text-2xl">
            {movie.title} {movie.release_date && <span>({new Date(movie.release_date).getFullYear()})</span>}
          </h1>
          
          <div className="flex flex-wrap gap-5 mb-5">
            {movie.vote_average > 0 && (
              <div className="flex items-center">
                <FaStar className="mr-2 text-yellow-400" />
                <span>{(movie.vote_average).toFixed(1)}/10</span>
              </div>
            )}
            
            {movie.release_date && (
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2 text-yellow-400" />
                <span>{formatDate(movie.release_date)}</span>
              </div>
            )}
            
            {movie.runtime > 0 && (
              <div className="flex items-center">
                <FaClock className="mr-2 text-yellow-400" />
                <span>{formatRuntime(movie.runtime)}</span>
              </div>
            )}
          </div>
          
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mb-5">
              {movie.genres.map(genre => (
                <span key={genre.id} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                  {genre.name}
                </span>
              ))}
            </div>
          )}
          
          {movie.tagline && <div className="italic text-gray-400 mb-5 text-lg">{movie.tagline}</div>}
          
          <div className="mb-8">
            <h3 className="mt-0 mb-2.5 text-xl">Overview</h3>
            <p className="leading-relaxed text-base text-gray-300">{movie.overview || 'No overview available.'}</p>
          </div>
          
          {trailerKey && (
            <button 
              className="flex items-center bg-red-600 text-white border-0 py-2.5 px-5 rounded font-semibold text-base cursor-pointer transition-colors hover:bg-red-700"
              onClick={openTrailer}
            >
              <FaPlay className="mr-2.5" />
              <span>Play Trailer</span>
            </button>
          )}
        </div>
      </div>
      
      {cast.length > 0 && (
        <div className="max-w-7xl mx-auto px-8 md:px-5">
          <h2 className="mt-0 mb-5 text-3xl text-white">Cast</h2>
          <CastCarousel cast={cast} />
        </div>
      )}
      
      {similar.length > 0 && (
        <div className="max-w-7xl mx-auto px-8 md:px-5">
          <h2 className="mt-0 mb-5 text-3xl text-white">Similar Movies</h2>
          <SimilarMovies movies={similar} />
        </div>
      )}
      
      {showTrailer && trailerKey && (
        <MovieTrailerModal 
          videoKey={trailerKey} 
          isOpen={showTrailer} 
          onClose={closeTrailer}
          title={movie.title}
        />
      )}
      
      {/* Add the chatbot for personalized recommendations based on this movie */}
      <ChatbotContainer isMovieDetail={true} movieTitle={movie.title} />
    </div>
  );
};

export default MovieDetails;
