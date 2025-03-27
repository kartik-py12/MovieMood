import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tmdbApi } from '../utils/tmdbApi';
import MovieSlider from './MovieSlider';
import MovieGrid from './MovieGrid';
import GenreSelector from './GenreSelector';
import Loader from './common/Loader';
import ErrorMessage from './common/ErrorMessage';
import './HomeScreen.css';

const HomeScreen = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [genreMovies, setGenreMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all movie data needed for the home screen
  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch genres first
        const genresData = await tmdbApi.getMovieGenres();
        setGenres(genresData.genres || []);
        
        // Set initial selected genre to Action (if exists)
        const actionGenre = genresData.genres?.find(g => g.name === 'Action');
        if (actionGenre) {
          setSelectedGenre(actionGenre);
        }
        
        // Fetch multiple movie categories in parallel
        const [popular, topRated, upcoming] = await Promise.all([
          tmdbApi.getPopularMovies(),
          tmdbApi.getTopRatedMovies(),
          tmdbApi.getUpcomingMovies()
        ]);
        
        setPopularMovies(popular.results || []);
        setTopRatedMovies(topRated.results || []);
        setUpcomingMovies(upcoming.results || []);
        
        // If we have an action genre, fetch action movies
        if (actionGenre) {
          const actionMovies = await tmdbApi.discoverMovies({ with_genres: actionGenre.id });
          setGenreMovies(actionMovies.results || []);
        }
      } catch (err) {
        console.error('Error fetching home screen data:', err);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);

  // Handle genre selection
  const handleGenreSelect = async (genre) => {
    if (genre.id === selectedGenre?.id) return;
    
    setSelectedGenre(genre);
    setLoading(true);
    
    try {
      const genreMovies = await tmdbApi.discoverMovies({ with_genres: genre.id });
      setGenreMovies(genreMovies.results || []);
    } catch (err) {
      console.error(`Error fetching ${genre.name} movies:`, err);
      setError(`Failed to load ${genre.name} movies. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && (!popularMovies.length && !topRatedMovies.length)) {
    return <Loader message="Loading movies..." />;
  }

  if (error && !popularMovies.length) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {popularMovies.length > 0 && (
        <section className="w-full">
          <MovieSlider movies={popularMovies.slice(0, 10)} />
        </section>
      )}
      
      <div className="container mx-auto px-4 py-8 space-y-12">
        {popularMovies.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Popular Movies</h2>
              <Link to="/movies/popular" className="text-blue-400 hover:text-blue-300 transition-colors">View All</Link>
            </div>
            <MovieGrid movies={popularMovies.slice(0, 12)} />
          </section>
        )}
        
        {topRatedMovies.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Top Rated Movies</h2>
              <Link to="/movies/top-rated" className="text-blue-400 hover:text-blue-300 transition-colors">View All</Link>
            </div>
            <MovieGrid movies={topRatedMovies.slice(0, 12)} />
          </section>
        )}
        
        {upcomingMovies.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Upcoming Movies</h2>
              <Link to="/movies/upcoming" className="text-blue-400 hover:text-blue-300 transition-colors">View All</Link>
            </div>
            <MovieGrid movies={upcomingMovies.slice(0, 12)} />
          </section>
        )}
        
        {genres.length > 0 && (
          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">Browse by Genre</h2>
              <GenreSelector 
                genres={genres} 
                selectedGenre={selectedGenre}
                onSelectGenre={handleGenreSelect} 
              />
            </div>
            {genreMovies.length > 0 ? (
              <MovieGrid movies={genreMovies.slice(0, 12)} />
            ) : (
              <p className="text-center py-10 text-gray-400">No movies found for this genre</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
