const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL configuration - Supports both local and cloud (Aiven) databases
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Back2u',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // SSL configuration for Aiven cloud database
  ssl: process.env.DB_SSL === 'true' ? true : false,
  // Strict SSL mode for production
  ...(process.env.DB_SSL === 'true' && {
    enableCredentialsOverride: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
  }),
});

pool.on('connection', () => {
  console.log('✅ MySQL connected!');
  console.log(`📊 Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}:${process.env.DB_PORT}`);
});

pool.on('error', (err) => {
  console.error('❌ MySQL error:', err.message);
});

module.exports = pool;
