const express = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', isAuthenticated, getMe);

module.exports = router;
