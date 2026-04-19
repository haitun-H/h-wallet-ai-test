const db = require('../database/database');

const userRepository = {
  async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async create(userData) {
    const { email, walletAddress } = userData;
    const result = await db.query(
      'INSERT INTO users (email, wallet_address) VALUES ($1, $2) RETURNING *',
      [email, walletAddress]
    );
    return result.rows[0];
  },

  async isEmailRegistered(email) {
    const user = await this.findByEmail(email);
    return !!user;
  },
};

module.exports = userRepository;