const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Back2u',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.on('connection', () => {
  console.log('✅ MySQL connected!');
});

pool.on('error', (err) => {
  console.error('❌ MySQL error:', err.message);
});

module.exports = pool;
