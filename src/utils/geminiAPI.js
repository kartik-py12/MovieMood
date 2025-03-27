import { GoogleGenerativeAI } from "@google/generative-ai";
import { getLocalMovieRecommendation } from "./movieRecommendations";

// Initialize the Generative AI API with your updated API key
const API_KEY = "AIzaSyDl8Yc1ZOwxFGznc2HEGIJDcDkamsOcdo4";
const genAI = new GoogleGenerativeAI(API_KEY);

// Simple in-memory cache
const responseCache = new Map();
const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutes

// Define a system prompt to guide the model's behavior
const SYSTEM_PROMPT = `You are MovieMood, a friendly movie recommendation chatbot.

Your conversation style:
- Keep responses EXTREMELY brief (max 100 words total)
- Use short, concise sentences
- Be conversational and friendly
- Limit to 3-4 movie recommendations MAXIMUM
- Avoid long explanations

Formatting rules:
- For movie titles, format as: "Title (Year)" - very brief description
- For category headings, use: "For [type] fans:" (use sparingly)
- Don't use bullet points or asterisks
- Don't use complex formatting

Example perfect response:
"For action fans: Try Mission Impossible (1996) - spy thriller with iconic stunts, John Wick (2014) - stylish revenge action, or Mad Max: Fury Road (2015) - post-apocalyptic road battle. Which sounds best?"

IMPORTANT: Keep recommendations extremely brief. Avoid long responses at all costs.

You should ALWAYS maintain context from the current conversation. If user asks follow-up questions about a character, show, movie, or topic mentioned earlier in the conversation, refer back to that information and provide a coherent response.`;

// List of common moods to check for single-word mood queries
const COMMON_MOODS = [
  'happy', 'sad', 'excited', 'relaxed', 'bored', 
  'romantic', 'thoughtful', 'scared', 'anxious', 
  'nostalgic', 'adventurous', 'tense', 'curious'
];

// New function to get movie recommendations with conversation history
export const getMovieRecommendationsWithHistory = async (userMessage, conversationHistory = []) => {
  try {
    // Check if it's a single-word mood query
    const normalizedMsg = userMessage.toLowerCase().trim();
    const isSingleMoodQuery = COMMON_MOODS.includes(normalizedMsg);
    
    // Enhanced message for single mood queries
    const enhancedMessage = isSingleMoodQuery
      ? `I'm feeling ${normalizedMsg} today. What movies would you recommend?`
      : userMessage;
    
    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
    
    // If we have conversation history, use it for context
    if (conversationHistory && conversationHistory.length > 0) {
      // Create a chat session with the system prompt and history
      const chat = model.startChat({
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 400,
        },
        systemInstruction: SYSTEM_PROMPT,
        history: conversationHistory.slice(0, -1), // Exclude the last user message since we'll send it
      });
      
      const result = await chat.sendMessage(enhancedMessage);
      return { text: result.response.text(), source: "api" };
    } else {
      // If no history, use the original approach
      return getMovieRecommendations(enhancedMessage);
    }
  } catch (error) {
    console.error("Error with Gemini API (with history):", error);
    
    // Check if it's a rate limit error (429)
    const isRateLimit = error.message && (
      error.message.includes("429") || 
      error.message.includes("Quota exceeded") ||
      error.message.includes("RATE_LIMIT_EXCEEDED")
    );
    
    if (isRateLimit) {
      console.log("Rate limit hit, using local fallback");
      
      // Extract conversation for context in fallback
      const userMessages = conversationHistory
        .filter(msg => msg.role === "user")
        .map(msg => msg.parts[0].text);
      
      const context = userMessages.length > 1 
        ? userMessages.slice(0, -1).join(" ") 
        : "";
      
      return { 
        text: getLocalMovieRecommendation(
          userMessage, 
          true,
          context
        ), 
        source: "fallback"
      };
    }
    
    return { 
      text: "Hi there! I'm having a little trouble right now. Can you tell me what kind of movie you're in the mood for?", 
      source: "error" 
    };
  }
};

