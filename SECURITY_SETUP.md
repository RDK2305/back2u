# CampusFind Security Enhancement - Complete Setup Guide

## 🔒 Overview

The CampusFind application now includes enhanced security features with role-based authentication, email verification, and security registration validation. This document provides a complete guide to the security implementation.

---

## 📋 Features Implemented

### 1. **Role-Based Authentication**
- **Two user types:** Students and security
- **Separate registration flows** for each role
- **Role-based access control** middleware for protected routes

#### Student Registration
- Email domain validation (@conestogac.on.ca or @conestoga.ca)
- Email verification required before login
- Automatic verification email sending
- Student ID requirement
- Campus and program selection

#### security Registration
- **security code validation** required (security code from administration)
- Email domain validation (same as students)
- Auto-verified upon registration (security trusted at admin level)
- Campus assignment based on security code
- Immediate access upon account creation

### 2. **Email Verification System**
- **Automatic email generation** with verification tokens
- **Token expiration** (24-hour validity)
- **Manual token input** option for verification
- **Verification status** tracking in user profile
- **Login blocking** until email verification complete (for students)

### 3. **Password Security**
- **Strong password requirements:**
  - Minimum 8 characters
  - At least 1 number
  - At least 1 special character (!@#$%^&*)
  - At least 1 uppercase letter
- **bcryptjs hashing** with salt (10 rounds)
- **Password change** with old password verification
- **Secure password storage** in database

### 4. **Rate Limiting**
- **Login attempts:** 5 per 15 minutes per IP
- **Registration:** 5 per hour per IP
- **Email verification:** 3 per minute per IP
- **General API:** 100 requests per 15 minutes per IP

### 5. **Security Headers**
- **X-Frame-Options:** DENY (prevent clickjacking)
- **X-Content-Type-Options:** nosniff (prevent MIME sniffing)
- **X-XSS-Protection:** 1; mode=block (enable XSS protection)
- **CORS headers:** Properly configured
- **Helmet.js integration** for comprehensive security

### 6. **Input Sanitization**
- **Whitespace trimming** on all inputs
- **HTML character removal** (prevent injection)
- **Email format validation** (RFC compliant)
- **Password validation** before storage
- **Student ID validation**

### 7. **Request Logging**
- **HTTP method and path tracking**
- **Response status logging**
- **Request duration monitoring**
- **Error status highlighting**

---

## 🔑 API Endpoints

### Authentication Endpoints

#### Student Registration
```
POST /api/auth/register
Content-Type: application/json

{
  "student_id": "A00123456",
  "email": "john.doe@conestogac.on.ca",
  "first_name": "John",
  "last_name": "Doe",
  "campus": "Main",
  "program": "Computer Science",
  "password": "SecurePass123!"
}

Response (201):
{
  "message": "Student account created. Please check your email to verify your account.",
  "user": {
    "id": 1,
    "student_id": "A00123456",
    "email": "john.doe@conestogac.on.ca",
    "first_name": "John",
    "last_name": "Doe",
    "campus": "Main",
    "role": "student",
    "is_verified": false
  },
  "requiresVerification": true
}
```

#### security Registration
```
POST /api/auth/register-security
Content-Type: application/json

{
  "student_id": "S00123456",
  "email": "security@conestogac.on.ca",
  "first_name": "Jane",
  "last_name": "Smith",
  "program": "security",
  "password": "SecurePass123!",
  "securityCode": "security2024SECURE"
}

Response (201):
{
  "message": "security account registered successfully",
  "user": {
    "id": 2,
    "student_id": "S00123456",
    "email": "security@conestogac.on.ca",
    "first_name": "Jane",
    "last_name": "Smith",
    "campus": "Main",
    "role": "security",
    "is_verified": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Email Verification
```
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}

Response (200):
{
  "message": "Email verified successfully. You can now login.",
  "verified": true
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@conestogac.on.ca",
  "password": "SecurePass123!"
}

