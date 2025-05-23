import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FaArrowLeft, FaHeart, FaBookmark, FaCheck, FaClock, FaCalendarAlt, FaStar, FaSyncAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/common/Footer';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';

const Profile = () => {
  // Get context data with mood analysis functions
  const { currentUser, getUserLists, loading: authLoading, logout, getUserMoodAnalysis, requestMoodAnalysis } = useAuth();
  const [activeTab, setActiveTab] = useState('liked');
  const [userLists, setUserLists] = useState({
    liked: [],
    watchlist: [],
    watched: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userMoods, setUserMoods] = useState([]);
  const [moodsLoading, setMoodsLoading] = useState(false);

  // Fetch user lists (liked, watchlist, watched)
  useEffect(() => {
    const fetchUserLists = async () => {
      if (currentUser) {
        setIsLoading(true);
        try {
          const lists = await getUserLists();
          setUserLists(lists);
        } catch (error) {
          console.error('Failed to fetch user lists:', error);
          toast.error('Failed to load your movie collections');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserLists();
  }, [currentUser, getUserLists]);

  // Fetch user mood analysis from the API
  useEffect(() => {
    const fetchUserMoods = async () => {
      if (currentUser) {
        setMoodsLoading(true);
        try {
          const moods = await getUserMoodAnalysis();
          setUserMoods(moods);
        } catch (error) {
          console.error('Failed to fetch mood analysis:', error);
        } finally {
          setMoodsLoading(false);
        }
      }
    };

    fetchUserMoods();
  }, [currentUser, getUserMoodAnalysis]);

  const handleLogout = async () => {
    await logout();
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // Request a new mood analysis - update to use the context function
  const handleRefreshMoodAnalysis = async () => {
    if (!userLists.liked || userLists.liked.length === 0) {
      toast.error('You need to like some movies first!');
      return;
    }

    setMoodsLoading(true);
    try {
      const moods = await requestMoodAnalysis(userLists.liked);
      setUserMoods(moods);
    } catch (error) {
      console.error('Failed to refresh mood analysis:', error);
    } finally {
      setMoodsLoading(false);
    }
  };

  // Fix: Use authLoading instead of undefined loading
  if (authLoading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!currentUser) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gradient-to-b from-indigo-900/80 to-gray-900 ">
        <div className="pattern absolute inset-0 opacity-20"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex items-center mb-8">
            <Link to="/" className="flex items-center text-gray-200 hover:text-white transition-colors group">
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
              <span>Back to Home</span>
            </Link>
          </div>
          
          <div className="max-w-5xl mx-auto ">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
              <div className="w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center text-5xl font-bold shadow-lg shadow-indigo-900/30 border-4 border-gray-800">
                {currentUser.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              <div className="flex flex-col text-right md:text-left flex-grow">
                <h1 className="text-3xl md:text-5xl font-bold mb-2 text-gradient">
                  {currentUser.username}
                </h1>
                <p className="text-gray-400 mb-6 text-lg md:text-left">
                  {currentUser.email}
                </p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 lg:gap-8 mb-8">
                  <div className="text-center bg-gray-800/50 px-5 md:px-6 py-3 rounded-lg border border-gray-700/50 hover:border-indigo-500/30 transition-all">
                    <p className="text-2xl md:text-3xl font-bold text-red-500">{userLists.liked?.length || 0}</p>
                    <p className="text-gray-400 text-xs md:text-sm uppercase tracking-wider mt-1">Liked</p>
                  </div>
                  <div className="text-center bg-gray-800/50 px-5 md:px-6 py-3 rounded-lg border border-gray-700/50 hover:border-indigo-500/30 transition-all">
                    <p className="text-2xl md:text-3xl font-bold text-indigo-500">{userLists.watchlist?.length || 0}</p>
                    <p className="text-gray-400 text-xs md:text-sm uppercase tracking-wider mt-1">Watchlist</p>
                  </div>
                  <div className="text-center bg-gray-800/50 px-5 md:px-6 py-3 rounded-lg border border-gray-700/50 hover:border-indigo-500/30 transition-all">
                    <p className="text-2xl md:text-3xl font-bold text-green-500">{userLists.watched?.length || 0}</p>
                    <p className="text-gray-400 text-xs md:text-sm uppercase tracking-wider mt-1">Watched</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-bold text-center md:text-left">Your Movie Taste Profile</h3>
                    <button 
                      onClick={handleRefreshMoodAnalysis} 
                      disabled={moodsLoading || userLists.liked?.length === 0}
                      className="text-indigo-400 hover:text-indigo-300 disabled:text-gray-500 flex items-center text-sm"
                      title="Refresh mood analysis"
                    >
                      <FaSyncAlt className={`mr-1 ${moodsLoading ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                  
                  {moodsLoading ? (
                    <div className="flex justify-center md:justify-start my-4 items-center">
                      <div className="w-6 h-6">
                        <Spinner />
                      </div>
                      <span className="ml-2 text-gray-400">Analyzing your preferences...</span>
                    </div>
                  ) : userMoods && userMoods.length > 0 ? (
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                      {userMoods.map((mood) => (
                        <div 
                          key={mood.name}
                          className="px-3 py-2 rounded-full text-sm font-medium flex items-center"
                          style={{
                            backgroundColor: getMoodColor(mood.name, '20'),
                            color: getMoodColor(mood.name, 'full'),
                            border: `1px solid ${getMoodColor(mood.name, '40')}`
                          }}
                        >
                          {getMoodIcon(mood.name)}
                          <span className="ml-1">{mood.name}</span>
                          <span className="ml-1 opacity-70">({mood.score}%)</span>
                        </div>
                      ))}
                    </div>
                  ) : userLists.liked?.length === 0 ? (
                    <p className="text-gray-400 text-center md:text-left">
                      Like some movies to see your taste profile
                    </p>
                  ) : (
                    <div className="flex flex-col items-center md:items-start gap-2">
                      <p className="text-gray-400">
                        No mood analysis available yet
                      </p>
                      <button
                        onClick={handleRefreshMoodAnalysis}
                        className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded-md transition-colors"
                      >
                        Generate Analysis
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 w-max text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 mx-auto md:mx-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs section */}
      <div className="container mx-auto px-4 py-10">
        {/* Tab navigation */}
        <div className="flex flex-wrap justify-center border-b border-gray-700/70 mb-8">
          <button
            type="button"
            className="px-4 sm:px-6 md:px-8 py-3 font-medium flex items-center cursor-pointer z-10 relative outline-none focus:outline-none transition-all text-center flex-1 sm:flex-none"
            onClick={() => handleTabChange('liked')}
            style={{
              color: activeTab === 'liked' ? '#ef4444' : '#9ca3af',
              borderBottom: activeTab === 'liked' ? '2px solid #ef4444' : 'none',
              transform: activeTab === 'liked' ? 'translateY(1px)' : 'none'
            }}
          >
            <FaHeart className={`mr-1 md:mr-2 ${activeTab === 'liked' ? 'text-red-500' : 'text-gray-400'}`} /> 
            <span className="text-sm md:text-lg">Liked</span>
          </button>
          <button
            type="button"
            className="px-4 sm:px-6 md:px-8 py-3 font-medium flex items-center cursor-pointer z-10 relative outline-none focus:outline-none transition-all text-center flex-1 sm:flex-none"
            onClick={() => handleTabChange('watchlist')}
            style={{
              color: activeTab === 'watchlist' ? '#6366f1' : '#9ca3af',
              borderBottom: activeTab === 'watchlist' ? '2px solid #6366f1' : 'none',
              transform: activeTab === 'watchlist' ? 'translateY(1px)' : 'none'
            }}
          >
            <FaBookmark className={`mr-1 md:mr-2 ${activeTab === 'watchlist' ? 'text-indigo-500' : 'text-gray-400'}`} /> 
            <span className="text-sm md:text-lg">Watchlist</span>
          </button>
          <button
            type="button"
            className="px-4 sm:px-6 md:px-8 py-3 font-medium flex items-center cursor-pointer z-10 relative outline-none focus:outline-none transition-all text-center flex-1 sm:flex-none"
            onClick={() => handleTabChange('watched')}
            style={{
              color: activeTab === 'watched' ? '#10b981' : '#9ca3af',
              borderBottom: activeTab === 'watched' ? '2px solid #10b981' : 'none',
              transform: activeTab === 'watched' ? 'translateY(1px)' : 'none'
            }}
          >
            <FaCheck className={`mr-1 md:mr-2 ${activeTab === 'watched' ? 'text-green-500' : 'text-gray-400'}`} /> 
            <span className="text-sm md:text-lg">Watched</span>
          </button>
        </div>

        {/* Movie lists */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          // Fix: Remove the unnecessary ml-60 that was causing layout issues
          <div className="max-w-7xl mx-auto">
            {userLists[activeTab] && userLists[activeTab].length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {userLists[activeTab].map(movie => (
                  <Link 
                    to={movie.media_type === 'tv' ? `/tv/${movie.movieId}` : `/movie/${movie.movieId}`} 
                    key={`${movie.movieId}-${activeTab}`}
                    className="group"
                  >
                    <div className="bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:shadow-indigo-500/20 group-hover:-translate-y-1 border border-gray-700/50 group-hover:border-indigo-500/30">
                      <div className="aspect-[2/3] relative">
                        <img 
                          src={
                            movie.poster_path 
                              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                              : '/no-poster.png'
                          } 
                          alt={movie.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/no-poster.png';
                          }}
                        />
                        {movie.media_type === 'tv' && (
                          <div className="absolute top-2 left-2 bg-indigo-700/90 px-2 py-1 text-xs font-bold rounded">
                            TV Series
                          </div>
                        )}
                        
           
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-bold mb-1 group-hover:text-indigo-400 transition-colors line-clamp-1">{movie.title}</h3>
                        <div className="flex items-center text-gray-400 text-sm">
                          <FaClock className="mr-1" />
                          <span>{movie.addedAt ? new Date(movie.addedAt).toLocaleDateString() : 'Date unknown'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4">
                <div className="bg-gray-800/50 max-w-lg mx-auto rounded-xl p-8 border border-gray-700/50">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-700/50 flex items-center justify-center">
                    {activeTab === 'liked' && <FaHeart className="text-red-500/70 text-3xl" />}
                    {activeTab === 'watchlist' && <FaBookmark className="text-indigo-500/70 text-3xl" />}
                    {activeTab === 'watched' && <FaCheck className="text-green-500/70 text-3xl" />}
                  </div>
                  <h3 className="text-xl font-medium text-gray-300 mb-3">
                    {activeTab === 'liked' && "You haven't liked any movies yet"}
                    {activeTab === 'watchlist' && "Your watchlist is empty"}
                    {activeTab === 'watched' && "You haven't marked any movies as watched"}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Discover great movies and add them to your {activeTab} list
                  </p>
                  <Link 
                    to="/" 
                    className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-700 rounded-lg text-white font-medium transition-all shadow-lg shadow-indigo-700/30 hover:shadow-indigo-700/50"
                  >
                    Discover Movies
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

// Helper function to generate mock mood data until backend is ready
const generateMockMoods = () => {
  const moodTypes = [
    'Action-oriented', 'Romantic', 'Adventurous', 
    'Dramatic', 'Comedic', 'Thrilling',
    'Intellectual', 'Inspirational', 'Dark', 'Nostalgic'
  ];
  
  // Shuffle array and take first 4-5 entries
  const shuffled = [...moodTypes].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.floor(Math.random() * 2) + 4);
  
  // Create percentages that sum to 100
  let remaining = 100;
  return selected.map((mood, index) => {
    const isLast = index === selected.length - 1;
    const score = isLast ? remaining : Math.floor(Math.random() * (remaining - 5) + 5);
    remaining -= score;
    return { name: mood, score };
  }).sort((a, b) => b.score - a.score); // Sort by score descending
};

// Helper functions for mood rendering
const getMoodColor = (mood, opacity = 'full') => {
  const colors = {
    'Action-oriented': { full: '#ef4444', '40': 'rgba(239, 68, 68, 0.4)', '20': 'rgba(239, 68, 68, 0.2)' },
    'Romantic': { full: '#ec4899', '40': 'rgba(236, 72, 153, 0.4)', '20': 'rgba(236, 72, 153, 0.2)' },
    'Adventurous': { full: '#f97316', '40': 'rgba(249, 115, 22, 0.4)', '20': 'rgba(249, 115, 22, 0.2)' },
    'Dramatic': { full: '#8b5cf6', '40': 'rgba(139, 92, 246, 0.4)', '20': 'rgba(139, 92, 246, 0.2)' },
    'Comedic': { full: '#eab308', '40': 'rgba(234, 179, 8, 0.4)', '20': 'rgba(234, 179, 8, 0.2)' },
    'Thrilling': { full: '#6366f1', '40': 'rgba(99, 102, 241, 0.4)', '20': 'rgba(99, 102, 241, 0.2)' },
    'Intellectual': { full: '#14b8a6', '40': 'rgba(20, 184, 166, 0.4)', '20': 'rgba(20, 184, 166, 0.2)' },
    'Inspirational': { full: '#22c55e', '40': 'rgba(34, 197, 94, 0.4)', '20': 'rgba(34, 197, 94, 0.2)' },
    'Dark': { full: '#4b5563', '40': 'rgba(75, 85, 99, 0.4)', '20': 'rgba(75, 85, 99, 0.2)' },
    'Nostalgic': { full: '#a855f7', '40': 'rgba(168, 85, 247, 0.4)', '20': 'rgba(168, 85, 247, 0.2)' },
  };
  
  return (colors[mood] || colors['Dark'])[opacity];
};

const getMoodIcon = (mood) => {
  const icons = {
    'Action-oriented': '🔥',
    'Romantic': '❤️',
    'Adventurous': '🌋',
    'Dramatic': '🎭',
    'Comedic': '😂',
    'Thrilling': '😱',
    'Intellectual': '🧠',
    'Inspirational': '✨',
    'Dark': '🖤',
    'Nostalgic': '📽️',
  };
  
  return icons[mood] || '🎬';
};

export default Profile;
