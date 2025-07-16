import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Backend API URL - adjust this to match your backend
  const API_URL = "https://moviemoodai-d0a9dabkhjbfejez.westindia-01.azurewebsites.net/api";

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true
        });
        
        if (res.data.status === 'success') {
          setCurrentUser(res.data.data);
        }
      } catch (error) {
        console.log('Not logged in');
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, [API_URL]);

  // Register user
  const register = async (username, email, password) => {
    try {
      setError(null);
      const res = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password
      }, { withCredentials: true });
      
      setCurrentUser(res.data.user);
      toast.success('Successfully registered!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      }, { withCredentials: true });
      
      setCurrentUser(res.data.user);
      toast.success('Successfully logged in!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.get(`${API_URL}/auth/logout`, { withCredentials: true });
      setCurrentUser(null);
      toast.success('Successfully logged out');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Logout failed';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  // Movie interaction functions
  const likeMovie = async (movieData) => {
    try {
      const res = await axios.post(`${API_URL}/movies/like`, movieData, {
        withCredentials: true
      });
      
      if (res.data.liked) {
        toast.success(`Added "${movieData.title}" to liked movies`);
      } else {
        toast.success(`Removed "${movieData.title}" from liked movies`);
      }
      
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update liked movies';
      toast.error(message);
      throw new Error(message);
    }
  };

  const toggleWatchlist = async (movieData) => {
    try {
      const res = await axios.post(`${API_URL}/movies/watchlist`, movieData, {
        withCredentials: true
      });
      
      if (res.data.inWatchlist) {
        toast.success(`Added "${movieData.title}" to watchlist`);
      } else {
        toast.success(`Removed "${movieData.title}" from watchlist`);
      }
      
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update watchlist';
      toast.error(message);
      throw new Error(message);
    }
  };

  const toggleWatched = async (movieData) => {
    try {
      const res = await axios.post(`${API_URL}/movies/watched`, movieData, {
        withCredentials: true
      });
      
      if (res.data.watched) {
        toast.success(`Marked "${movieData.title}" as watched`);
      } else {
        toast.success(`Unmarked "${movieData.title}" as watched`);
      }
      
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update watched list';
      toast.error(message);
      throw new Error(message);
    }
  };

  const getMovieStatus = async (movieId) => {
    try {
      if (!currentUser) return { isLiked: false, isInWatchlist: false, isWatched: false, rating: 0 };
      
      const res = await axios.get(`${API_URL}/movies/status/${movieId}`, {
        withCredentials: true
      });
      return res.data.data;
    } catch (error) {
      console.error('Failed to get movie status:', error);
      return { isLiked: false, isInWatchlist: false, isWatched: false, rating: 0 };
    }
  };

  const getUserLists = async () => {
    try {
      // Make sure we have a current user
      if (!currentUser) {
        return { liked: [], watchlist: [], watched: [] };
      }
      
      // Log the API calls for debugging
      console.log("Fetching user lists from API...");
      
      // Fetch all three lists in parallel
      const [likedRes, watchlistRes, watchedRes] = await Promise.all([
        axios.get(`${API_URL}/users/liked`, { withCredentials: true }),
        axios.get(`${API_URL}/users/watchlist`, { withCredentials: true }),
        axios.get(`${API_URL}/users/watched`, { withCredentials: true })
      ]);
      
      // Make sure we have valid data and log it
      const liked = likedRes.data.data || [];
      const watchlist = watchlistRes.data.data || [];
      const watched = watchedRes.data.data || [];
      
      console.log("Liked movies:", liked.length);
      console.log("Watchlist movies:", watchlist.length);
      console.log("Watched movies:", watched.length);
      
      return {
        liked,
        watchlist,
        watched
      };
    } catch (error) {
      console.error('Failed to fetch user lists:', error);
      // Show error toast
      toast.error('Failed to load your movie collections');
      // Return empty collections if there's an error
      return { liked: [], watchlist: [], watched: [] };
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    likeMovie,
    toggleWatchlist,
    toggleWatched,
    getMovieStatus,
    getUserLists
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
