const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

// Verify required environment variables
const requiredEnv = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnv = requiredEnv.filter(env => !process.env[env]);

if (missingEnv.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnv.join(', '));
  process.exit(1);
}

// Route imports
const authRoutesSecure = require('./routes/authRoutesSecure');
const itemRoutes = require('./routes/itemRoutes');
const claimRoutes = require('./routes/claimRoutes');

// Security middleware imports
const {
  loginLimiter,
  registerLimiter,
  verifyLimiter,
  apiLimiter,
  securityHeaders,
  requestLogger,
  sanitizeInput,
  validateEmail
} = require('./middleware/securityMiddleware');

// Initialize express
const app = express();

// Security headers with CSP allowing Tailwind CDN
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-hashes'", "https://cdn.tailwindcss.com"],
      scriptSrcAttr: ["'unsafe-inline'", "'unsafe-hashes'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:5000"],
    },
  },
}));
app.use(securityHeaders);
app.use(requestLogger);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Favicon and manifest routes
app.get('/favicon.ico', (req, res) => {
  res.type('image/x-icon');
  res.sendFile(path.join(__dirname, 'public', 'images', 'favicon.ico'));
});

app.get('/favicon.svg', (req, res) => {
  res.type('image/svg+xml');
  res.sendFile(path.join(__dirname, 'public', 'favicon.svg'));
});

app.get('/apple-touch-icon.png', (req, res) => {
  res.type('image/png');
  res.sendFile(path.join(__dirname, 'public', 'images', 'apple-touch-icon.png'));
});

app.get('/site.webmanifest', (req, res) => {
  res.type('application/manifest+json');
  res.sendFile(path.join(__dirname, 'public', 'images', 'site.webmanifest'));
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Back2u API is running 🎓',
    version: '2.0.0-secure',
    endpoints: {
      auth: '/api/auth',
      items: '/api/items',
      claims: '/api/claims'
    },
    authEndpoints: {
      'POST /api/auth/register-security': 'Register as security with code',
      'POST /api/auth/register': 'Register as student',
      'POST /api/auth/verify-email': 'Verify email with token',
      'POST /api/auth/login': 'Login (security or student)',
      'GET /api/auth/me': 'Get current user (requires token)',
      'PUT /api/auth/profile': 'Update profile (requires token)',
      'POST /api/auth/logout': 'Logout (requires token)'
    }
  });
});

// API Routes with rate limiting
app.use('/api/auth/login', loginLimiter, validateEmail);
app.use('/api/auth/register-security', registerLimiter, validateEmail);
app.use('/api/auth/register', registerLimiter, validateEmail);
app.use('/api/auth/verify-email', verifyLimiter);
app.use('/api/auth', authRoutesSecure);
app.use('/api/items', apiLimiter, itemRoutes);
app.use('/api/claims', apiLimiter, claimRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;

try {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📌 Environment: ${process.env.NODE_ENV}`);
    console.log(`🗄️  Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
  });

} catch (err) {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
}