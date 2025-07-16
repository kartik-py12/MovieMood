import express from 'express';
import User from '../models/User.js';
import { isAuthenticated } from '../middleware/auth.js';

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

export default router;