// Original function to get movie recommendations from Gemini with fallback
export const getMovieRecommendations = async (userMessage) => {
  try {
    // First, check cache for an identical or very similar query
    const cachedResponse = checkCache(userMessage);
    if (cachedResponse) {
      console.log("Using cached response");
      return { text: cachedResponse, source: "cache" };
    }
    
    // Check if it's a single-word mood query
    const normalizedMsg = userMessage.toLowerCase().trim();
    const isSingleMoodQuery = COMMON_MOODS.includes(normalizedMsg);
    
    // Enhanced message for single mood queries
    const enhancedMessage = isSingleMoodQuery
      ? `I'm feeling ${normalizedMsg} today. What movies would you recommend?`
      : userMessage;
    
    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
    
    // Check if this is likely the first interaction
    const isFirstMessage = isGreetingOrShortQuery(enhancedMessage) && !isSingleMoodQuery;
    
    // If it's the first message or a greeting, append instructions to ask about mood
    const promptToSend = isFirstMessage 
      ? `${enhancedMessage}\n\n[Remember to greet the user warmly and ask about their mood or what they feel like watching today]`
      : enhancedMessage;
    
    // Create a chat session with the system prompt
    const chat = model.startChat({
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 400, // Increase a bit to allow for formatting
      },
      systemInstruction: SYSTEM_PROMPT,
    });
    
    const result = await chat.sendMessage(promptToSend);
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
      
      // Check if it's a single-word mood query
      const normalizedMsg = userMessage.toLowerCase().trim();
      const isSingleMoodQuery = COMMON_MOODS.includes(normalizedMsg);
      
      return { 
        text: getLocalMovieRecommendation(
          isSingleMoodQuery ? `I'm feeling ${normalizedMsg}` : userMessage, 
          true
        ), 
        source: "fallback"
      };
    }
    
    return { 
      text: "Hi there! I'm having a little trouble right now. Can you tell me what kind of movie you're in the mood for?", 
      source: "error" 
    };
  }
};

// Function to check if query is movie-related (accept single moods as movie-related)
export const isMovieRelatedQuery = async (query) => {
  // Check if it's a single-word mood
  const normalizedMsg = query.toLowerCase().trim();
  if (COMMON_MOODS.includes(normalizedMsg)) {
    return true;
  }
  
  // Simple keyword check to avoid API call if possible
  const movieKeywords = [
    "movie", "film", "cinema", "watch", "actor", "actress", "director",
    "show", "tv", "series", "netflix", "hulu", "streaming", "comedy", 
    "drama", "action", "thriller", "sci-fi", "horror", "romance",
    "documentary", "plot", "character", "scene", "anime", "manga"
  ];
  
  // Media character keywords
  const characterKeywords = [
    "zoro", "luffy", "naruto", "goku", "batman", "spider-man", "superman",
    "joker", "harry potter", "jedi", "sith", "ironman", "thor", "hulk"
  ];
  
  // If query contains common movie keywords, skip the API check
  if (movieKeywords.some(keyword => query.toLowerCase().includes(keyword)) ||
      characterKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
    return true;
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
    
    const result = await model.generateContent(`
      Determine if the following query is related to movies, TV shows, actors, directors, fictional characters, or entertainment.
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

// Helper function to detect if message is a greeting or short initial query
function isGreetingOrShortQuery(message) {
  const normalizedMsg = message.toLowerCase().trim();
  
  // Check for common greetings or short messages
  const greetings = ['hi', 'hello', 'hey', 'greetings', 'sup', 'yo', 'hola'];
  
  if (normalizedMsg.length < 20) {
    return true;
  }
  
  // Check if message starts with a greeting
  for (const greeting of greetings) {
    if (normalizedMsg.startsWith(greeting)) {
      return true;
    }
  }
  
  return false;
}

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
