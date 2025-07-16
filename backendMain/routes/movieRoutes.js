import express from 'express';
import { 
  likeMovie, 
  toggleWatchlist, 
  toggleWatched, 
  getMovieStatus 
} from '../controllers/movieController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(isAuthenticated);

router.post('/like', likeMovie);
router.post('/watchlist', toggleWatchlist);
router.post('/watched', toggleWatched);
router.get('/status/:movieId', getMovieStatus);

export default router;
