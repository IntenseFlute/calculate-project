// backend/database.js
const mysql = require("mysql2");
require("dotenv").config();

class Database {
  static #instance = null;

  constructor() {
    if (Database.#instance) {
      return Database.#instance;
    }

    this.connection = mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "your_database_name",
    });

    this.connection.connect((err) => {
      if (err) {
        console.error("❌ Lỗi kết nối MySQL:", err);
        throw err;
      }
      console.log("✅ Kết nối MySQL thành công!");
    });

    Database.#instance = this;
  }

  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }

  query(sql, params) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
}

module.exports = Database;