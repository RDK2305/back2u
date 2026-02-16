# CampusFind Security - Implementation Guide for Developers

## 📚 Quick Start

### 1. Start the Server
```bash
npm start
# or with auto-reload
npm run dev
```

Server runs on: **http://localhost:5000**

### 2. Access the Application
- **Home:** http://localhost:5000/
- **Register (Enhanced):** http://localhost:5000/register.html
- **Login:** http://localhost:5000/login.html
- **Verify Email:** http://localhost:5000/verify-email.html

### 3. Test the APIs
```bash
node test_security_api.js
```

---

## 🔐 security Registration Codes Reference

### Production Setup (In authControllerSecure.js):

```javascript
const VALID_security_CODES = {
  'security2024SECURE': { campus: 'Main', role: 'security' },
  'security2024WATER': { campus: 'Waterloo', role: 'security' },
  'security2024CAMB': { campus: 'Cambridge', role: 'security' },
  'security2024DOON': { campus: 'Doon', role: 'security' }
};
```

### For Production: Store in Database
```sql
CREATE TABLE security_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  campus VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_count INT DEFAULT 0,
  max_uses INT,
  expires_at TIMESTAMP,
  created_by INT
);
```

### Then Update Controller:
```javascript
const VALID_security_CODES = {};

// Load from database on startup
async function loadsecurityCodes() {
  const connection = await pool.getConnection();
  const [codes] = await connection.query(
    'SELECT code, campus FROM security_codes WHERE expires_at > NOW()'
  );
  codes.forEach(c => {
    VALID_security_CODES[c.code] = { campus: c.campus, role: 'security' };
  });
  connection.release();
}

// Call on startup
loadsecurityCodes();
```

---

## 📧 Email Integration (Required for Production)

### Option 1: Using Nodemailer with Gmail

```javascript
// Install: npm install nodemailer

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,      // your-email@gmail.com
    pass: process.env.EMAIL_PASSWORD   // app-specific password
  }
});

const sendVerificationEmail = async (email, verificationToken, userName) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email.html?token=${verificationToken}`;
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🎓 CampusFind Email Verification',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>CampusFind Email Verification</h1>
          </div>
          <div style="padding: 20px; background-color: #f9fafb;">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Thank you for registering with CampusFind! To complete your registration, please verify your email address by clicking the link below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p><small>Or copy this link: ${verificationLink}</small></p>
            <p>This link expires in 24 hours.</p>
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              If you didn't register for CampusFind, please ignore this email.
            </p>
          </div>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};
```

### Environment Variables for Email:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
FRONTEND_URL=https://yourdomain.com
```

### Option 2: Using SendGrid

```javascript
// Install: npm install @sendgrid/mail

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (email, verificationToken, userName) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email.html?token=${verificationToken}`;
  
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: '🎓 CampusFind Email Verification',
    html: `<p>Hello ${userName},</p><p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('SendGrid error:', error);
    return false;
  }
};
```

### Option 3: Using AWS SES

