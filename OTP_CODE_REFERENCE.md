# OTP (One-Time Password) Implementation - Complete Code Reference

## Table of Contents
1. [Database Schema](#database-schema)
2. [User Model](#user-model)
3. [Auth Controller](#auth-controller)
4. [Routes](#routes)
5. [Email Utility](#email-utility)
6. [Frontend HTML](#frontend-html)
7. [API Usage Examples](#api-usage-examples)

---

## Database Schema

### Users Table DDL
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
  otp_code VARCHAR(255),
  otp_expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Column Migration Script
```javascript
// config/setupDatabase.js - OTP Column Addition
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP NULL;
```

---

## User Model

### File: `models/User.js`

#### saveOTP Method
```javascript
/**
 * Save OTP code for user (hashed with bcrypt)
 * @param {string} email - User email
 * @param {string} otpCode - 6-digit OTP code
 * @param {number} expiryMinutes - Minutes until OTP expires (default: 10)
 * @returns {Promise<boolean>}
 */
static async saveOTP(email, otpCode, expiryMinutes = 10) {
  const connection = await pool.getConnection();
  try {
    // Hash OTP before storing
    const hashedOTP = await bcrypt.hash(otpCode, 10);
    const expiryTime = new Date(Date.now() + expiryMinutes * 60000);
    
    await connection.query(
      `UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE email = ?`,
      [hashedOTP, expiryTime, email]
    );
    return true;
  } catch (error) {
    console.error('Error saving OTP:', error);
    return false;
  } finally {
    connection.release();
  }
}
```

#### verifyOTP Method
```javascript
/**
 * Verify OTP code against stored hash
 * @param {string} email - User email
 * @param {string} otpCode - 6-digit OTP to verify
 * @returns {Promise<boolean>}
 */
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

    // Compare OTP with hash
    const isValid = await bcrypt.compare(otpCode, user.otp_code);
    return isValid;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  } finally {
    connection.release();
  }
}
```

#### clearOTP Method
```javascript
/**
 * Clear OTP after successful verification
 * @param {string} email - User email
 * @returns {Promise<boolean>}
 */
static async clearOTP(email) {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE email = ?`,
      [email]
    );
    return true;
  } catch (error) {
    console.error('Error clearing OTP:', error);
    return false;
  } finally {
    connection.release();
  }
}
```

---

## Auth Controller

### File: `controllers/authControllerSecure.js`

#### Step 1: forgotPassword Function
```javascript
/**
 * Step 1: Send OTP to user email
 * @route POST /api/auth/forgot-password
 * @param {string} email - User email address
 * @returns {object} Success message
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findByEmail(email.trim());
    if (!user) {
      // Don't reveal if email exists (security best practice)
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

#### Step 2: verifyOtp Function
```javascript
/**
 * Step 2: Verify OTP code
 * @route POST /api/auth/verify-otp
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP code
 * @returns {object} Reset token (JWT) if verified
 */
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

#### Step 3: resetPassword Function
```javascript
/**
 * Step 3: Reset password with OTP verification
 * @route POST /api/auth/reset-password
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP code
 * @param {string} newPassword - New password (must be hashed before storage)
 * @returns {object} Success message with user info
 */
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
```

#### Password Validation Helper
```javascript
/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one number
 * - At least one special character (!@#$%^&*)
 */
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

---

## Routes

### File: `routes/authRoutesSecure.js`

```javascript
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
  verifyOtp,
  resetPassword,
  verifyResetToken
} = require('../controllers/authControllerSecure');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register-security', registersecurity);
router.post('/register-professor', registerProfessor);
router.post('/register', registerStudent);
router.post('/verify-email', verifyEmail);

// ===== OTP-based Forgot Password Flow =====
router.post('/forgot-password', forgotPassword);      // Step 1: Send OTP
router.post('/verify-otp', verifyOtp);                 // Step 2: Verify OTP
router.post('/reset-password', resetPassword);         // Step 3: Reset password

// Other routes
router.post('/verify-reset-token', verifyResetToken);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

module.exports = router;
```

---

## Email Utility

### File: `utils/emailUtil.js`

#### sendOTPEmail Function
```javascript
/**
 * Send OTP email for password reset
 * @param {string} email - Recipient email address
 * @param {string} otp - One-time password code (6 digits)
 * @returns {Promise<boolean>}
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
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n🔐 [DEV MODE - OTP CODE] ${otp}`);
      if (info.messageUrl) {
        console.log('📬 Preview:', info.messageUrl);
      }
    }
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    return false;
  }
};
```

#### Email Transporter Configuration
```javascript
/**
 * Initialize email transporter
 * Development: Uses Ethereal test email service
 * Production: Uses Gmail SMTP
 */
async function getTransporter() {
  if (transporter) return transporter;
  
  if (process.env.NODE_ENV !== 'production') {
    // Development mode
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        },
        logger: false,
        debug: false
      });
      console.log('📧 Development mode: Using Ethereal test email service');
      return transporter;
    } catch (err) {
      console.log('⚠️  Development mode: Email sending disabled (console logging only)\nReason:', err.message);
      return null;
    }
  }
  
  // Production mode - use Gmail SMTP
  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      logger: false,
      debug: false
    });
    return transporter;
  } catch (err) {
    console.error('❌ Failed to initialize production email transporter:', err.message);
    return null;
  }
}
```

---

## Frontend HTML

### File: `public/forgot-password.html` - JavaScript Functions

#### Step 1: Send OTP
```javascript
async function sendOTP(e) {
  e.preventDefault();
  hideMessages();
  userEmail = document.getElementById('emailInput').value.trim();

  if (!userEmail) {
    showError('❌ Please enter an email');
    return;
  }

  try {
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Sending...';

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail })
    });

    const data = await res.json();
    btn.disabled = false;
    btn.textContent = '📧 Send OTP';

    if (res.ok) {
      showSuccess('✅ OTP sent to ' + userEmail);
      document.getElementById('emailDisplay').textContent = userEmail;
      setTimeout(() => showStep(2), 1500);
    } else {
      showError('❌ ' + (data.message || 'Failed to send OTP'));
    }
  } catch (err) {
    showError('❌ Network error: ' + err.message);
    e.target.querySelector('button').disabled = false;
  }
}
```

#### Step 2: Verify OTP
```javascript
async function verifyOTP(e) {
  e.preventDefault();
  hideMessages();
  userOtp = document.getElementById('otpInput').value.trim();

  if (userOtp.length !== 6) {
    showError('❌ Please enter 6 digits');
    return;
  }

  try {
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Verifying...';

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, otp: userOtp })
    });

    const data = await res.json();
    btn.disabled = false;
    btn.textContent = '✅ Verify OTP';

    if (res.ok && data.verified) {
      showSuccess('✅ OTP verified!');
      setTimeout(() => showStep(3), 1500);
    } else {
      showError('❌ ' + (data.message || 'Invalid OTP'));
    }
  } catch (err) {
    showError('❌ Network error: ' + err.message);
    e.target.querySelector('button').disabled = false;
  }
}
```

#### Step 3: Reset Password
```javascript
async function resetPassword(e) {
  e.preventDefault();
  hideMessages();
  const pwd = document.getElementById('passwordInput').value.trim();
  const confirm = document.getElementById('confirmInput').value.trim();

  if (pwd !== confirm) {
    showError('❌ Passwords do not match');
    return;
  }

  if (pwd.length < 8 || !/\d/.test(pwd) || !/[!@#$%^&*]/.test(pwd)) {
    showError('❌ Password must have 8+ chars, number, and special char');
    return;
  }

  try {
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Resetting...';

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, otp: userOtp, newPassword: pwd })
    });

    const data = await res.json();
    btn.disabled = false;
    btn.textContent = '🔒 Reset Password';

    if (res.ok) {
      showSuccess('✅ Password reset successfully!');
      setTimeout(() => showStep('Success'), 1500);
    } else {
      showError('❌ ' + (data.message || 'Failed to reset'));
    }
  } catch (err) {
    showError('❌ Network error: ' + err.message);
    e.target.querySelector('button').disabled = false;
  }
}
```

---

## API Usage Examples

### cURL Examples

#### Step 1: Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@conestogac.on.ca"
  }'

# Response:
# {
#   "message": "OTP sent successfully",
#   "info": "Check your email at user@conestogac.on.ca for the one-time password"
# }
```

