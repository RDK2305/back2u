const express = require('express');
const {
  registersecurity,
  registerStudent,
  verifyEmail,
  login,
  getMe,
  updateProfile,
  logout
} = require('../controllers/authControllerSecure');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register-security', registersecurity);
router.post('/register', registerStudent);
router.post('/verify-email', verifyEmail);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

module.exports = router;
