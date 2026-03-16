const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateRoleSpecificId, generatePasswordResetToken } = require('../utils/authUtil');
const { sendVerificationEmail: sendVerificationEmailUtil, sendPasswordResetEmail: sendPasswordResetEmailUtil, sendOTPEmail } = require('../utils/emailUtil');

// security registration code (stored securely)
const VALID_security_CODES = {
  'security2026SECURE': { campus: 'Main', role: 'security' },
  'security2026WATER': { campus: 'Waterloo', role: 'security' },
  'security2026CAMB': { campus: 'Cambridge', role: 'security' },
  'security2026DOON': { campus: 'Doon', role: 'security' }
};

// Email verification store (in production, use database)
const verificationTokens = new Map();

// Password reset tokens store (in production, use database)
const passwordResetTokens = new Map();

// Professor registration codes (stored securely)
const VALID_PROFESSOR_CODES = {
  'professor2026MAIN': { campus: 'Main', role: 'professor' },
  'professor2026WATER': { campus: 'Waterloo', role: 'professor' },
  'professor2026CAMB': { campus: 'Cambridge', role: 'professor' },
  'professor2026DOON': { campus: 'Doon', role: 'professor' }
};

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

// Send verification email using Nodemailer
const sendVerificationEmail = async (email, verificationToken, userName) => {
  try {
    const result = await sendVerificationEmailUtil(email, verificationToken);
    return result;
  } catch (error) {
    console.error('Error sending verification email:', error);
    // In development, still allow registration even if email fails
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📧 [DEV MODE] Would send verification link: ${process.env.APP_URL}/verify-email.html?token=${verificationToken}`);
      return true;
    }
    return false;
  }
};

// Send password reset email using Nodemailer
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const result = await sendPasswordResetEmailUtil(email, resetToken);
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    // In development, still allow request even if email fails
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📧 [DEV MODE] Would send reset link: ${process.env.APP_URL}/reset-password.html?token=${resetToken}`);
      return true;
    }
    return false;
  }
};

