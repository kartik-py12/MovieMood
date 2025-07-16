import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FaArrowLeft, FaHeart, FaBookmark, FaCheck, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/common/Footer';
import Spinner from '../components/Spinner';

const Profile = () => {
  const { currentUser, getUserLists, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('liked');
  const [userLists, setUserLists] = useState({
    liked: [],
    watchlist: [],
    watched: []
  });
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchUserLists = async () => {
      if (currentUser) {
        setIsLoading(true);
        try {
          const lists = await getUserLists();
          setUserLists(lists);
        } catch (error) {
          console.error('Failed to fetch user lists:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserLists();
  }, [currentUser, getUserLists]);

  const handleLogout = async () => {
    await logout();
  };

  // Handle tab change
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // If not logged in, redirect to home
  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!currentUser) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-b from-indigo-900/80 to-gray-900 relative">
        <div className="pattern absolute inset-0 opacity-20"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex items-center mb-8">
            <Link to="/" className="flex items-center text-gray-200 hover:text-white transition-colors group">
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
              <span>Back to Home</span>
            </Link>
          </div>
          
          {/* User profile section - fixed alignment */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
              {/* User Avatar with improved styling */}
              <div className="w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center text-5xl font-bold shadow-lg shadow-indigo-900/30 border-4 border-gray-800">
                {currentUser.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              {/* User Info with better spacing */}
              <div className="flex flex-col text-center md:text-left flex-grow">
                <h1 className="text-3xl md:text-5xl font-bold mb-2 text-gradient">
                  {currentUser.username}
                </h1>
                <p className="text-gray-400 mb-6 text-lg md:text-left">
                  {currentUser.email}
                </p>
                
                {/* Stats with improved layout and responsive design */}
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
                
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 mx-auto md:mx-0"
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
      
      {/* Tabs with improved styling */}
      <div className="container mx-auto px-4 py-10">
        {/* Responsive tab buttons */}
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

        {/* Movie Grid with loading state */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
         
          <div className="flex justify-center items-center ml-60">

          
            {userLists[activeTab] && userLists[activeTab].length > 0 ? (
                
              <div className="j grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {userLists[activeTab].map(movie => (
                  <Link 
                    to={movie.media_type === 'tv' ? `/tv/${movie.movieId}` : `/movie/${movie.movieId}`} 
                    key={`${movie.movieId}-${activeTab}`}
                    className="group"
                  >
                    <div className=" bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:shadow-indigo-500/20 group-hover:-translate-y-1 border border-gray-700/50 group-hover:border-indigo-500/30">
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
                        
                   
                        
                        {/* Add info overlay on hover */}
                        {/* <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                          <h3 className="font-bold text-white text-lg">{movie.title}</h3>
                          {movie.addedAt && (
                            <div className="flex items-center text-gray-300 text-sm mt-2">
                              <FaCalendarAlt className="mr-1" />
                              <span>Added: {new Date(movie.addedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div> */}
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

export default Profile;
