// my-tmdb-proxy/index.js

import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { Agent } from "https";
import axiosRetry from 'axios-retry'; // Import axios-retry

const app = express();
dotenv.config();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Environment Variables ---
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";

// --- Caching ---
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// --- Optimized HTTPS Agent ---
// This helps manage connections more effectively to prevent ECONNRESET
const httpsAgent = new Agent({
  keepAlive: true,          // Reuse connections instead of creating new ones
  maxSockets: 50,           // Max number of connections to a single host
  freeSocketTimeout: 30000, // Close idle sockets after 30 seconds to prevent them from becoming stale
  timeout: 60000,           // Abort sockets that are inactive for more than 60 seconds
});

// --- Axios Instance with a Robust Retry Strategy ---
const tmdbAxios = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000, // Set a reasonable timeout for requests
  headers: {
    'accept': 'application/json',
    'Authorization': `Bearer ${TMDB_API_KEY}`,
  },
  httpsAgent: httpsAgent,
});

// Use axios-retry for exponential backoff
axiosRetry(tmdbAxios, {
  retries: 3, // Number of retries
  retryDelay: (retryCount, error) => {
    console.log(`Attempt ${retryCount} failed. Retrying... Error: ${error.message}`);
    // Exponential backoff: 1s, 2s, 4s
    return retryCount * 1000;
  },
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return (
      axiosRetry.isNetworkError(error) ||
      error.code === 'ECONNRESET' ||
      (error.response && error.response.status >= 500)
    );
  },
});