// @desc    Register security with Code
// @route   POST /api/auth/register-security
// @access  Public
const registersecurity = async (req, res) => {
  try {
    const { email, first_name, last_name, program, password, securityCode } = req.body;

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

    // Get security campus from code
    const securityInfo = VALID_security_CODES[securityCode];

    // Generate role-specific ID for security
    const security_id = generateRoleSpecificId('security');

    // Create security user
    const user = await User.create({
      student_id: security_id,
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
      console.log(`🔒 Security account created: ${user.email} (${user.student_id}) - Campus: ${securityInfo.campus}`);

      res.status(201).json({
        message: 'Security account registered successfully. Your Security ID is: ' + user.student_id,
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
    console.error('Security registration error:', error);
    res.status(500).json({ message: 'Server error during security registration' });
  }
};

// @desc    Register Student
// @route   POST /api/auth/register
// @access  Public
const registerStudent = async (req, res) => {
  try {
    const { email, first_name, last_name, campus, program, password } = req.body;

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

    // Generate role-specific ID for student
    const student_id = generateRoleSpecificId('student');

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
      await sendVerificationEmail(email, verificationToken, `${first_name} ${last_name}`);

      res.status(201).json({
        message: 'Student account created successfully. Your Student ID is: ' + student_id + '. Please check your email to verify your account.',
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

// @desc    Register Professor
// @route   POST /api/auth/register-professor
// @access  Public
const registerProfessor = async (req, res) => {
  try {
    const { email, first_name, last_name, campus, program, password, professorCode } = req.body;

    // Validate professor code
    if (!professorCode || !VALID_PROFESSOR_CODES[professorCode]) {
      return res.status(403).json({ 
        message: 'Invalid professor registration code. Please contact administration.' 
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

    // Get professor campus from code
    const professorInfo = VALID_PROFESSOR_CODES[professorCode];

    // Generate role-specific ID for professor
    const professor_id = generateRoleSpecificId('professor');

    // Create professor user (auto-verified)
    const user = await User.create({
      student_id: professor_id,
      email,
      first_name,
      last_name,
      campus: professorInfo.campus,
      program: program || 'Faculty',
      password,
      role: 'professor',
      is_verified: true // professor accounts auto-verified
    });

    if (user) {
      console.log(`👨‍🏫 Professor account created: ${user.email} (${user.student_id}) - Campus: ${professorInfo.campus}`);

      res.status(201).json({
        message: 'Professor account registered successfully',
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
      res.status(400).json({ message: 'Failed to create professor account' });
    }
  } catch (error) {
    console.error('Professor registration error:', error);
    res.status(500).json({ message: 'Server error during professor registration' });
  }
};

// @desc    Forgot Password - Send Reset Email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log(`📧 [FORGOT PASSWORD] Request for email: ${email}`);

    // Check if user exists
    const user = await User.findByEmail(email.trim());
    if (!user) {
      console.log(`⚠️ [FORGOT PASSWORD] User not found: ${email}`);
      // Return 404 with registration warning
      return res.status(404).json({ 
        notRegistered: true,
        message: '❌ This email is not registered. Please register first before resetting your password.',
        registerLink: '/register.html'
      });
    }

    console.log(`✅ [FORGOT PASSWORD] User found: ${user.email}`);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔐 [FORGOT PASSWORD] Generated OTP: ${otp}`);

    // Save OTP to database (will be hashed)
    console.log(`💾 [FORGOT PASSWORD] Saving OTP to database...`);
    await User.saveOTP(email.trim(), otp, 10); // 10 minutes expiry
    console.log(`✅ [FORGOT PASSWORD] OTP saved successfully`);

    // Send OTP via email
    console.log(`📬 [FORGOT PASSWORD] Sending OTP email...`);
    const emailSent = await sendOTPEmail(email.trim(), otp);

    if (emailSent) {
      console.log(`✅ [FORGOT PASSWORD] Email sent successfully`);
      res.status(200).json({ 
        message: 'OTP sent successfully',
        info: `Check your email at ${email} for the one-time password` 
      });
    } else {
      console.error(`❌ [FORGOT PASSWORD] Email failed to send`);
      res.status(500).json({ message: 'Failed to send email. Try again later.' });
    }
  } catch (error) {
    console.error(`❌ [FORGOT PASSWORD] Error:`, error);
    res.status(500).json({ message: 'Server error during forgot password request' });
  }
};

// @desc    Reset Password - Verify Token and Set New Password
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

    // Verify OTP
    const isValidOTP = await User.verifyOTP(email.trim(), otp.trim());
    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await User.update(user.id, { password: hashedPassword });

    // Clear OTP from database
    await User.clearOTP(email.trim());

    console.log(`🔐 Password reset successfully for user: ${user.email}`);

    res.json({
      message: 'Password has been reset successfully. You can now login with your new password.',
      email: user.email
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

// @desc    Verify Reset Token
// @route   POST /api/auth/verify-reset-token
// @access  Public
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Hash the token to match what's stored
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Check if token exists and is valid
    const tokenData = passwordResetTokens.get(hashedToken);
    if (!tokenData) {
      return res.status(400).json({ valid: false, message: 'Invalid reset token' });
    }

    if (tokenData.expiresAt < Date.now()) {
      passwordResetTokens.delete(hashedToken);
      return res.status(400).json({ valid: false, message: 'Reset token has expired' });
    }

    res.json({
      valid: true,
      email: tokenData.email,
      message: 'Reset token is valid'
    });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ message: 'Server error during token verification' });
  }
};

// @desc    Step 2: Verify OTP for password reset
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log(`🔐 [VERIFY OTP] Request for email: ${email}`);

    // Validate input
    if (!email || !otp) {
      console.log(`⚠️ [VERIFY OTP] Missing email or OTP`);
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Check if user exists
    const user = await User.findByEmail(email.trim());
    if (!user) {
      console.log(`⚠️ [VERIFY OTP] User not found: ${email}`);
      return res.status(400).json({ message: 'User not found' });
    }

    console.log(`✅ [VERIFY OTP] User found, verifying OTP...`);

    // Verify OTP
    const isValidOTP = await User.verifyOTP(email.trim(), otp.trim());

    if (isValidOTP) {
      console.log(`✅ [VERIFY OTP] OTP is valid for: ${email}`);
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
      console.log(`❌ [VERIFY OTP] OTP verification failed for: ${email}`);
      res.status(400).json({ 
        message: 'Invalid or expired OTP',
        verified: false 
      });
    }
  } catch (error) {
    console.error(`❌ [VERIFY OTP] Error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
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
  verifyOtp,
  validatePassword,
  validateEmailDomain,
  generateToken
};
