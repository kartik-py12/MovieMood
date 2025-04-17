const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please enter your username'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password should be at least 6 characters'],
    select: false
  },
  profilePic: {
    type: String,
    default: 'default-profile.jpg'
  },
  likedMovies: [
    {
      movieId: String,
      title: String,
      poster_path: String,
      media_type: { type: String, default: 'movie' },
      addedAt: { type: Date, default: Date.now }
    }
  ],
  watchlist: [
    {
      movieId: String,
      title: String,
      poster_path: String,
      media_type: { type: String, default: 'movie' },
      addedAt: { type: Date, default: Date.now }
    }
  ],
  watched: [
    {
      movieId: String,
      title: String,
      poster_path: String,
      media_type: { type: String, default: 'movie' },
      addedAt: { type: Date, default: Date.now },
      rating: { type: Number, min: 0, max: 10, default: 0 }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check if entered password matches with stored hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
}

// Generate JWT token
userSchema.methods.getJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
}

module.exports = mongoose.model('User', userSchema);
