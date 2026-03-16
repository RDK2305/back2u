const express = require('express');
const {
  registersecurity,
  registerStudent,
  registerProfessor,
  verifyEmail,
  login,
  getMe,
  updateProfile,
  logout,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  verifyOtp
} = require('../controllers/authControllerSecure');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register-security', registersecurity);
router.post('/register-professor', registerProfessor);
router.post('/register', registerStudent);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/verify-reset-token', verifyResetToken);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

module.exports = router;
