# Live Server OTP Fixes - Complete Troubleshooting Guide

## 🔴 Issues Found on Live Server (https://back2u-h67h.onrender.com)

### 1. **Timezone/Time Synchronization Error** ⏰
**Problem**: OTP expiration check was failing due to timezone mismatches
- Local machine and Render server have different timezones
- JavaScript Date objects use local timezone while database TIMESTAMP uses UTC
- Comparison `new Date() > new Date(user.otp_expires_at)` could fail

**Solution**: ✅ Fixed in `models/User.js`
- Now uses ISO 8601 UTC timestamps consistently (`toISOString()`)
- Converts all timestamps to UTC before comparison
- Added detailed logging to track timezone issues

### 2. **Gmail SMTP Configuration Issues** 📧
**Problem**: Email not being sent in production mode
- Missing TLS configuration
- Insufficient error logging
- Gmail might be blocking connections due to security settings

**Solution**: ✅ Fixed in `utils/emailUtil.js`
- Added `requireTLS: true` to force TLS encryption
- Added `tls.rejectUnauthorized: false` for Render compatibility
- Enhanced error logging with Gmail-specific guidance

### 3. **Insufficient Error Logging** 🔍
**Problem**: Can't debug issues on live server
- No visibility into what's actually happening
- Errors silently failing without clear messages

**Solution**: ✅ Added comprehensive logging to:
- `controllers/authControllerSecure.js` - forgotPassword & verifyOtp
- `models/User.js` - saveOTP & verifyOTP
- `utils/emailUtil.js` - email sending with detailed error messages

---

## ✅ Fixed Files

### 1. **models/User.js** - saveOTP Method
```javascript
// OLD: Using plain Date object (timezone issues)
const expiryTime = new Date(Date.now() + expiryMinutes * 60000);

// NEW: Using ISO 8601 UTC (timezone-safe)
const expiryTime = new Date(Date.now() + expiryMinutes * 60000).toISOString();
```

Added logging:
```
✅ OTP saved for user@email.com, expires at: 2026-03-15T10:30:00.000Z
```

### 2. **models/User.js** - verifyOTP Method
```javascript
// NEW: UTC timestamp comparison
const now = new Date().toISOString();           // e.g., 2026-03-15T10:25:00.000Z
const expiryTime = new Date(user.otp_expires_at).toISOString(); // e.g., 2026-03-15T10:30:00.000Z

if (now > expiryTime) {
  console.log(`OTP expired for ${email}`);
  console.log(`Current time (UTC): ${now}`);
  console.log(`Expiry time (UTC): ${expiryTime}`);
  return false;
}
```

### 3. **utils/emailUtil.js** - Gmail Configuration
```javascript
// NEW: Complete Gmail SMTP configuration
transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,           // Use TLS, not SSL
  requireTLS: true,        // Force TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  logger: true,            // Enable logging
  debug: process.env.DEBUG_EMAIL === 'true',
  tls: {
    rejectUnauthorized: false  // For Render compatibility
  }
});
```

### 4. **Enhanced Error Messages**
```javascript
// NEW: Detailed Gmail error assistance
if (error.code === 'EAUTH') {
  console.error('\n⚠️ GMAIL AUTHENTICATION ERROR - Check:');
  console.error('1. Gmail 2-Step Verification is enabled');
  console.error('2. App password created at https://myaccount.google.com/apppasswords');
  console.error('3. EMAIL_PASSWORD in .env is 16-character app password (no spaces)');
  console.error('4. EMAIL_USER in .env is your Gmail address');
}
```

---

## 🔧 Verification Steps on Live Server

### Step 1: Check Server Logs on Render
Navigate to your Render dashboard and check the live logs:

```bash
# You should see new log messages like:
📧 [FORGOT PASSWORD] Request for email: user@conestogac.on.ca
✅ [FORGOT PASSWORD] User found: user@conestogac.on.ca
🔐 [FORGOT PASSWORD] Generated OTP: 123456
💾 [FORGOT PASSWORD] Saving OTP to database...
✅ [FORGOT PASSWORD] OTP saved successfully
📬 [FORGOT PASSWORD] Sending OTP email...
📧 Sending OTP email to: user@conestogac.on.ca
✅ OTP email sent successfully
   Response: 250 2.0.0 OK: queued as XXXXXXXXXX
   Message ID: <xxx@gmail.com>
```

