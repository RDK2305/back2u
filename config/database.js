const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL connection pool configuration
const getPoolConfig = () => {
  const baseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Back2u',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    supportBigNumbers: true,
    bigNumberStrings: true,
  };

  // Add SSL configuration for Aiven cloud database
  if (process.env.DB_SSL === 'true') {
    baseConfig.ssl = {
      rejectUnauthorized: false, // Aiven uses self-signed certificates
    };
  }

  return baseConfig;
};

const pool = mysql.createPool(getPoolConfig());

pool.on('connection', () => {
  console.log('✅ MySQL connected!');
  console.log(`📊 Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}:${process.env.DB_PORT}`);
});

pool.on('error', (err) => {
  console.error('❌ MySQL error:', err.message);
});

module.exports = pool;
