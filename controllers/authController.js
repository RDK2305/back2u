const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOTPEmail } = require('../utils/emailUtil');

// Password validation helper
const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  return errors;
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { student_id, email, first_name, last_name, campus, program, password, role } = req.body;

    // Validate password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Password validation failed',
        errors: passwordErrors 
      });
    }

    // Check if user exists
    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create user
    const user = await User.create({
      student_id,
      email,
      first_name,
      last_name,
      campus,
      program,
      password,
      role: role || 'student'
    });

    if (user) {
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          student_id: user.student_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          campus: user.campus,
          program: user.program,
          is_verified: user.is_verified,
          role: user.role
        },
        token: generateToken(user.id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user email
    const user = await User.findByEmail(email);
    
    if (user && (await User.comparePassword(password, user.password))) {
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          student_id: user.student_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          campus: user.campus,
          program: user.program,
          is_verified: user.is_verified,
          role: user.role
        },
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Incorrect email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, campus, program, password, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If changing password, verify old password
    if (password && newPassword) {
      const passwordMatch = await User.comparePassword(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Validate new password
      const passwordErrors = validatePassword(newPassword);
      if (passwordErrors.length > 0) {
        return res.status(400).json({ 
          message: 'Password validation failed',
          errors: passwordErrors 
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const updatedUser = await User.update(req.user.id, {
        first_name: first_name || user.first_name,
        last_name: last_name || user.last_name,
        campus: campus || user.campus,
        program: program || user.program,
        password: hashedPassword
      });

      return res.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          student_id: updatedUser.student_id,
          email: updatedUser.email,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          campus: updatedUser.campus,
          program: updatedUser.program,
          is_verified: updatedUser.is_verified,
          role: updatedUser.role
        }
      });
    }

    // Update only basic info
    const updatedUser = await User.update(req.user.id, {
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      campus: campus || user.campus,
      program: program || user.program
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        student_id: updatedUser.student_id,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        campus: updatedUser.campus,
        program: updatedUser.program,
        is_verified: updatedUser.is_verified,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // For JWT, logout is handled on client-side by deleting token
    // Server-side logout can be implemented with token blacklist in future
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Step 1: Send OTP for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findByEmail(email.trim());
    if (!user) {
      return res.status(404).json({
        message: 'Email not registered. Please register first.',
        notRegistered: true
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to database (will be hashed)
    await User.saveOTP(email.trim(), otp, 10); // 10 minutes expiry

    // Send OTP via email
    const emailSent = await sendOTPEmail(email.trim(), otp);

    if (emailSent) {
      res.status(200).json({ 
        message: 'OTP sent successfully',
        info: `Check your email at ${email} for the one-time password` 
      });
    } else {
      res.status(500).json({ message: 'Failed to send email. Try again later.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Step 2: Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Check if user exists
    const user = await User.findByEmail(email.trim());
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Verify OTP
    const isValidOTP = await User.verifyOTP(email.trim(), otp.trim());

    if (isValidOTP) {
      // OTP is valid, generate a temporary token for password reset
      const resetToken = jwt.sign(
        { id: user.id, email: user.email, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // 15 minutes to complete password reset
      );

      res.status(200).json({
        message: 'OTP verified successfully',
        resetToken: resetToken,
        verified: true
      });
    } else {
      res.status(400).json({ 
        message: 'Invalid or expired OTP',
        verified: false 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Step 3: Reset password with OTP verification
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validate input
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    // Validate new password
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: 'Password validation failed',
        errors: passwordErrors
      });
    }

    // Check if user exists
    const user = await User.findByEmail(email.trim());
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Verify OTP one more time
    const isValidOTP = await User.verifyOTP(email.trim(), otp.trim());
    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear OTP
    const updatedUser = await User.update(user.id, {
      password: hashedPassword
    });

    // Clear OTP from database
    await User.clearOTP(email.trim());

    res.status(200).json({
      message: 'Password reset successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe, updateProfile, logout, forgotPassword, verifyOtp, resetPassword };