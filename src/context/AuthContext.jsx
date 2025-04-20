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

  // Backend API URL - use the hosted URL
  const API_URL = "http://localhost:5000/api";
  
  // Update axios configuration for cross-domain requests
  axios.defaults.withCredentials = true;
  
  // Create auth token handler
  const setAuthToken = (token) => {
    if (token) {
      // Set token in localStorage
      localStorage.setItem('authToken', token);
      // Set auth header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      // Remove token from localStorage
      localStorage.removeItem('authToken');
      // Remove auth header
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Check token in localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (token) {
      setAuthToken(token);
    }
    
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    }
    
    const checkLoggedIn = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/me`);
        
        if (res.data.status === 'success') {
          const userData = res.data.data;
          setCurrentUser(userData);
          localStorage.setItem('currentUser', JSON.stringify(userData));
        }
      } catch (error) {
        console.log('Not logged in or session expired');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setCurrentUser(null);
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
      });
      
      const userData = res.data.user;
      const token = res.data.token;
      
      // Set token in axios and localStorage
      setAuthToken(token);
      
      setCurrentUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
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
      });
      
      const userData = res.data.user;
      const token = res.data.token;
      
      // Set token in axios and localStorage
      setAuthToken(token);
      
      setCurrentUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
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
      await axios.get(`${API_URL}/auth/logout`);
      
      // Clear auth token and user data
      setAuthToken(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      setCurrentUser(null);
      
      toast.success('Successfully logged out');
      return true;
    } catch (error) {
      // Still clear the user on frontend regardless of API error
      setAuthToken(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      setCurrentUser(null);
      
      const message = error.response?.data?.message || 'Logout failed';
      setError(message);
      toast.error(message);
      return false;
    }
  };

  // Movie interaction functions
  const likeMovie = async (movieData) => {
    try {
      if (!currentUser) throw new Error("You must be logged in");
      
      const res = await axios.post(`${API_URL}/movies/like`, movieData, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (res.data.liked) {
        toast.success(`Added "${movieData.title}" to liked movies`);
      } else {
        toast.success(`Removed "${movieData.title}" from liked movies`);
      }
      
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update liked movies';
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
        withCredentials: true,
        headers: {
          'Accept': 'application/json'
        }
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
        axios.get(`${API_URL}/users/liked`, { 
          withCredentials: true,
          headers: { 'Accept': 'application/json' }
        }),
        axios.get(`${API_URL}/users/watchlist`, { 
          withCredentials: true,
          headers: { 'Accept': 'application/json' }
        }),
        axios.get(`${API_URL}/users/watched`, { 
          withCredentials: true,
          headers: { 'Accept': 'application/json' }
        })
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

  // Get user's mood analysis
  const getUserMoodAnalysis = async () => {
    try {
      if (!currentUser) return [];
      
      const response = await axios.get(`${API_URL}/users/moods`, {
        withCredentials: true
      });
      
      if (response.data && response.data.status === 'success') {
        return response.data.moods || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to get mood analysis:', error);
      return [];
    }
  };
  
  // Request a new mood analysis based on liked movies
  const requestMoodAnalysis = async (likedMovies) => {
    try {
      if (!currentUser) return [];
      
      const response = await axios.post(`${API_URL}/users/mood-analysis`, {
        likedMovies
      }, { withCredentials: true });
      
      if (response.data && response.data.status === 'success') {
        toast.success('Your taste profile has been updated!');
        return response.data.moods;
      }
      return [];
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to analyze movie preferences';
      toast.error(message);
      console.error('Mood analysis error:', error);
      return [];
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
    getUserLists,
    getUserMoodAnalysis,
    requestMoodAnalysis
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
