const express = require('express');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

// Predefined mood categories
const moodCategories = [
  'Action-oriented', 'Romantic', 'Adventurous', 
  'Dramatic', 'Comedic', 'Thrilling',
  'Intellectual', 'Inspirational', 'Dark', 'Nostalgic'
];

// Get user's mood analysis
router.get('/moods', async (req, res) => {
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
router.post('/mood-analysis', isAuthenticated, async (req, res) => {
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
    
    // Use fallback until Gemini API is set up
    const moods = generateFallbackMoods();
    
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

// Generate fallback moods if Gemini API fails
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
  return selectedMoods.sort((a, b) => b.score - a.score);
}

module.exports = router;
