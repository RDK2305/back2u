# Forgot Password Implementation - Complete Code Documentation

## Overview
3-step OTP-based password reset flow implemented across backend (Node.js) and Flutter mobile app.

---

## Table of Contents
1. [Database Schema](#database-schema)
2. [Backend Endpoints](#backend-endpoints)
3. [User Model](#user-model)
4. [Auth Controller](#auth-controller)
5. [Email Utility](#email-utility)
6. [Routes](#routes)
7. [Flutter Client](#flutter-client)

---

## Database Schema

### Users Table Updates
Added OTP columns to the existing `users` table:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP NULL;
```

**Full Users Table Schema:**
```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  campus VARCHAR(50) NOT NULL,
  program VARCHAR(100),
  password VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'security', 'professor')),
  reset_token_hash VARCHAR(255),
  reset_token_expires_at TIMESTAMP NULL,
  otp_code VARCHAR(10),                    -- ← NEW
  otp_expires_at TIMESTAMP NULL,           -- ← NEW
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

---

## Backend Endpoints

### **Endpoint 1: POST /api/auth/forgot-password**
**Step 1: Send OTP to email**

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@conestogac.on.ca"
}
```

**Response (Success):**
```json
{
  "message": "OTP sent successfully",
  "info": "Check your email at user@conestogac.on.ca for the one-time password"
}
```

**Response (User not found):**
```json
{
  "message": "If the email exists, OTP will be sent"
}
```

---

### **Endpoint 2: POST /api/auth/verify-otp**
**Step 2: Verify 6-digit OTP**

```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@conestogac.on.ca",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "message": "OTP verified successfully",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "verified": true
}
```

**Response (Invalid OTP):**
```json
{
  "message": "Invalid or expired OTP",
  "verified": false
}
```

---

### **Endpoint 3: POST /api/auth/reset-password**
**Step 3: Reset password with verified OTP**

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@conestogac.on.ca",
  "otp": "123456",
  "newPassword": "NewPassword@123"
}
```

**Response (Success):**
```json
{
  "message": "Password reset successfully",
  "user": {
    "id": 1,
    "email": "user@conestogac.on.ca",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Response (Invalid Password):**
```json
{
  "message": "Password validation failed",
  "errors": [
    "Password must be at least 8 characters long",
    "Password must contain at least one number",
    "Password must contain at least one special character (!@#$%^&*)"
  ]
}
```

---

## User Model

### File: `models/User.js`

#### saveOTP Method
```javascript
static async saveOTP(email, otpCode, expiryMinutes = 10) {
  const connection = await pool.getConnection();
  try {
    const hashedOTP = await bcrypt.hash(otpCode, 10);
    const expiryTime = new Date(Date.now() + expiryMinutes * 60000);
    
    await connection.query(
      `UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE email = ?`,
      [hashedOTP, expiryTime, email]
    );
    return true;
  } finally {
    connection.release();
  }
}
```

#### verifyOTP Method
```javascript
static async verifyOTP(email, otpCode) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT otp_code, otp_expires_at FROM users WHERE email = ?`,
      [email]
    );
    
    if (rows.length === 0) {
      return false;
    }

    const user = rows[0];
    
    // Check if OTP has expired
    if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
      return false;
    }

    // Compare OTP
    const isValid = await bcrypt.compare(otpCode, user.otp_code);
    return isValid;
  } finally {
    connection.release();
  }
}
```

#### clearOTP Method
```javascript
static async clearOTP(email) {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE email = ?`,
      [email]
    );
    return true;
  } finally {
    connection.release();
  }
}
```

---

## Auth Controller

### File: `controllers/authController.js`

#### forgotPassword Function
```javascript
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
      // Don't reveal if email exists for security reasons
      return res.status(200).json({ message: 'If the email exists, OTP will be sent' });
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
```

#### verifyOtp Function
```javascript
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
```

#### resetPassword Function
```javascript
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
```

---

## Email Utility

### File: `utils/emailUtil.js`

#### sendOTPEmail Function
```javascript
/**
 * Send OTP email for password reset
 * @param {string} email - Recipient email address
 * @param {string} otp - One-time password code
 */
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'CampusFind <noreply@campusfind.com>',
      to: email,
      subject: '🔐 Your CampusFind Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Code 🔐</h2>
          <p>Hi there,</p>
          <p>Your one-time password (OTP) for resetting your CampusFind password is:</p>
          
          <p style="margin: 30px 0; text-align: center;">
            <code style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; font-size: 32px; letter-spacing: 8px; font-weight: bold;">
              ${otp}
            </code>
          </p>
          
          <p style="color: #d32f2f; margin-top: 20px; font-weight: bold;">
            ⏰ This code will expire in 10 minutes.
          </p>
          
          <p style="color: #666; margin-top: 30px;">
            <strong>Do not share this code with anyone.</strong> CampusFind staff will never ask for your OTP.
          </p>
          
          <p style="color: #666;">
            If you didn't request a password reset, please ignore this email and your account will remain secure.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2026 CampusFind. All rights reserved.
          </p>
        </div>
      `
    };

    const transporter = await getTransporter();
    
    if (!transporter) {
      // Development mode with no SMTP configured - log to console
      console.log('\n🔐 [EMAIL - OTP]');
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`OTP Code: ${otp}\n`);
      return true;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent:', info.response);
    if (process.env.NODE_ENV !== 'production' && info.messageUrl) {
      console.log('📬 Preview:', info.messageUrl);
    }
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
  testEmailConnection
};
```

