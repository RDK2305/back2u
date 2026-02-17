const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// security registration code (stored securely)
const VALID_security_CODES = {
  'security2024SECURE': { campus: 'Main', role: 'security' },
  'security2024WATER': { campus: 'Waterloo', role: 'security' },
  'security2024CAMB': { campus: 'Cambridge', role: 'security' },
  'security2024DOON': { campus: 'Doon', role: 'security' }
};

// Email verification store (in production, use database)
const verificationTokens = new Map();

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
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  return errors;
};

// Email domain validation
const validateEmailDomain = (email) => {
  const validDomains = ['conestogac.on.ca', 'conestoga.ca'];
  const domain = email.split('@')[1];
  return validDomains.includes(domain);
};

// Generate JWT Token
const generateToken = (id, expiresIn = '7d') => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn
  });
};

// Generate email verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email simulator (replace with actual email service)
const sendVerificationEmail = (email, verificationToken, userName) => {
  const verificationLink = `${process.env.FRONTEND_URL || 'https://back2u-h67h.onrender.com/'}/verify-email.html?token=${verificationToken}`;
  
  console.log(`📧 Verification email sent to ${email}`);
  console.log(`Verification link: ${verificationLink}`);
  console.log(`Token: ${verificationToken}`);
  
  // In production, integrate with email service like:
  // - SendGrid
  // - Nodemailer
  // - AWS SES
  // - Mailgun
  
  return true;
};

// @desc    Register security with Code
// @route   POST /api/auth/register-security
// @access  Public
const registersecurity = async (req, res) => {
  try {
    const { student_id, email, first_name, last_name, program, password, securityCode } = req.body;

    // Validate security code
    if (!securityCode || !VALID_security_CODES[securityCode]) {
      return res.status(403).json({ 
        message: 'Invalid security registration code. Please contact administration.' 
      });
    }

    // Validate email domain
    if (!validateEmailDomain(email)) {
      return res.status(400).json({ 
        message: 'Only @conestogac.on.ca or @conestoga.ca emails are allowed' 
      });
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Password does not meet security requirements',
        errors: passwordErrors 
      });
    }

    // Check if user exists
    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if student_id already used
    const studentIdExists = await User.findByStudentId(student_id);
    if (studentIdExists) {
      return res.status(400).json({ message: 'Student/security ID already in use' });
    }

    // Get security campus from code
    const securityInfo = VALID_security_CODES[securityCode];

    // Create security user
    const user = await User.create({
      student_id,
      email,
      first_name,
      last_name,
      campus: securityInfo.campus,
      program: program || 'security',
      password,
      role: 'security',
      is_verified: true // security accounts auto-verified
    });

    if (user) {
      // Log security registration for audit
      console.log(`🔒 security account created: ${user.email} (${user.id}) - Campus: ${securityInfo.campus}`);

      res.status(201).json({
        message: 'security account registered successfully',
        user: {
          id: user.id,
          student_id: user.student_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          campus: user.campus,
          role: user.role,
          is_verified: user.is_verified
        },
        token: generateToken(user.id)
      });
    } else {
      res.status(400).json({ message: 'Failed to create security account' });
    }
  } catch (error) {
    console.error('security registration error:', error);
    res.status(500).json({ message: 'Server error during security registration' });
  }
};

// @desc    Register Student
// @route   POST /api/auth/register
// @access  Public
const registerStudent = async (req, res) => {
  try {
    const { student_id, email, first_name, last_name, campus, program, password } = req.body;

    // Validate email domain
    if (!validateEmailDomain(email)) {
      return res.status(400).json({ 
        message: 'Only @conestogac.on.ca or @conestoga.ca emails are allowed' 
      });
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Password does not meet security requirements',
        errors: passwordErrors 
      });
    }

    // Check if user exists
    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if student_id already used
    const studentIdExists = await User.findByStudentId(student_id);
    if (studentIdExists) {
      return res.status(400).json({ message: 'Student ID already in use' });
    }

    // Create student user (not verified initially)
    const user = await User.create({
      student_id,
      email,
      first_name,
      last_name,
      campus,
      program,
      password,
      role: 'student',
      is_verified: false
    });

    if (user) {
      // Generate verification token
      const verificationToken = generateVerificationToken();
      verificationTokens.set(verificationToken, {
        userId: user.id,
        email: user.email,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      });

      // Send verification email
      sendVerificationEmail(email, verificationToken, `${first_name} ${last_name}`);

      res.status(201).json({
        message: 'Student account created. Please check your email to verify your account.',
        user: {
          id: user.id,
          student_id: user.student_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          campus: user.campus,
          role: user.role,
          is_verified: user.is_verified
        },
        requiresVerification: true
      });
    } else {
      res.status(400).json({ message: 'Failed to create student account' });
    }
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ message: 'Server error during student registration' });
  }
};

// @desc    Verify Email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Check if token exists and is valid
    const tokenData = verificationTokens.get(token);
    if (!tokenData) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    if (tokenData.expiresAt < Date.now()) {
      verificationTokens.delete(token);
      return res.status(400).json({ message: 'Verification token has expired' });
    }

    // Update user verification status
    const user = await User.findById(tokenData.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.update(tokenData.userId, { is_verified: true });

    // Clean up token
    verificationTokens.delete(token);

    console.log(`✅ Email verified for user: ${user.email}`);

    res.json({
      message: 'Email verified successfully. You can now login.',
      verified: true
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

// @desc    Login user (security or Student)
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
    
    if (!user) {
      // Log failed attempt
      console.log(`🚫 Failed login attempt for non-existent email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is verified
    if (!user.is_verified) {
      return res.status(403).json({ 
        message: 'Please verify your email first before logging in',
        requiresVerification: true 
      });
    }

    // Check password
    const passwordMatch = await User.comparePassword(password, user.password);
    if (!passwordMatch) {
      console.log(`🚫 Failed login attempt for user: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`✅ ${user.role.toUpperCase()} login successful: ${email}`);

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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      student_id: user.student_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      campus: user.campus,
      program: user.program,
      is_verified: user.is_verified,
      role: user.role,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Get user error:', error);
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

      console.log(`🔄 Password updated for user: ${user.email}`);

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
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    console.log(`👋 User logged out: ${req.user.id}`);
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  registersecurity, 
  registerStudent, 
  verifyEmail,
  login, 
  getMe, 
  updateProfile, 
  logout,
  validatePassword,
  validateEmailDomain,
  generateToken
};
