const pool = require('../config/database');

class Rating {
  // Submit or update a rating for a completed claim
  static async create({ claim_id, rater_id, rated_user_id, rating, review }) {
    const connection = await pool.getConnection();
    try {
      await connection.query(
        `INSERT INTO ratings (claim_id, rater_id, rated_user_id, rating, review)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE rating = VALUES(rating), review = VALUES(review)`,
        [claim_id, rater_id, rated_user_id, rating, review || null]
      );
      return this.findByClaim(claim_id, rater_id);
    } finally {
      connection.release();
    }
  }

  // Get a specific rating
  static async findByClaim(claim_id, rater_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT r.*,
                rater.first_name AS rater_first, rater.last_name AS rater_last,
                rated.first_name AS rated_first, rated.last_name AS rated_last
         FROM ratings r
         JOIN users rater ON r.rater_id = rater.id
         JOIN users rated ON r.rated_user_id = rated.id
         WHERE r.claim_id = ? AND r.rater_id = ?`,
        [claim_id, rater_id]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  // Get all ratings received by a user (their reputation)
  static async getReceivedByUser(user_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT r.*,
                rater.first_name AS rater_first, rater.last_name AS rater_last,
                AVG(r.rating) OVER () AS average_rating,
                COUNT(*) OVER () AS total_ratings
         FROM ratings r
         JOIN users rater ON r.rater_id = rater.id
         WHERE r.rated_user_id = ?
         ORDER BY r.created_at DESC`,
        [user_id]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get average rating for a user
  static async getAverageForUser(user_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT ROUND(AVG(rating), 1) AS average, COUNT(*) AS total
         FROM ratings
         WHERE rated_user_id = ?`,
        [user_id]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }

  // Get all ratings for a specific claim
  static async findByClaimId(claim_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT r.*,
                rater.first_name AS rater_first, rater.last_name AS rater_last
         FROM ratings r
         JOIN users rater ON r.rater_id = rater.id
         WHERE r.claim_id = ?`,
        [claim_id]
      );
      return rows;
    } finally {
      connection.release();
    }
  }
}

module.exports = Rating;
