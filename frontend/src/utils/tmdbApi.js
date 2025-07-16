// TMDB API client that connects to our proxy server

const BASE_URL = "https://tmdbproxy-eedtf6bxbae2f4d3.westindia-01.azurewebsites.net/api";

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

// Enhanced search function for better movie matching
export const searchTMDBMovies = async (query, options = {}) => {
  try {
    console.log(`Searching for: "${query}"`);
    
    // Clean up the query - remove descriptions and extra text
    query = query.split('-')[0].split(':')[0].trim();
    
    // Extract year from query if it includes a year pattern (YYYY)
    let year = options.year;
    const yearMatch = query.match(/\(?(\d{4})\)?/);
    if (yearMatch) {
      year = yearMatch[1];
      // Remove year from query to improve matching
      query = query.replace(/\s*\(?\d{4}\)?\s*/, ' ').trim();
    }

    const params = { 
      query, 
      page: 1,
      ...(year && { primary_release_year: year }) 
    };
    
    const data = await fetchFromApi('/search/movie', params);
    return data;
  } catch (error) {
    console.error(`Error searching for movie "${query}":`, error);
    return { results: [] };
  }
};

// Main TMDB API object
export const tmdbApi = {
  // Movies
  getMovies: (params = {}) => fetchFromApi('/movies', params),
  getPopularMovies: (page = 1) => fetchFromApi('/movies/popular', { page }),
  getTopRatedMovies: (page = 1) => fetchFromApi('/movies/top_rated', { page }),
  getUpcomingMovies: (page = 1) => fetchFromApi('/movies/upcoming', { page }),
  getNowPlayingMovies: (page = 1) => fetchFromApi('/movies/now_playing', { page }),
  getMovieDetails: (id) => fetchFromApi(`/movies/${id}`),
  getMovieCredits: (id) => fetchFromApi(`/movies/${id}/credits`),
  getMovieVideos: (id) => fetchFromApi(`/movies/${id}/videos`),
  getSimilarMovies: (id, page = 1) => fetchFromApi(`/movies/${id}/similar`, { page }),
  getMovieRecommendations: (id, page = 1) => fetchFromApi(`/movies/${id}/recommendations`, { page }),
  
  // TV Shows
  getPopularTVShows: (page = 1) => fetchFromApi('/tv/popular', { page }),
  getTVShowDetails: (id) => fetchFromApi(`/tv/${id}`),
  
  // People
  getPersonDetails: (id) => fetchFromApi(`/person/${id}`),
  
  // Genres
  getMovieGenres: () => fetchFromApi('/genres/movie'),
  getTVGenres: () => fetchFromApi('/genres/tv'),
  
  // Discover with filters
  discoverMovies: (params = {}) => {
    const paramsWithDefaults = { page: 1, ...params };
    return fetchFromApi('/discover/movie', paramsWithDefaults);
  },
  discoverTVShows: (params = {}) => fetchFromApi('/discover/tv', params),
  
  // Search
  searchMulti: (query, page = 1) => fetchFromApi('/search/multi', { query, page }),
  searchMovies: (query, page = 1) => fetchFromApi('/movies', { query, page }),
  
  // Search for specific movies with year support
  searchTMDBMovies: async (title, year = null) => {
    try {
      const query = year ? `${title} ${year}` : title;
      const data = await fetchFromApi('/search/movie', { 
        query, 
        page: 1,
        ...(year && { year })
      });
      return data;
    } catch (error) {
      console.error(`Error searching for movie "${title}":`, error);
      return { results: [] };
    }
  }
};

export default tmdbApi;
