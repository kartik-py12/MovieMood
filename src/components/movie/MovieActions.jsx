import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaCheck, FaRegEye } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../auth/AuthModal';

const MovieActions = ({ movie, className = '', onAuthRequired }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { currentUser, likeMovie, toggleWatchlist, toggleWatched, getMovieStatus } = useAuth();

  // Get movie status when component mounts or when user changes
  useEffect(() => {
    const fetchMovieStatus = async () => {
      if (currentUser && movie?.id) {
        try {
          const status = await getMovieStatus(movie.id.toString());
          setIsLiked(status.isLiked);
          setIsInWatchlist(status.isInWatchlist);
          setIsWatched(status.isWatched);
        } catch (error) {
          console.error('Failed to fetch movie status:', error);
        }
      }
    };

    fetchMovieStatus();
  }, [currentUser, movie, getMovieStatus]);

  const handleUnauthenticatedAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAuthRequired) {
      onAuthRequired();
    }
  };

  const handleAction = async (action, needsAuth = true, event) => {
    // Prevent any parent click events (like navigation)
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (needsAuth && !currentUser) {
      setActionType(action);
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const movieData = {
        movieId: movie.id.toString(),
        title: movie.title || movie.name,
        poster_path: movie.poster_path,
        media_type: movie.media_type || 'movie'
      };

      switch (action) {
        case 'like':
          const likeResult = await likeMovie(movieData);
          setIsLiked(likeResult.liked);
          break;
        case 'watchlist':
          const watchlistResult = await toggleWatchlist(movieData);
          setIsInWatchlist(watchlistResult.inWatchlist);
          break;
        case 'watched':
          const watchedResult = await toggleWatched(movieData);
          setIsWatched(watchedResult.watched);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} movie:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    setActionType('');
  };

  return (
    <>
      <div className={`flex items-center gap-4 ${className}`}>
        <button
          onClick={(e) => handleAction('like', true, e)}
          disabled={isLoading}
          className={`flex items-center justify-center rounded-full w-10 h-10 
            ${isLiked 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'} 
            transition-all`}
          title={isLiked ? "Unlike" : "Like"}
        >
          {isLiked ? <FaHeart /> : <FaRegHeart />}
        </button>
        
        <button
          onClick={(e) => handleAction('watchlist', true, e)}
          disabled={isLoading}
          className={`flex items-center justify-center rounded-full w-10 h-10 
            ${isInWatchlist 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'} 
            transition-all`}
          title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
          {isInWatchlist ? <FaBookmark /> : <FaRegBookmark />}
        </button>
        
        <button
          onClick={(e) => handleAction('watched', true, e)}
          disabled={isLoading}
          className={`flex items-center justify-center rounded-full w-10 h-10 
            ${isWatched 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'} 
            transition-all`}
          title={isWatched ? "Mark as unwatched" : "Mark as watched"}
        >
          {isWatched ? <FaCheck /> : <FaRegEye />}
        </button>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose}
        initialMode="login"
      />
    </>
  );
};

export default MovieActions;
