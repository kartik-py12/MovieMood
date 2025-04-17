const User = require('../models/User');

// Like a movie
exports.likeMovie = async (req, res, next) => {
  try {
    const { movieId, title, poster_path, media_type } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide movie ID and title'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Check if movie is already liked
    const alreadyLiked = user.likedMovies.some(movie => movie.movieId === movieId);
    
    if (alreadyLiked) {
      // Remove from liked movies
      user.likedMovies = user.likedMovies.filter(movie => movie.movieId !== movieId);
      await user.save();
      
      return res.status(200).json({
        status: 'success',
        message: 'Movie removed from liked list',
        liked: false
      });
    }
    
    // Add to liked movies
    user.likedMovies.push({
      movieId,
      title,
      poster_path,
      media_type: media_type || 'movie',
      addedAt: Date.now()
    });
    
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Movie added to liked list',
      liked: true
    });
  } catch (error) {
    next(error);
  }
};

// Add/remove movie to/from watchlist
exports.toggleWatchlist = async (req, res, next) => {
  try {
    const { movieId, title, poster_path, media_type } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide movie ID and title'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Check if movie is already in watchlist
    const alreadyInWatchlist = user.watchlist.some(movie => movie.movieId === movieId);
    
    if (alreadyInWatchlist) {
      // Remove from watchlist
      user.watchlist = user.watchlist.filter(movie => movie.movieId !== movieId);
      await user.save();
      
      return res.status(200).json({
        status: 'success',
        message: 'Movie removed from watchlist',
        inWatchlist: false
      });
    }
    
    // Add to watchlist
    user.watchlist.push({
      movieId,
      title,
      poster_path,
      media_type: media_type || 'movie',
      addedAt: Date.now()
    });
    
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Movie added to watchlist',
      inWatchlist: true
    });
  } catch (error) {
    next(error);
  }
};

// Mark movie as watched
exports.toggleWatched = async (req, res, next) => {
  try {
    const { movieId, title, poster_path, media_type, rating } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide movie ID and title'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Check if movie is already in watched list
    const alreadyWatched = user.watched.some(movie => movie.movieId === movieId);
    
    if (alreadyWatched) {
      // If updating rating
      if (rating !== undefined) {
        const movieIndex = user.watched.findIndex(movie => movie.movieId === movieId);
        user.watched[movieIndex].rating = rating;
        await user.save();
        
        return res.status(200).json({
          status: 'success',
          message: 'Movie rating updated',
          watched: true,
          rating
        });
      }
      
      // Remove from watched
      user.watched = user.watched.filter(movie => movie.movieId !== movieId);
      await user.save();
      
      return res.status(200).json({
        status: 'success',
        message: 'Movie removed from watched list',
        watched: false
      });
    }
    
    // Add to watched
    user.watched.push({
      movieId,
      title,
      poster_path,
      media_type: media_type || 'movie',
      addedAt: Date.now(),
      rating: rating || 0
    });
    
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Movie added to watched list',
      watched: true
    });
  } catch (error) {
    next(error);
  }
};

// Get movie status (liked, watchlist, watched) for a user
exports.getMovieStatus = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user.id);
    
    const isLiked = user.likedMovies.some(movie => movie.movieId === movieId);
    const isInWatchlist = user.watchlist.some(movie => movie.movieId === movieId);
    const watchedMovie = user.watched.find(movie => movie.movieId === movieId);
    const isWatched = !!watchedMovie;
    
    res.status(200).json({
      status: 'success',
      data: {
        isLiked,
        isInWatchlist,
        isWatched,
        rating: watchedMovie ? watchedMovie.rating : 0
      }
    });
  } catch (error) {
    next(error);
  }
};
