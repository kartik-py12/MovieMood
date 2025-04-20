require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const movieRoutes = require('./routes/movieRoutes');
// Import mood routes - use the correct path based on your project structure
const moodRoutes = require('./routes/moodRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // React app URL
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Database connection
mongoose.connect('proccess.env.mongouri') // your mongo uri
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
// Mount mood routes at the /api/users path since that's what your frontend expects
app.use('/api/users', moodRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Something went wrong on the server'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