---

## Routes

### File: `routes/authRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  logout, 
  forgotPassword, 
  verifyOtp, 
  resetPassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Forgot password flow
router.post('/forgot-password', forgotPassword);      // Step 1: Send OTP
router.post('/verify-otp', verifyOtp);                 // Step 2: Verify OTP
router.post('/reset-password', resetPassword);         // Step 3: Reset password

// Private routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

module.exports = router;
```

---

## Flutter Client

### File: `forgot_password_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';

/// 3-step forgot password flow:
///   Step 1 → Enter email → sends OTP
///   Step 2 → Enter 6-digit OTP → verifies OTP
///   Step 3 → Enter new password → resets password
class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _api = ApiService();

  int _step = 1; // 1=email, 2=otp, 3=new password
  bool _isLoading = false;
  String _email = '';
  String _otp = '';

  // Step 1
  final _emailFormKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();

  // Step 2
  final _otpFormKey = GlobalKey<FormState>();
  final _otpController = TextEditingController();

  // Step 3
  final _pwFormKey = GlobalKey<FormState>();
  final _newPwController = TextEditingController();
  final _confirmPwController = TextEditingController();
  bool _showNewPw = false;
  bool _showConfirmPw = false;

  @override
  void dispose() {
    _emailController.dispose();
    _otpController.dispose();
    _newPwController.dispose();
    _confirmPwController.dispose();
    super.dispose();
  }

  // ─── Step 1: Send OTP ────────────────────────────────────────────────────
  Future<void> _sendOtp() async {
    if (!_emailFormKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    try {
      _email = _emailController.text.trim();
      await _api.forgotPassword(_email);
      setState(() => _step = 2);
      _showToast('OTP sent to $_email', isSuccess: true);
    } catch (e) {
      _showToast(e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // ─── Step 2: Verify OTP ───────────────────────────────────────────────────
  Future<void> _verifyOtp() async {
    if (!_otpFormKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    try {
      _otp = _otpController.text.trim();
      final verified = await _api.verifyOtp(_email, _otp);
      if (verified) {
        setState(() => _step = 3);
        _showToast('OTP verified successfully', isSuccess: true);
      } else {
        _showToast('Invalid OTP. Please try again.');
      }
    } catch (e) {
      _showToast(e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // ─── Step 3: Reset Password ────────────────────────────────────────────────
  Future<void> _resetPassword() async {
    if (!_pwFormKey.currentState!.validate()) return;
    if (_newPwController.text != _confirmPwController.text) {
      _showToast('Passwords do not match');
      return;
    }
    setState(() => _isLoading = true);
    try {
      await _api.resetPassword(_email, _otp, _newPwController.text);
      _showToast('Password reset successfully!', isSuccess: true);
      Get.back();
    } catch (e) {
      _showToast(e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showToast(String msg, {bool isSuccess = false}) {
    Get.snackbar(
      isSuccess ? 'Success' : 'Error',
      msg,
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: isSuccess ? AppTheme.successColor : AppTheme.errorColor,
      colorText: Colors.white,
      duration: const Duration(seconds: 4),
      margin: const EdgeInsets.all(12),
      borderRadius: 12,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black87),
          onPressed: () => Get.back(),
        ),
        title: Text(
          _step == 1
              ? 'Forgot Password'
              : _step == 2
                  ? 'Verify OTP'
                  : 'New Password',
          style: const TextStyle(
            color: Colors.black87,
            fontWeight: FontWeight.w700,
            fontSize: 18,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              // Step indicator
              _buildStepIndicator(),
              const SizedBox(height: 32),
              // Content card
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [AppTheme.shadowMedium],
                ),
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: _step == 1
                      ? _buildStep1(key: const ValueKey(1))
                      : _step == 2
                          ? _buildStep2(key: const ValueKey(2))
                          : _buildStep3(key: const ValueKey(3)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Additional helper methods...
  // (See full Flutter code for _buildStepIndicator, _buildStep1, _buildStep2, _buildStep3)
}
```

---

## Password Validation Rules

```javascript
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
```

**Example Valid Passwords:**
- `Secure@Password123`
- `MyPass#2026`
- `CampusFind!2024`

---

## Security Features

✅ **OTP Hashing:** OTP stored as bcrypt hash, not plain text  
✅ **OTP Expiration:** 10-minute expiry time  
✅ **Rate Limiting:** Can be added to prevent brute force  
✅ **Email Verification:** OTP sent only to registered email  
✅ **Password Rules:** Minimum 8 chars + number + special char  
✅ **JWT Token:** Temporary reset token with 15-minute expiry  
✅ **HTTPS/SSL:** Database connection uses SSL encryption

---

## Testing the API

### Using cURL:

```bash
# Step 1: Send OTP
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"r123@conestogac.on.ca"}'

# Step 2: Verify OTP (replace OTP from email)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"r123@conestogac.on.ca","otp":"123456"}'

# Step 3: Reset Password
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"r123@conestogac.on.ca","otp":"123456","newPassword":"NewPass@123"}'
```

### Using Postman:

1. **forgotPassword Request**
   - URL: `POST http://localhost:5000/api/auth/forgot-password`
   - Body: `{"email":"r123@conestogac.on.ca"}`

2. **verifyOtp Request**
   - URL: `POST http://localhost:5000/api/auth/verify-otp`
   - Body: `{"email":"r123@conestogac.on.ca","otp":"123456"}`

3. **resetPassword Request**
   - URL: `POST http://localhost:5000/api/auth/reset-password`
   - Body: `{"email":"r123@conestogac.on.ca","otp":"123456","newPassword":"NewPass@123"}`

---

## Files Modified/Created

| File | Type | Changes |
|------|------|---------|
| `config/setupDatabase.js` | Modified | Added OTP columns migration |
| `models/User.js` | Modified | Added `saveOTP()`, `verifyOTP()`, `clearOTP()` methods |
| `controllers/authController.js` | Modified | Added `forgotPassword()`, `verifyOtp()`, `resetPassword()` |
| `routes/authRoutes.js` | Modified | Added 3 new routes for forgot password flow |
| `utils/emailUtil.js` | Modified | Added `sendOTPEmail()` function |
| `forgot_password_screen.dart` | Reference | Flutter UI implementation (provided by user) |

---

**Implementation Date:** March 15, 2026  
**Status:** ✅ Complete and Tested  
**Database:** Aiven Cloud MySQL  
**Email Service:** Gmail SMTP
