const pool = require('../config/database');

class Message {
  static async create(messageData) {
    const { claim_id, sender_id, receiver_id, message } = messageData;
    
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        `INSERT INTO messages 
         (claim_id, sender_id, receiver_id, message) 
         VALUES (?, ?, ?, ?)`,
        [claim_id, sender_id, receiver_id, message]
      );
      
      return this.findById(result.insertId);
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT m.*, 
                u1.first_name as sender_name, u1.email as sender_email,
                u2.first_name as receiver_name, u2.email as receiver_email
         FROM messages m
         JOIN users u1 ON m.sender_id = u1.id
         JOIN users u2 ON m.receiver_id = u2.id
         WHERE m.id = ?`,
        [id]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async getClaimMessages(claim_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT m.*, 
                u1.first_name as sender_name, u1.email as sender_email,
                u2.first_name as receiver_name, u2.email as receiver_email
         FROM messages m
         JOIN users u1 ON m.sender_id = u1.id
         JOIN users u2 ON m.receiver_id = u2.id
         WHERE m.claim_id = ?
         ORDER BY m.created_at ASC`,
        [claim_id]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async getUserMessages(user_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT m.*, 
                u1.first_name as sender_name, u1.email as sender_email,
                u2.first_name as receiver_name, u2.email as receiver_email,
                c.id as claim_id, i.title as item_title
         FROM messages m
         JOIN users u1 ON m.sender_id = u1.id
         JOIN users u2 ON m.receiver_id = u2.id
         JOIN claims c ON m.claim_id = c.id
         JOIN items i ON c.item_id = i.id
         WHERE m.receiver_id = ?
         ORDER BY m.created_at DESC`,
        [user_id]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async getUnreadCount(user_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT COUNT(*) as unread_count FROM messages 
         WHERE receiver_id = ? AND \`read\` = 0`,
        [user_id]
      );
      return rows[0].unread_count;
    } finally {
      connection.release();
    }
  }

  static async markAsRead(message_id) {
    const connection = await pool.getConnection();
    try {
      await connection.query(
        `UPDATE messages SET \`read\` = 1 WHERE id = ?`,
        [message_id]
      );
      return this.findById(message_id);
    } finally {
      connection.release();
    }
  }

  static async markClaimMessagesAsRead(claim_id, user_id) {
    const connection = await pool.getConnection();
    try {
      await connection.query(
        `UPDATE messages SET \`read\` = 1 
         WHERE claim_id = ? AND receiver_id = ?`,
        [claim_id, user_id]
      );
      return true;
    } finally {
      connection.release();
    }
  }

  static async deleteMessage(message_id) {
    const connection = await pool.getConnection();
    try {
      await connection.query(
        `DELETE FROM messages WHERE id = ?`,
        [message_id]
      );
      return true;
    } finally {
      connection.release();
    }
  }
}

module.exports = Message;
