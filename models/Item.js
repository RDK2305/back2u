const pool = require('../config/database');

class Item {
  static async create(itemData) {
    const { title, category, description, location_found, campus, type, status, distinguishing_features, date_lost, date_found, image_url, user_id } = itemData;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        `INSERT INTO items
         (title, category, description, location_found, campus, type, status, distinguishing_features, date_lost, date_found, image_url, user_id, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [title, category, description, location_found, campus, type || 'found', status || 'Open', distinguishing_features, date_lost, date_found, image_url, user_id]
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
        `SELECT i.*, u.first_name, u.last_name, u.email as user_email
         FROM items i
         JOIN users u ON i.user_id = u.id
         WHERE i.id = ?`,
        [id]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT i.*, u.first_name, u.last_name, u.email as user_email
      FROM items i
      JOIN users u ON i.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Only show active items on public queries (skip filter for security/admin)
    if (filters.includeInactive !== true) {
      query += ` AND i.is_active = TRUE`;
    }

    if (filters.type) {
      query += ` AND i.type = ?`;
      params.push(filters.type);
    }

    if (filters.category) {
      query += ` AND i.category = ?`;
      params.push(filters.category);
    }

    if (filters.campus) {
      query += ` AND i.campus = ?`;
      params.push(filters.campus);
    }

    if (filters.status) {
      query += ` AND i.status = ?`;
      params.push(filters.status);
    }

    if (filters.search) {
      query += ` AND (i.title LIKE ? OR i.description LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    // COUNT query (no pagination)
    if (filters.countOnly) {
      const connection = await pool.getConnection();
      try {
        const countQuery = `SELECT COUNT(*) as total FROM items i JOIN users u ON i.user_id = u.id WHERE 1=1` +
          query.split('WHERE 1=1')[1].split('ORDER BY')[0];
        const [rows] = await connection.query(countQuery, params);
        return rows[0].total;
      } finally {
        connection.release();
      }
    }

    query += ' ORDER BY i.created_at DESC';

    if (filters.limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(filters.limit));
    }

    if (filters.offset !== undefined && filters.offset !== null) {
      query += ` OFFSET ?`;
      params.push(parseInt(filters.offset));
    }

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query, params);
      return rows;
    } finally {
      connection.release();
    }
  }

  static async updateStatus(id, status) {
    const connection = await pool.getConnection();
    try {
      await connection.query('UPDATE items SET status = ? WHERE id = ?', [status, id]);
      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  // @desc  Soft-deactivate an item (admin/security moderation)
  static async deactivate(id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'UPDATE items SET is_active = FALSE WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0 ? this.findById(id) : null;
    } finally {
      connection.release();
    }
  }

  // @desc  Re-activate a previously deactivated item
  static async activate(id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'UPDATE items SET is_active = TRUE WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0 ? this.findById(id) : null;
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
    const query = `UPDATE items SET ${fields.join(', ')} WHERE id = ?`;

    const connection = await pool.getConnection();
    try {
      await connection.query(query, values);
      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query('DELETE FROM items WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  static async findByUserId(user_id, itemType = null) {
    let query = `SELECT i.* FROM items i WHERE i.user_id = ?`;
    const params = [user_id];

    if (itemType) {
      query += ` AND i.type = ?`;
      params.push(itemType);
    }

    query += ' ORDER BY i.created_at DESC';

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query, params);
      return rows;
    } finally {
      connection.release();
    }
  }

  static async findAllByType(itemType) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT i.*, u.first_name, u.last_name
         FROM items i
         JOIN users u ON i.user_id = u.id
         WHERE i.type = ? AND i.is_active = TRUE
         ORDER BY i.created_at DESC`,
        [itemType]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  // @desc  Find found items that match a lost item by category + campus
  static async findMatchingItems(lostItem) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT i.*, u.first_name, u.last_name, u.email as user_email,
                CASE
                  WHEN i.category = ? AND i.campus = ? THEN 'high'
                  WHEN i.category = ? THEN 'medium'
                  ELSE 'low'
                END AS match_strength
         FROM items i
         JOIN users u ON i.user_id = u.id
         WHERE i.type = 'found'
           AND i.status = 'Open'
           AND i.is_active = TRUE
           AND i.id != ?
           AND (i.category = ? OR i.campus = ?)
         ORDER BY match_strength ASC, i.created_at DESC
         LIMIT 10`,
        [
          lostItem.category, lostItem.campus,
          lostItem.category,
          lostItem.id,
          lostItem.category, lostItem.campus
        ]
      );
      return rows;
    } finally {
      connection.release();
    }
  }
}

module.exports = Item;
