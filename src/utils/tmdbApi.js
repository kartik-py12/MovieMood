// TMDB API client that connects to our proxy server

const BASE_URL = "https://trendingmoviebackend-1.onrender.com";

// Helper function for API requests
const fetchFromApi = async (endpoint, params = {}) => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const url = `${BASE_URL}${endpoint}${queryString}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed fetching from ${endpoint}:`, error);
    throw error;
  }
};

// Movie endpoints
export const tmdbApi = {
  // Movies
  getMovies: (params = {}) => fetchFromApi('/api/movies', params),
  getPopularMovies: (page = 1) => fetchFromApi('/api/movies/popular', { page }),
  getTopRatedMovies: (page = 1) => fetchFromApi('/api/movies/top_rated', { page }),
  getUpcomingMovies: (page = 1) => fetchFromApi('/api/movies/upcoming', { page }),
  getNowPlayingMovies: (page = 1) => fetchFromApi('/api/movies/now_playing', { page }),
  getMovieDetails: (id) => fetchFromApi(`/api/movies/${id}`),
  getMovieCredits: (id) => fetchFromApi(`/api/movies/${id}/credits`),
  getMovieVideos: (id) => fetchFromApi(`/api/movies/${id}/videos`),
  getSimilarMovies: (id, page = 1) => fetchFromApi(`/api/movies/${id}/similar`, { page }),
  getMovieRecommendations: (id, page = 1) => fetchFromApi(`/api/movies/${id}/recommendations`, { page }),
  
  // TV Shows
  getPopularTVShows: (page = 1) => fetchFromApi('/api/tv/popular', { page }),
  getTVShowDetails: (id) => fetchFromApi(`/api/tv/${id}`),
  
  // People
  getPersonDetails: (id) => fetchFromApi(`/api/person/${id}`),
  
  // Genres
  getMovieGenres: () => fetchFromApi('/api/genres/movie'),
  getTVGenres: () => fetchFromApi('/api/genres/tv'),
  
  // Discover with filters
  discoverMovies: (params = {}) => {
    const paramsWithDefaults = {
      page: 1,
      ...params
    };
    return fetchFromApi('/api/discover/movie', paramsWithDefaults);
  },
  discoverTVShows: (params = {}) => fetchFromApi('/api/discover/tv', params),
  
  // Search
  searchMulti: (query, page = 1) => fetchFromApi('/api/search/multi', { query, page }),
  searchMovies: (query, page = 1) => fetchFromApi('/api/movies', { query, page }),
};

export default tmdbApi;