```javascript
// Install: npm install aws-sdk

const AWS = require('aws-sdk');

const ses = new AWS.SES({
  region: process.env.AWS_REGION
});

const sendVerificationEmail = async (email, verificationToken, userName) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email.html?token=${verificationToken}`;
  
  const params = {
    Source: process.env.SES_FROM_EMAIL,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: '🎓 CampusFind Email Verification' },
      Body: {
        Html: { Data: `<p>Click <a href="${verificationLink}">here</a> to verify.</p>` }
      }
    }
  };

  return new Promise((resolve) => {
    ses.sendEmail(params, (err, data) => {
      if (err) {
        console.error('SES error:', err);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};
```

---

## 🔑 Password Requirements Explained

### Current Requirements:
```javascript
// Must contain ALL of:
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 number (0-9)  
- At least 1 special character (!@#$%^&*)

// VALID Examples:
✅ SecurePass123!
✅ MyPassword@2024
✅ CampusFind#789

// INVALID Examples:
❌ password1 (no uppercase, no special char)
❌ Password123 (no special char)
❌ pass!1 (too short)
❌ PASSWORD! (no number)
```

### Validation Code:
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
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  return errors;
};
```

---

## 🎯 Email Domain Configuration

### Currently Allowed:
- `@conestogac.on.ca`
- `@conestoga.ca`

### To Add More Domains:

In **authControllerSecure.js**, update:
```javascript
const validateEmailDomain = (email) => {
  const validDomains = [
    'conestogac.on.ca',
    'conestoga.ca',
    'yourdomain.ca',  // Add here
    'anotherdomain.com'
  ];
  const domain = email.split('@')[1];
  return validDomains.includes(domain);
};
```

---

## 🛡️ Rate Limiting Configuration

### Current Limits (in middleware/securityMiddleware.js):

```javascript
// Login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts
  message: 'Too many login attempts...'
});

// Registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 5,                      // 5 registrations
  message: 'Too many registrations...'
});

// Email verification
const verifyLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 3,                      // 3 attempts
  message: 'Too many verification attempts...'
});

// General API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 100,                    // 100 requests
  message: 'Too many requests...'
});
```

### To Adjust:

Edit the `windowMs` and `max` values. For example, stricter login:
```javascript
windowMs: 30 * 60 * 1000,  // 30 minutes
max: 3,                     // 3 attempts
```

---

## 🔍 Monitoring & Logging

### Current Logging Output:
```
✅ GET /api/auth/me - 200 (5ms)
❌ POST /api/auth/login - 401 (12ms)
⚠️ POST /api/auth/register - 400 (8ms)
```

### Log Format: `[STATUS] METHOD /path - CODE (duration)`

### Status Indicators:
- `✅` = Success (2xx)
- `⚠️` = Redirect/Not Modified (3xx)
- `❌` = Client/Server Error (4xx/5xx)

### Access Logs in Production:
```bash
# View real-time logs
npm run dev

# Or save to file
npm start > logs/server.log 2>&1
```

---

## 🧪 Testing Different Scenarios

### Test 1: Student Registration with Valid Data
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "A00123456",
    "email": "john@conestogac.on.ca",
    "first_name": "John",
    "last_name": "Doe",
    "campus": "Main",
    "program": "Computer Science",
    "password": "SecurePass123!"
  }'
```

### Test 2: security Registration with Code
```bash
curl -X POST http://localhost:5000/api/auth/register-security \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "S00123456",
    "email": "security@conestogac.on.ca",
    "first_name": "Jane",
    "last_name": "Smith",
    "program": "security",
    "password": "SecurePass123!",
    "securityCode": "security2024SECURE"
  }'
```

### Test 3: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@conestogac.on.ca",
    "password": "SecurePass123!"
  }'
```

### Test 4: Access Protected Route
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/auth/me
```

---

## 🚨 Error Codes Reference

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check input validation errors |
| 401 | Unauthorized | Invalid credentials or missing token |
| 403 | Forbidden | Invalid security code or email not verified |
| 404 | Not Found | Endpoint doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded, wait before retry |
| 500 | Server Error | Check server logs |

---

## 📝 Database Backup Script

```bash
# MySQL Backup
mysqldump -u root -p back2U > backup_$(date +%Y%m%d_%H%M%S).sql

# MySQL Restore
mysql -u root -p back2U < backup_20240115_120000.sql
```

---

## 🔄 Deployment Workflow

### Step 1: Prepare Production
```bash
# Clone/pull latest code
git clone <repo>
cd campusfind

# Install dependencies
npm install

# Copy .env template and configure
cp .env.example .env
# Edit .env with production values
```

### Step 2: Configure Environment
```bash
# .env should contain:
JWT_SECRET=<long-random-string>
JWT_EXPIRE=7d
DATABASE_HOST=production-db.com
DATABASE_USER=db_user
DATABASE_PASSWORD=secure_password
DATABASE_NAME=back2U_prod
EMAIL_USER=noreply@campusfind.com
EMAIL_PASSWORD=email_app_password
FRONTEND_URL=https://campusfind.com
```

### Step 3: Test Everything
```bash
npm run dev  # Test in development
node test_security_api.js  # Run tests
```

### Step 4: Deploy
```bash
npm start  # Start production server
# or use PM2 for process management
npm install -g pm2
pm2 start server.js --name "campusfind"
pm2 save
pm2 startup
```

---

## 📊 Performance Optimization

### Current Performance:
- Registration: ~130ms
- Login: ~15ms
- Email Verification: ~10ms
- Rate Limit Check: <1ms

### To Further Optimize:

1. **Add Caching:**
```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache user lookups
const cachedUserLookup = async (email) => {
  const cached = await client.get(`user:${email}`);
  if (cached) return JSON.parse(cached);
  
  const user = await User.findByEmail(email);
  await client.setex(`user:${email}`, 3600, JSON.stringify(user));
  return user;
};
```

2. **Database Indexes:**
```sql
ALTER TABLE users ADD INDEX idx_email (email);
ALTER TABLE users ADD INDEX idx_student_id (student_id);
ALTER TABLE users ADD INDEX idx_role (role);
```

3. **Connection Pooling:** Already configured with mysql2/promise

---

## 🎓 Learning Resources

### For Understanding the Code:
1. `SECURITY_SETUP.md` - Complete security documentation
2. `SECURITY_IMPLEMENTATION_SUMMARY.md` - Implementation overview
3. Comments in source files
4. API endpoints documentation

### For Further Study:
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

---

## ✅ Pre-Launch Checklist

- [ ] All tests passing
- [ ] Email service integrated (if using)
- [ ] security codes in database
- [ ] HTTPS/SSL enabled
- [ ] .env configured for production
- [ ] Database backups scheduled
- [ ] Monitoring set up
- [ ] Rate limits tuned for your load
- [ ] Security headers correct
- [ ] CORS domain set correctly
- [ ] JWT_SECRET is strong and unique
- [ ] Logs are being recorded
- [ ] Staging environment tested
- [ ] Team trained on security practices
- [ ] Incident response plan ready

---

**Ready to launch? 🚀 Make sure everything above is checked before going live!**
