const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { student_id, email, first_name, last_name, campus, program, password, role, is_verified } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Set verification status (if provided explicitly, use it; otherwise check email domain)
    const verificationStatus = is_verified !== undefined ? is_verified : email.endsWith('.on.ca');

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        `INSERT INTO users 
         (student_id, email, first_name, last_name, campus, program, password, is_verified, role) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [student_id, email, first_name, last_name, campus, program, hashedPassword, verificationStatus, role || 'student']
      );
      
      return this.findById(result.insertId);
    } finally {
      connection.release();
    }
  }

  static async findByEmail(email) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async findByStudentId(student_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query('SELECT * FROM users WHERE student_id = ?', [student_id]);
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query('SELECT id, student_id, email, first_name, last_name, campus, program, is_verified, role FROM users WHERE id = ?', [id]);
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAllUsers() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT id, student_id, email, first_name, last_name, campus, program, is_verified, role, created_at FROM users'
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined && value !== null) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const connection = await pool.getConnection();
    try {
      await connection.query(query, values);
      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  static async saveOTP(email, otpCode, expiryMinutes = 10) {
    const connection = await pool.getConnection();
    try {
      const hashedOTP = await bcrypt.hash(otpCode, 10);
      // Convert to MySQL TIMESTAMP format (YYYY-MM-DD HH:MM:SS)
      const expiryTime = new Date(Date.now() + expiryMinutes * 60000);
      const mysqlTime = expiryTime.toISOString().slice(0, 19).replace('T', ' ');
      
      await connection.query(
        `UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE email = ?`,
        [hashedOTP, mysqlTime, email]
      );
      console.log(`✅ OTP saved for ${email}, expires at: ${mysqlTime}`);
      return true;
    } catch (err) {
      console.error('❌ Error saving OTP:', err.message);
      throw err;
    } finally {
      connection.release();
    }
  }

  static async verifyOTP(email, otpCode) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT otp_code, otp_expires_at FROM users WHERE email = ?`,
        [email]
      );
      
      if (rows.length === 0) {
        console.log(`⚠️  OTP verification failed: User not found - ${email}`);
        return false;
      }

      const user = rows[0];
      
      if (!user.otp_code) {
        console.log(`⚠️  OTP verification failed: No OTP set for ${email}`);
        return false;
      }
      
      // Check if OTP has expired - MySQL TIMESTAMP format
      const now = new Date();
      const expiryTimestamp = new Date(user.otp_expires_at);
      
      if (!user.otp_expires_at || now > expiryTimestamp) {
        console.log(`⚠️  OTP verification failed: OTP expired for ${email}`);
        console.log(`   Current time: ${now.toISOString()}`);
        console.log(`   Expiry time: ${expiryTimestamp.toISOString()}`);
        return false;
      }

      // Compare OTP
      const isValid = await bcrypt.compare(otpCode, user.otp_code);
      if (isValid) {
        console.log(`✅ OTP verification successful for ${email}`);
      } else {
        console.log(`⚠️  OTP verification failed: Invalid OTP code for ${email}`);
      }
      return isValid;
    } catch (err) {
      console.error(`❌ Error verifying OTP for ${email}:`, err.message);
      throw err;
    } finally {
      connection.release();
    }
  }

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
}

module.exports = User;