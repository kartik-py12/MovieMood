import { GoogleGenerativeAI } from "@google/generative-ai";
import { getLocalMovieRecommendation } from "./movieRecommendations";

// Initialize the Generative AI API with your updated API key
const API_KEY = "AIzaSyDl8Yc1ZOwxFGznc2HEGIJDcDkamsOcdo4";
const genAI = new GoogleGenerativeAI(API_KEY);

// Simple in-memory cache
const responseCache = new Map();
const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutes

// Define a system prompt to guide the model's behavior
const SYSTEM_PROMPT = `You are a helpful movie recommendation assistant.
- Only respond to questions about movies, TV shows, actors, directors, or general entertainment topics.
- If asked about any other topic, politely decline and steer the conversation back to movies.
- For movie recommendations, provide 3-5 specific titles with their release year and a brief description.
- When recommending movies, try to suggest a diverse mix across different eras, not just recent films.
- Keep responses concise but informative, focusing on movie recommendations.
- Format your response in a clean, easily readable way.
- Remember user preferences from the conversation and personalize recommendations accordingly.`;

// Function to get movie recommendations from Gemini with fallback
export const getMovieRecommendations = async (userMessage) => {
  try {
    // First, check cache for an identical or very similar query
    const cachedResponse = checkCache(userMessage);
    if (cachedResponse) {
      console.log("Using cached response");
      return { text: cachedResponse, source: "cache" };
    }
    
    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
    const result = await model.generateContent(userMessage);
    const response = result.response.text();
    
    
    // Cache this response
    cacheResponse(userMessage, response);
    
    return { text: response, source: "api" };
  } catch (error) {
    console.error("Error with Gemini API:", error);
    
    // Check if it's a rate limit error (429)
    const isRateLimit = error.message && (
      error.message.includes("429") || 
      error.message.includes("Quota exceeded") ||
      error.message.includes("RATE_LIMIT_EXCEEDED")
    );
    
    if (isRateLimit) {
      console.log("Rate limit hit, using local fallback");
      return { 
        text: getLocalMovieRecommendation(userMessage),
        source: "fallback"
      };
    }
    
    return { 
      text: "Sorry, I'm having trouble getting movie recommendations right now. Please try again later.", 
      source: "error" 
    };
  }
};

// Function to check if query is movie-related
export const isMovieRelatedQuery = async (query) => {
  try {
    // Simple keyword check to avoid API call if possible
    const movieKeywords = [
      "movie", "film", "cinema", "watch", "actor", "actress", "director",
      "show", "tv", "series", "netflix", "hulu", "streaming", "comedy", 
      "drama", "action", "thriller", "sci-fi", "horror", "romance",
      "documentary", "plot", "character", "scene"
    ];
    
    // If query contains common movie keywords, skip the API check
    if (movieKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
      return true;
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
    
    const result = await model.generateContent(`
      Determine if the following query is related to movies, TV shows, actors, directors, or entertainment.
      Answer with only "YES" or "NO".
      Query: "${query}"
    `);
    
    const response = result.response.text().trim();
    return response.includes("YES");
  } catch (error) {
    console.error("Error checking query relevance:", error);
    
    // If rate limited, do a simple check
    const commonNonMovieKeywords = ["politics", "math", "science", "programming", "weather", "sports"];
    const hasNonMovieKeywords = commonNonMovieKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
    
    // Assume it's movie-related if not clearly non-movie
    return !hasNonMovieKeywords;
  }
};

// Caching functions
function cacheResponse(query, response) {
  const normalizedQuery = normalizeQuery(query);
  responseCache.set(normalizedQuery, {
    response,
    timestamp: Date.now()
  });
}

function checkCache(query) {
  const normalizedQuery = normalizeQuery(query);
  const cachedItem = responseCache.get(normalizedQuery);
  
  if (cachedItem) {
    // Check if cache is still valid
    if (Date.now() - cachedItem.timestamp < CACHE_EXPIRY) {
      return cachedItem.response;
    } else {
      // Remove expired cache
      responseCache.delete(normalizedQuery);
    }
  }
  
  return null;
}

function normalizeQuery(query) {
  // Normalize the query to increase cache hits
  return query.toLowerCase().trim().replace(/\s+/g, ' ');
}
