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
}

module.exports = User;