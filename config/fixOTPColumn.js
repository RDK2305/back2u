const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixOTPColumn() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    const connection = await pool.getConnection();

    // Modify the otp_code column to VARCHAR(255)
    const query = 'ALTER TABLE users MODIFY COLUMN otp_code VARCHAR(255) NULL';
    console.log('🔧 Executing:', query);
    
    await connection.query(query);
    console.log('✅ OTP code column updated to VARCHAR(255)');

    connection.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixOTPColumn();
