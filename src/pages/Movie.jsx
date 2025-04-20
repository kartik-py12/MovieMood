import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaCalendarAlt, FaClock } from 'react-icons/fa';
import MovieActions from '../components/movie/MovieActions';
import AuthModal from '../components/auth/AuthModal';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Footer from '../components/common/Footer';

const Movie = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { currentUser } = useAuth();

  const API_BASE_URL = "https://trendingmoviebackend-fkde.onrender.com/api";

  // Format runtime to hours and minutes
  const formatRuntime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Get year from release date
  const getYear = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
  };

  // Fetch movie details, credits, videos and similar movies
  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch movie details
        const movieRes = await fetch(`${API_BASE_URL}/movie/${id}?append_to_response=videos,similar,credits`);
        
        if (!movieRes.ok) {
          throw new Error(`Failed to fetch movie data (${movieRes.status})`);
        }
        
        const movieData = await movieRes.json();
        setMovie(movieData);
        
        // Extract credits
        if (movieData.credits) {
          setCredits(movieData.credits);
        }
        
        // Extract videos (trailer, etc)
        if (movieData.videos && movieData.videos.results) {
          // Prioritize official trailers, then any trailers, then teasers
          const sortedVideos = [...movieData.videos.results].sort((a, b) => {
            // Prefer YouTube videos
            if (a.site === 'YouTube' && b.site !== 'YouTube') return -1;
            if (a.site !== 'YouTube' && b.site === 'YouTube') return 1;
            
            // Prefer official trailers
            if (a.type === 'Trailer' && a.official && !(b.type === 'Trailer' && b.official)) return -1;
            if (b.type === 'Trailer' && b.official && !(a.type === 'Trailer' && a.official)) return 1;
            
            // Prefer any trailers
            if (a.type === 'Trailer' && b.type !== 'Trailer') return -1;
            if (a.type !== 'Trailer' && b.type === 'Trailer') return 1;
            
            // Prefer teasers
            if (a.type === 'Teaser' && b.type !== 'Teaser') return -1;
            if (a.type !== 'Teaser' && b.type === 'Teaser') return 1;
            
            // Default to most recent
            return new Date(b.published_at) - new Date(a.published_at);
          });
          
          setVideos(sortedVideos);
        }
        
        // Extract similar movies
        if (movieData.similar && movieData.similar.results) {
          setSimilar(movieData.similar.results);
        }
      } catch (err) {
        console.error('Error fetching movie data:', err);
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
    
    // Scroll to top on id change
    window.scrollTo(0, 0);
  }, [id]);

  // Get trailer URL
  const getTrailerUrl = () => {
    const trailer = videos.find(video => 
      video.site === 'YouTube' && 
      (video.type === 'Trailer' || video.type === 'Teaser')
    );
    
    return trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=0` : null;
  };

  const toggleAuthModal = () => {
    setShowAuthModal(!showAuthModal);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Error</h1>
      <p className="text-gray-300 mb-6">{error}</p>
      <Link to="/" className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg transition-colors">
        Go Home
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Backdrop Image with Gradient Overlay */}
      {movie.backdrop_path && (
        <div className="h-[50vh] md:h-[70vh] w-full relative">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/80 to-gray-900"></div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8 -mt-32 md:-mt-48 relative z-10">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white">
            <FaArrowLeft className="mr-2" /> Back to Home
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Movie Poster */}
          <div className="md:col-span-1">
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : 'https://via.placeholder.com/500x750?text=No+Poster'
                }
                alt={movie.title}
                className="w-full h-auto"
              />
            </div>
          </div>
          
          {/* Movie Info */}
          <div className="md:col-span-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
              {movie.title}{' '}
              <span className="text-gray-400 font-normal">
                ({getYear(movie.release_date)})
              </span>
            </h1>
            
            {/* Tagline */}
            {movie.tagline && (
              <p className="text-xl text-gray-400 italic mb-4">{movie.tagline}</p>
            )}
            
            {/* Stats */}
            <div className="flex flex-wrap gap-4 items-center text-gray-300 mb-6">
              {/* Rating */}
              {movie.vote_average > 0 && (
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400" />
                  <span>{movie.vote_average.toFixed(1)} / 10</span>
                </div>
              )}
              
              {/* Release Date */}
              {movie.release_date && (
                <div className="flex items-center gap-1">
                  <FaCalendarAlt className="text-gray-400" />
                  <span>{movie.release_date}</span>
                </div>
              )}
              
              {/* Runtime */}
              {movie.runtime && (
                <div className="flex items-center gap-1">
                  <FaClock className="text-gray-400" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              )}
              
              {/* Genres */}
              {movie.genres && (
                <div className="text-gray-400">
                  {movie.genres.map(genre => genre.name).join(', ')}
                </div>
              )}
            </div>
            
            {/* Movie Actions */}
            <div className="mb-6">
              <MovieActions movie={movie} />
              
              {!currentUser && (
                <button 
                  onClick={toggleAuthModal} 
                  className="text-indigo-400 hover:text-indigo-300 text-sm mt-2"
                >
                  Sign in to save this movie to your lists
                </button>
              )}
            </div>
            
            {/* Overview */}
            {movie.overview && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">Overview</h3>
                <p className="text-gray-300">{movie.overview}</p>
              </div>
            )}
            
            {/* Directors and Writers */}
            {credits && credits.crew && (
              <div className="mb-8">
                {/* Directors */}
                {credits.crew.filter(person => person.job === 'Director').length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-gray-400 font-medium">Director</h4>
                    <div className="text-white">
                      {credits.crew
                        .filter(person => person.job === 'Director')
                        .map(director => director.name)
                        .join(', ')}
                    </div>
                  </div>
                )}
                
                {/* Writers */}
                {credits.crew.filter(person => ['Screenplay', 'Writer', 'Story'].includes(person.job)).length > 0 && (
                  <div>
                    <h4 className="text-gray-400 font-medium">Writers</h4>
                    <div className="text-white">
                      {credits.crew
                        .filter(person => ['Screenplay', 'Writer', 'Story'].includes(person.job))
                        .map(writer => writer.name)
                        .filter((name, index, self) => self.indexOf(name) === index)
                        .join(', ')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Trailer Section */}
        {getTrailerUrl() && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Trailer</h2>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={getTrailerUrl()}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg w-full h-full max-w-4xl mx-auto"
              ></iframe>
            </div>
          </div>
        )}
        
        {/* Cast Section */}
        {credits && credits.cast && credits.cast.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-x-auto">
              {credits.cast.slice(0, 12).map(person => (
                <Link 
                  to={`/person/${person.id}`} 
                  key={person.id}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors"
                >
                  <div>
                    <img 
                      src={
                        person.profile_path 
                          ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
                          : 'https://via.placeholder.com/300x450?text=No+Image'
                      } 
                      alt={person.name}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                    <div className="p-3">
                      <h3 className="font-bold text-white text-sm">{person.name}</h3>
                      {person.character && (
                        <p className="text-gray-400 text-xs mt-1">{person.character}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Similar Movies */}
        {similar && similar.length > 0 && (
          <div className="mt-16 mb-12">
            <h2 className="text-2xl font-bold mb-6">Similar Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {similar.slice(0, 12).map(movie => (
                <Link 
                  to={`/movie/${movie.id}`} 
                  key={movie.id}
                  className="group"
                >
                  <div className="bg-gray-800 rounded-lg overflow-hidden transition-all group-hover:bg-gray-700">
                    <div className="aspect-[2/3] relative">
                      <img 
                        src={
                          movie.poster_path 
                            ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                            : 'https://via.placeholder.com/300x450?text=No+Poster'
                        } 
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {movie.vote_average > 0 && (
                        <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 px-2 py-1 rounded text-sm font-bold flex items-center">
                          ★ {movie.vote_average.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                        {movie.title}
                      </h3>
                      {movie.release_date && (
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(movie.release_date).getFullYear()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
      
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={toggleAuthModal} />
    </div>
  );
};

export default Movie;
