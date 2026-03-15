const pool = require('../config/database');

class Notification {
  static async create(notificationData) {
    const { user_id, type, title, message, related_item_id, related_claim_id } = notificationData;
    
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        `INSERT INTO notifications 
         (user_id, type, title, message, related_item_id, related_claim_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, type, title, message, related_item_id, related_claim_id]
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
        `SELECT * FROM notifications WHERE id = ?`,
        [id]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async getUserNotifications(user_id, limit = 20, offset = 0) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT * FROM notifications 
         WHERE user_id = ? 
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [user_id, limit, offset]
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
        `SELECT COUNT(*) as unread_count FROM notifications 
         WHERE user_id = ? AND \`read\` = 0`,
        [user_id]
      );
      return rows[0].unread_count;
    } finally {
      connection.release();
    }
  }

  static async markAsRead(notification_id) {
    const connection = await pool.getConnection();
    try {
      await connection.query(
        `UPDATE notifications SET \`read\` = 1 WHERE id = ?`,
        [notification_id]
      );
      return this.findById(notification_id);
    } finally {
      connection.release();
    }
  }

  static async markAllAsRead(user_id) {
    const connection = await pool.getConnection();
    try {
      await connection.query(
        `UPDATE notifications SET \`read\` = 1 WHERE user_id = ?`,
        [user_id]
      );
      return true;
    } finally {
      connection.release();
    }
  }

  static async deleteNotification(notification_id) {
    const connection = await pool.getConnection();
    try {
      await connection.query(
        `DELETE FROM notifications WHERE id = ?`,
        [notification_id]
      );
      return true;
    } finally {
      connection.release();
    }
  }

  static async deleteOldNotifications(days = 30) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        `DELETE FROM notifications 
         WHERE \`read\` = 1 
         AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
        [days]
      );
      return result.affectedRows;
    } finally {
      connection.release();
    }
  }

  static async getNotificationsByType(user_id, type) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT * FROM notifications 
         WHERE user_id = ? AND type = ?
         ORDER BY created_at DESC`,
        [user_id, type]
      );
      return rows;
    } finally {
      connection.release();
    }
  }
}

module.exports = Notification;