Response (200):
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "john.doe@conestogac.on.ca",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student",
    "is_verified": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response (200):
{
  "id": 1,
  "email": "john.doe@conestogac.on.ca",
  "first_name": "John",
  "last_name": "Doe",
  "campus": "Main",
  "program": "Computer Science",
  "is_verified": true,
  "role": "student",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "campus": "Waterloo",
  "program": "Computer Science",
  "password": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>

Response (200):
{
  "message": "Logout successful"
}
```

---

## 🔐 security Registration Codes

Valid security codes (configured in authControllerSecure.js):

| Code | Campus | Role |
|------|--------|------|
| security2024SECURE | Main | security |
| security2024WATER | Waterloo | security |
| security2024CAMB | Cambridge | security |
| security2024DOON | Doon | security |

**⚠️ Important:** These codes should be stored securely in environment variables or a secure admin panel. Current setup is for development/testing.

---

## 📁 Files Modified/Created

### New Files
- `controllers/authControllerSecure.js` - Enhanced authentication controller
- `routes/authRoutesSecure.js` - Secure authentication routes
- `middleware/securityMiddleware.js` - Security middleware (rate limiting, headers, sanitization)
- `public/register.html` - New registration page with role selection
- `public/verify-email.html` - Email verification page

### Modified Files
- `server.js` - Added security middleware and new routes
- `models/User.js` - Added `findByStudentId()` method and role handling
- `package.json` - Added: `express-rate-limit`, `helmet`
- `public/login.html` - Updated to link to enhanced registration

---

## 🚀 Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

This includes the new security packages:
- `express-rate-limit` ^7.1.5 - Rate limiting middleware
- `helmet` ^7.1.0 - Security headers

### 2. Configure Environment Variables

Ensure `.env` file contains:
```
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5000
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=back2U
```

### 3. Start Server
```bash
npm start
# or for development with auto-reload
npm run dev
```

Server will run on: `http://localhost:5000`

---

## 📝 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  campus VARCHAR(100),
  program VARCHAR(100),
  password VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  role ENUM('student', 'security', 'admin') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Notes
- `is_verified` = TRUE for security (auto-verified), requires email verification for students
- `role` determines access level and available features
- `student_id` is unique identifier for each user

---

## 🔄 Student Registration Flow

```
1. User selects "Student" role
   ↓
2. Fills registration form with student details
   ↓
3. Password validated against requirements
   ↓
4. Backend creates user with is_verified = false
   ↓
5. Verification email sent with token
   ↓
6. User receives email with verification link
   ↓
7. User clicks link or pastes token
   ↓
8. Email verified, is_verified set to true
   ↓
9. User can now login
   ↓
10. JWT token generated on successful login
```

---

## 👔 security Registration Flow

```
1. User selects "security" role
   ↓
2. Enters valid security registration code
   ↓
3. Code validated against VALID_security_CODES
   ↓
4. If invalid → Registration blocked with error
   ↓
5. If valid → Fills security details
   ↓
6. Password validated
   ↓
7. Backend creates security with is_verified = true
   ↓
8. security has immediate access
   ↓
9. Login redirects to dashboard
   ↓
10. JWT token generated
```

---

## 🛡️ Security Best Practices

### For Administrators
1. **Secure security codes** - Keep registration codes confidential
2. **Regular audits** - Monitor login attempts and registration
3. **Update JWT secret** - Change JWT_SECRET regularly
4. **Email service** - Integrate real email service (SendGrid, Mailgun, etc.)
5. **Monitor logs** - Check request logs for suspicious activity

### For Users
1. **Strong passwords** - Use complex passwords meeting requirements
2. **Email security** - Keep registration email secure
3. **Token safety** - Don't share verification tokens
4. **Logout** - Always logout from public/shared computers
5. **Report issues** - Report suspicious activity to security

### For Developers
1. **HTTPS** - Always use HTTPS in production
2. **CORS** - Configure CORS properly for your domain
3. **Secrets** - Never commit `.env` file to version control
4. **Updates** - Keep dependencies updated
5. **Testing** - Test all auth flows before deployment

---

## 🧪 Testing the Security Features

### Test Student Registration
1. Navigate to http://localhost:5000/register.html
2. Select "Student" role
3. Fill in student details with @conestogac.on.ca email
4. Create account
5. Check console for verification email details
6. Copy verification token
7. Go to http://localhost:5000/verify-email.html
8. Paste token and verify
9. Login with credentials

### Test security Registration
1. Navigate to http://localhost:5000/register.html
2. Select "security" role
3. Enter valid security code (e.g., security2024SECURE)
4. Fill in security details
5. Create account
6. Should be redirected to dashboard immediately
7. security account is auto-verified

### Test Rate Limiting
1. Try login 6 times rapidly
2. Should receive "Too many login attempts" error
3. Wait 15 minutes or IP changes to retry

### Test Password Validation
1. Try password less than 8 characters
2. Try password without number
3. Try password without special character
4. System should show specific validation errors

---

## 📊 Security Middleware Flow

```
Request Received
    ↓
[Helmet Security Headers] - Add security headers
    ↓
[Security Headers Middleware] - Add CORS, frame options
    ↓
[Request Logger] - Log request details
    ↓
[Express JSON Parser] - Parse request body
    ↓
[Sanitize Input] - Remove injection characters
    ↓
[Rate Limiter] - Check rate limits
    ↓
[Email Validator] - Validate email format (if needed)
    ↓
[Route Handler] - Process request
    ↓
[Response] - Send response to client
    ↓
[Request Logger] - Log response details
```

---

## 🐛 Troubleshooting

### Issue: "Too many registration attempts"
**Solution:** Rate limiter active. Wait 1 hour or use different IP.

### Issue: "Email already registered"
**Solution:** Account exists. Use different email or login if it's your account.

### Issue: "Invalid security registration code"
**Solution:** Code doesn't match. Contact administration for valid code.

### Issue: "Invalid email format"
**Solution:** Use @conestogac.on.ca or @conestoga.ca email.

### Issue: "Password does not meet requirements"
**Solution:** Use 8+ characters, 1 number, 1 special char, 1 uppercase.

### Issue: "Email not received"
**Solution:** Production setup should use real email service. Development logs token to console.

---

## 📧 Email Integration (Production)

To send real emails, integrate with a service like Nodemailer:

```javascript
// In authControllerSecure.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendVerificationEmail = async (email, verificationToken, userName) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email.html?token=${verificationToken}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'CampusFind Email Verification',
    html: `<p>Hello ${userName},</p>
           <p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`
  });
};
```

---

## 🔄 Future Enhancements

1. **Two-Factor Authentication (2FA)** - SMS or authenticator app
2. **Admin Panel** - Manage security codes and user accounts
3. **Email Service Integration** - Real email sending
4. **Token Blacklist** - Logout token invalidation
5. **Activity Logging** - Detailed audit trails
6. **IP Whitelisting** - Restrict login from certain IPs
7. **Password Reset** - Forgot password functionality
8. **Session Management** - Track user sessions
9. **Biometric Auth** - Fingerprint/face recognition
10. **OAuth Integration** - Google/Microsoft login

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review console logs
3. Check database records
4. Contact development team

---

**Version:** 2.0.0-secure  
**Last Updated:** 2024  
**Security Level:** ⭐⭐⭐⭐ (High)  
**Production Ready:** ✅ (with email service integration)