### Step 2: Test Forgot Password Flow

1. Open: https://back2u-h67h.onrender.com/forgot-password.html
2. Enter your email: `user@conestogac.on.ca`
3. Click "Send OTP"
4. Check your email for the OTP code
5. Enter the code and verify
6. Reset your password

### Step 3: If Email Not Arriving

**Possible causes:**
1. **Gmail blocking the app**
   - Check: https://myaccount.google.com/apppasswords
   - Verify 2-Step Verification is enabled
   - Create new app password if needed

2. **App password has spaces**
   - Remove any spaces from EMAIL_PASSWORD in .env
   - Example: `mmjdfkhmlejl qyxt` → `mmjdfkhmlejlqyxt`

3. **Email credentials wrong**
   - Verify:
     - EMAIL_USER=djgaming994799@gmail.com
     - EMAIL_PASSWORD=16-character app password

4. **Timezone causing OTP expiration**
   - OTP expires after 10 minutes from creation
   - Check Render server time zone settings
   - UTC timestamps are now used consistently

---

## 📋 .env Configuration Check

Verify your `.env` file on Render has:

```env
NODE_ENV=production

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM="CampusFind <your-gmail@gmail.com>"

# Database (Aiven Cloud)
DB_HOST=your-aiven-host.a.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=your-aiven-password
DB_NAME=defaultdb
DB_PORT=26526
DB_SSL=true

# JWT
JWT_SECRET=your-secret-key
```

⚠️ **Keep all credentials secret!** Do not commit real passwords to GitHub.

---

## 🚀 How to Deploy Fix to Live Server

### Option 1: Git Push (Recommended)
```bash
# 1. Commit changes locally
git add .
git commit -m "[FIX] OTP timestamp timezone handling and Gmail SMTP configuration"

# 2. Push to main branch
git push origin main

# 3. Render will auto-deploy (watch the logs)
```

### Option 2: Manual Render Deploy
1. Go to https://render.com
2. Select your service (back2u-h67h)
3. Click "Manual Deploy" → "Deploy latest commit"
4. Watch logs as it rebuilds

---

## 📝 Database Schema Note

The `otp_expires_at` column is already defined as `TIMESTAMP`:

```sql
ALTER TABLE users ADD COLUMN otp_expires_at TIMESTAMP NULL;
```

When storing ISO 8601 UTC formats like `2026-03-15T10:30:00.000Z`, MySQL automatically converts them to the server's timezone, then back to UTC when retrieving. The new UTC-based comparison handles this correctly.

---

## 🔍 Debugging Commands

If issues persist, SSH into Render and run:

```bash
# Check environment variables
echo $NODE_ENV
echo $EMAIL_HOST
echo $EMAIL_USER

# Verify Gmail credentials work
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: 'djgaming994799@gmail.com',
    pass: 'mmjdfkhmlejlqyxt'
  }
});
transporter.verify((err, success) => {
  if (err) console.error('❌ Gmail error:', err.message);
  else console.log('✅ Gmail SMTP OK');
});
"
```

---

## 📞 Gmail App Password Setup (if needed)

1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password
6. Update `.env` with this password (remove any spaces)
7. Redeploy

---

## ✨ What's Fixed

| Issue | Before | After |
|-------|--------|-------|
| Timezone | ❌ Local time used | ✅ UTC timestamps |
| OTP Expiry | ❌ Fails on Render | ✅ Consistent across all servers |
| Email Errors | ❌ Silent failures | ✅ Detailed error logging |
| Gmail SMTP | ❌ No TLS config | ✅ Proper TLS & requireTLS |
| Debugging | ❌ No visibility | ✅ Comprehensive logs |

---

## 📚 Related Files Modified

- ✅ `models/User.js` - saveOTP & verifyOTP
- ✅ `utils/emailUtil.js` - getTransporter & sendOTPEmail
- ✅ `controllers/authControllerSecure.js` - forgotPassword & verifyOtp
- ✅ `OTP_CODE_REFERENCE.md` - Complete OTP documentation

---

**Last Updated**: March 15, 2026  
**Status**: ✅ Ready for Live Server Testing

For questions, check server logs on Render dashboard for detailed error messages.
