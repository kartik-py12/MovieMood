const express = require('express');
const { 
  likeMovie, 
  toggleWatchlist, 
  toggleWatched, 
  getMovieStatus 
} = require('../controllers/movieController');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(isAuthenticated);

router.post('/like', likeMovie);
router.post('/watchlist', toggleWatchlist);
router.post('/watched', toggleWatched);
router.get('/status/:movieId', getMovieStatus);

module.exports = router;
