import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { tmdbApi } from '../utils/tmdbApi';
import MovieCard from './MovieCard';
import Loader from './common/Loader';
import ErrorMessage from './common/ErrorMessage';
import './MovieSearch.css';

const MovieSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('query') || '';
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch movies when the search query changes
  const fetchMovies = useCallback(async (query, page = 1) => {
    if (!query.trim()) {
      setMovies([]);
      setTotalPages(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await tmdbApi.searchMovies(query, page);
      
      if (page === 1) {
        setMovies(data.results || []);
      } else {
        setMovies(prevMovies => [...prevMovies, ...(data.results || [])]);
      }
      
      setTotalPages(data.total_pages || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error searching movies:', err);
      setError('Failed to search movies. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setCurrentQuery(searchQuery);
      fetchMovies(searchQuery);
    }
  }, [searchQuery, fetchMovies]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (currentQuery.trim()) {
      setSearchParams({ query: currentQuery });
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      fetchMovies(searchQuery, currentPage + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-white">Movie Search</h1>
        <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
          <div className="relative">
            <input 
              type="text" 
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              placeholder="Search for movies..."
              className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              type="submit" 
              className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-white transition-colors"
            >
              <FaSearch />
            </button>
          </div>
        </form>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => fetchMovies(searchQuery)} />}

      {searchQuery && !loading && movies.length === 0 && !error && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-300 mb-2">No movies found for "{searchQuery}"</p>
          <p className="text-gray-400">
            Try searching with different keywords or browse our <Link to="/" className="text-blue-400 hover:underline">popular movies</Link>
          </p>
        </div>
      )}

      {movies.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white">Search Results for "{searchQuery}"</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          
          {currentPage < totalPages && (
            <div className="mt-8 text-center">
              <button 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}

      {loading && <Loader message="Searching movies..." />}
    </div>
  );
};

export default MovieSearch;