// --- Request Handler ---
const handleTmdbRequest = async (endpoint, params, res) => {
  // const { endpoint } = req.params;
  // const queryParams = req.query;

  // Use the full URL as the cache key to include query params
  const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;
  
  // Check cache first
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[CACHE HIT] for ${cacheKey}`);
    return res.json(cached.data);
  }

  try {
    console.log(`[FETCHING] for ${cacheKey}`);
    const response = await tmdbAxios.get(endpoint, { params: params });

    // Cache the successful response
    responseCache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });

    return res.json(response.data);
  } catch (error) {
    console.error(`[ERROR] Failed to fetch from TMDB: /${endpoint}`, error.message);
    return res.status(error.response?.status || 500).json({
      error: 'Failed to fetch data from TMDB',
      message: error.message
    });
  }
};

// --- Routes ---
app.get("/", (req, res) => {
  res.send("TMDB Proxy API is running");
});




// Health check route
app.get("/api/health", async (req, res) => {
  try {
    const response = await tmdbAxios.get("/configuration");
    res.json({ 
      status: 'ok', 
      message: 'Server and TMDB connection are healthy'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'TMDB connection failed'
    });
  }
});

// Health check specifically for TMDB API
// app.get("/api/healthcheck", async (req, res) => {
//   try {
//     const data = await makeRequestWithRetry("/configuration", {}, 1);
//     res.json({ 
//       status: 'ok', 
//       tmdb_status: 'connected',
//       message: 'TMDB API is accessible',
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(503).json({ 
//       status: 'error', 
//       tmdb_status: 'failed',
//       message: 'Cannot connect to TMDB API',
//       error: error.message,
//       timestamp: new Date().toISOString()
//     });
//   }
// });

// Movies routes
app.get("/api/movies", async (req, res) => {
  const { query, page = 1 } = req.query;
  
  // Handle empty query parameter - default to popular movies
  const endpoint = query && query.trim() !== '' 
    ? `/search/movie`
    : `/movie/popular`;
  
  const params = {
    page: parseInt(page) || 1,
    ...(query && query.trim() !== '' && { query: query.trim() }),
    ...(!query || query.trim() === '' && { sort_by: "popularity.desc" })
  };
  
  console.log(`Movies request - Query: "${query}", Endpoint: ${endpoint}, Params:`, params);
  await handleTmdbRequest(endpoint, params, res);
});

app.get("/api/movies/popular", async (req, res) => {
  const { page = 1 } = req.query;
  await handleTmdbRequest("/movie/popular", { page }, res);
});

app.get("/api/movies/top_rated", async (req, res) => {
  const { page = 1 } = req.query;
  await handleTmdbRequest("/movie/top_rated", { page }, res);
});

app.get("/api/movies/upcoming", async (req, res) => {
  const { page = 1 } = req.query;
  await handleTmdbRequest("/movie/upcoming", { page }, res);
});

app.get("/api/movies/now_playing", async (req, res) => {
  const { page = 1 } = req.query;
  await handleTmdbRequest("/movie/now_playing", { page }, res);
});

app.get("/api/movies/:id", async (req, res) => {
  const { id } = req.params;
  await handleTmdbRequest(`/movie/${id}`, { append_to_response: "videos,credits,similar,recommendations" }, res);
});

app.get("/api/movies/:id/credits", async (req, res) => {
  const { id } = req.params;
  await handleTmdbRequest(`/movie/${id}/credits`, {}, res);
});

app.get("/api/movies/:id/videos", async (req, res) => {
  const { id } = req.params;
  await handleTmdbRequest(`/movie/${id}/videos`, {}, res);
});

app.get("/api/movies/:id/similar", async (req, res) => {
  const { id } = req.params;
  const { page = 1 } = req.query;
  await handleTmdbRequest(`/movie/${id}/similar`, { page }, res);
});

app.get("/api/movies/:id/recommendations", async (req, res) => {
  const { id } = req.params;
  const { page = 1 } = req.query;
  await handleTmdbRequest(`/movie/${id}/recommendations`, { page }, res);
});

// TV Shows routess
app.get("/api/tv/popular", async (req, res) => {
  const { page = 1 } = req.query;
  await handleTmdbRequest("/tv/popular", { page }, res);
});

app.get("/api/tv/:id", async (req, res) => {
  const { id } = req.params;
  await handleTmdbRequest(`/tv/${id}`, { append_to_response: "videos,credits,similar,recommendations" }, res);
});

// People routes
app.get("/api/person/:id", async (req, res) => {
  const { id } = req.params;
  await handleTmdbRequest(`/person/${id}`, { append_to_response: "movie_credits,tv_credits" }, res);
});

// Genres routes
app.get("/api/genres/movie", async (req, res) => {
  await handleTmdbRequest("/genre/movie/list", {}, res);
});

app.get("/api/genres/tv", async (req, res) => {
  await handleTmdbRequest("/genre/tv/list", {}, res);
});

// Discover routes with filters
app.get("/api/discover/movie", async (req, res) => {
  const { 
    page = 1, 
    sort_by = "popularity.desc", 
    with_genres,
    year,
    vote_average_gte,
    with_watch_providers
  } = req.query;
  
  const params = { 
    page, 
    sort_by,
    ...(with_genres && { with_genres }),
    ...(year && { year }),
    ...(vote_average_gte && { "vote_average.gte": vote_average_gte }),
    ...(with_watch_providers && { with_watch_providers })
  };
  try {
    await handleTmdbRequest("/discover/movie", params, res);
  } catch (error) {
    console.error(error);
  }
});

app.get("/api/discover/tv", async (req, res) => {
  const { 
    page = 1, 
    sort_by = "popularity.desc", 
    with_genres,
    first_air_date_year,
    vote_average_gte
  } = req.query;
  
  const params = { 
    page, 
    sort_by,
    ...(with_genres && { with_genres }),
    ...(first_air_date_year && { first_air_date_year }),
    ...(vote_average_gte && { "vote_average.gte": vote_average_gte })
  };
  
  await handleTmdbRequest("/discover/tv", params, res);
});

// Search multi (movies, tv, people)
app.get("/api/search/multi", async (req, res) => {
  const { query, page = 1 } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }
  await handleTmdbRequest("/search/multi", { query, page }, res);
});

// Add specific endpoint for movie search
app.get("/api/search/movie", async (req, res) => {
  const { 
    query, 
    page = 1, 
    year = null, 
    primary_release_year = null,
    include_adult = false 
  } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }
  
  const params = { 
    query, 
    page, 
    include_adult: include_adult === 'true',
    // Use either year or primary_release_year if provided
    ...(primary_release_year && { primary_release_year }),
    ...(year && !primary_release_year && { year })
  };
  
  await handleTmdbRequest("/search/movie", params, res);
});

// For backwards compatibility with your existing code
app.get("/api/search/movies", async (req, res) => {
  // Redirect to the /api/search/movie endpoint
  const queryParams = new URLSearchParams(req.query).toString();
  res.redirect(`/api/search/movie?${queryParams}`);
});

// Cache cleanup every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      responseCache.delete(key);
    }
  }
  console.log(`Cache cleanup completed. Current cache size: ${responseCache.size}`);
}, 10 * 60 * 1000);

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));