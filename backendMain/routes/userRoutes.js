const express = require('express');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

// Predefined mood categories
const moodCategories = [
  'Action-oriented', 'Romantic', 'Adventurous', 
  'Dramatic', 'Comedic', 'Thrilling',
  'Intellectual', 'Inspirational', 'Dark', 'Nostalgic'
];

// Protect all routes
router.use(isAuthenticated);

// Get user's liked movies
router.get('/liked', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      data: user.likedMovies
    });
  } catch (error) {
    next(error);
  }
});

// Get user's watchlist
router.get('/watchlist', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      data: user.watchlist
    });
  } catch (error) {
    next(error);
  }
});

// Get user's watched movies
router.get('/watched', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      data: user.watched
    });
  } catch (error) {
    next(error);
  }
});

// Add new routes for mood analysis

// Get user's mood analysis
router.get('/moods', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      moods: user.moods || []
    });
  } catch (error) {
    console.error('Error fetching user moods:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user moods'
    });
  }
});

// Analyze user's mood based on liked movies
router.post('/mood-analysis', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { likedMovies } = req.body;
    
    if (!likedMovies || likedMovies.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No liked movies provided for analysis'
      });
    }
    
    // Prepare movie data for analysis
    const movieData = likedMovies.map(movie => ({
      title: movie.title,
      id: movie.movieId
    }));
    
    // Call Gemini API to analyze mood based on movies
    let moods;
    try {
      moods = await analyzeMovieMoodsWithGemini(movieData);
    } catch (aiError) {
      console.error('AI analysis failed, using fallback:', aiError);
      moods = generateFallbackMoods();
    }
    
    if (!moods || moods.length === 0) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to analyze movie preferences'
      });
    }
    
    // Update user's mood data in the database
    await User.findByIdAndUpdate(userId, { moods });
    
    return res.status(200).json({
      status: 'success',
      moods
    });
  } catch (error) {
    console.error('Error analyzing user mood:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to analyze user mood'
    });
  }
});

// Helper function to analyze moods with Gemini AI
async function analyzeMovieMoodsWithGemini(movies) {
  try {
    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
    
    // Create a prompt for Gemini API
    const prompt = `
      I have a list of movies that a user likes. Please analyze these movies and rate the user's taste profile 
      based on these predefined mood categories: ${moodCategories.join(', ')}.
      
      For each category, provide a percentage score (0-100) indicating how strongly this mood appears in their taste.
      The total of all percentages should be 100%.
      
      Here are the movies the user likes:
      ${movies.map(m => `- ${m.title}`).join('\n')}
      
      Respond ONLY with a JSON array in this exact format:
      [{"name":"CategoryName","score":PercentageNumber},{"name":"OtherCategory","score":OtherPercentage},...]
      
      The response should be sorted by score in descending order and only include the top 5 categories.
    `;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[\s*\{.*?\}\s*\]/s);
    if (!jsonMatch) {
      console.error('Failed to extract JSON from Gemini response');
      return generateFallbackMoods();
    }
    
    try {
      const moods = JSON.parse(jsonMatch[0]);
      
      // Validate and format the response
      return moods
        .filter(mood => moodCategories.includes(mood.name))
        .map(mood => ({
          name: mood.name,
          score: Math.round(mood.score) // Round to nearest integer
        }))
        .slice(0, 5); // Return top 5 moods
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return generateFallbackMoods();
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return generateFallbackMoods();
  }
}

// Generate fallback moods if AI analysis fails
function generateFallbackMoods() {
  // Simple fallback algorithm based on random selection
  const selectedMoods = [];
  const moodsCopy = [...moodCategories];
  
  // Shuffle array
  for (let i = moodsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [moodsCopy[i], moodsCopy[j]] = [moodsCopy[j], moodsCopy[i]];
  }
  
  // Take first 5 items
  const selectedCategories = moodsCopy.slice(0, 5);
  
  // Distribute 100% among categories
  let remainingPercentage = 100;
  for (let i = 0; i < selectedCategories.length; i++) {
    const isLast = i === selectedCategories.length - 1;
    const score = isLast ? remainingPercentage : Math.floor(Math.random() * (remainingPercentage * 0.6) + 5);
    
    selectedMoods.push({
      name: selectedCategories[i],
      score: score
    });
    
    remainingPercentage -= score;
  }
  
  // Sort by score descending
  console.log(selectedMoods);
  return selectedMoods.sort((a, b) => b.score - a.score);
}

module.exports = router;
