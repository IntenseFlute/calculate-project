// backend/repositories/userRepository.js
const Database = require("../database");
const bcrypt = require("bcrypt");

class UserRepository {
  constructor() {
    this.db = Database.getInstance();
  }

  async findByEmail(email) {
    const results = await this.db.query("SELECT * FROM users WHERE email = ?", [email]);
    return results[0];
  }

  async create(email, password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await this.db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );
    return { id: result.insertId, email };
  }
}

module.exports = UserRepository;