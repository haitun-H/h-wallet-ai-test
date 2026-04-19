const db = require('../database/database');

const verificationCodeRepository = {
  async create(codeData) {
    const { email, code, expiresAt } = codeData;
    const result = await db.query(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [email, code, expiresAt]
    );
    return result.rows[0];
  },

  async findValidCode(email, code) {
    const now = new Date();
    const result = await db.query(
      `SELECT * FROM verification_codes 
       WHERE email = $1 AND code = $2 AND expires_at > $3 AND used = false
       ORDER BY created_at DESC LIMIT 1`,
      [email, code, now]
    );
    return result.rows[0];
  },

  async markAsUsed(id) {
    await db.query('UPDATE verification_codes SET used = true WHERE id = $1', [id]);
  },

  async getRecentCodeCount(email, seconds) {
    const timeAgo = new Date(Date.now() - seconds * 1000);
    const result = await db.query(
      'SELECT COUNT(*) FROM verification_codes WHERE email = $1 AND created_at > $2',
      [email, timeAgo]
    );
    return parseInt(result.rows[0].count, 10);
  },
};

module.exports = verificationCodeRepository;