#### Step 2: Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@conestogac.on.ca",
    "otp": "123456"
  }'

# Response:
# {
#   "message": "OTP verified successfully",
#   "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "verified": true
# }
```

#### Step 3: Reset Password
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@conestogac.on.ca",
    "otp": "123456",
    "newPassword": "NewPassword@123"
  }'

# Response:
# {
#   "message": "Password has been reset successfully. You can now login with your new password.",
#   "email": "user@conestogac.on.ca"
# }
```

### JavaScript Fetch Examples

#### Complete Flow
```javascript
// Get email from user
const email = 'user@conestogac.on.ca';

// Step 1: Request OTP
const step1 = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email })
});

// Get OTP from email (development: check server logs)
const otp = '123456';

// Step 2: Verify OTP
const step2 = await fetch('/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, otp })
});
const data = await step2.json();
const resetToken = data.resetToken;

// Step 3: Reset Password
const step3 = await fetch('/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email, 
    otp, 
    newPassword: 'NewPassword@123' 
  })
});

const result = await step3.json();
console.log(result.message); // "Password has been reset successfully..."
```

---

## Environment Configuration (.env)

```env
# OTP Email Configuration
NODE_ENV=development

# Development: Uses Ethereal test email
# Production: Uses Gmail SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=CampusFind <noreply@campusfind.com>

# JWT Secret
JWT_SECRET=your_secret_key

# Database
DB_HOST=your-host
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=your-db
DB_PORT=3306
DB_SSL=true
```

---

## Security Features

✅ **OTP Hashing**: OTP stored as bcrypt hash, not plain text  
✅ **OTP Expiration**: 10-minute expiry time  
✅ **Rate Limiting**: Can be added to prevent brute force  
✅ **Email Verification**: OTP sent only to registered email  
✅ **Password Validation**: Minimum 8 chars + number + special char  
✅ **JWT Token**: Temporary reset token with 15-minute expiry  
✅ **HTTPS/SSL**: Database connection uses SSL encryption  

---

## Error Handling

### Common Error Responses

```javascript
// Email not found (but message doesn't reveal this for security)
{ "message": "If the email exists, OTP will be sent" } // 200

// Invalid OTP
{ "message": "Invalid or expired OTP", "verified": false } // 400

// Invalid password format
{
  "message": "Password validation failed",
  "errors": [
    "Password must be at least 8 characters long",
    "Password must contain at least one number",
    "Password must contain at least one special character (!@#$%^&*)"
  ]
} // 400

// Network/Server error
{ "message": "Server error" } // 500
```

---

## Development Mode

In development, OTP codes are logged to console:

```
🔐 [DEV MODE - OTP CODE] 997907
📬 Preview: https://ethereal.email/messages/...
```

---

**Last Updated**: March 15, 2026  
**Status**: ✅ Complete and Tested
