const express = require('express');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

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

module.exports = router;
