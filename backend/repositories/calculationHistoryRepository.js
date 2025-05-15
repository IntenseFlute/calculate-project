// backend/repositories/calculationHistoryRepository.js
const Database = require("../database");

class CalculationHistoryRepository {
  constructor() {
    this.db = Database.getInstance();
  }

  async save(inputParams, motorInfo, calculationResults, motorType) {
    const result = await this.db.query(
      "INSERT INTO calculation_history (input_params, motor_info, calculation_results, motor_type, calculation_date) VALUES (?, ?, ?, ?, NOW())",
      [
        JSON.stringify(inputParams),
        JSON.stringify(motorInfo),
        JSON.stringify(calculationResults),
        motorType || "Unknown",
      ]
    );
    return { id: result.insertId };
  }

  async findAll({ date, type, page = 1, limit = 10 }) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = `
      SELECT id, calculation_date, input_params, motor_info, calculation_results, motor_type
      FROM calculation_history
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      query += ` AND DATE(calculation_date) = ?`;
      params.push(date);
    }
    if (type && type !== "all") {
      query += ` AND motor_type = ?`;
      params.push(type);
    }
    query += ` ORDER BY calculation_date DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const countResults = await this.db.query(
      `SELECT COUNT(*) as total FROM calculation_history WHERE 1=1` +
        (date ? ` AND DATE(calculation_date) = ?` : "") +
        (type && type !== "all" ? ` AND motor_type = ?` : ""),
      [...(date ? [date] : []), ...(type && type !== "all" ? [type] : [])]
    );

    const results = await this.db.query(query, params);
    return { data: results, total: countResults[0].total };
  }

  async findById(id) {
    const results = await this.db.query(
      "SELECT id, calculation_date, input_params, motor_info, calculation_results, motor_type FROM calculation_history WHERE id = ?",
      [id]
    );
    return results[0];
  }

  async deleteById(id) {
    await this.db.query("DELETE FROM calculation_history WHERE id = ?", [id]);
    await this.db.query("UPDATE calculation_history SET id = id - 1 WHERE id > ?", [id]);
    const maxIdResult = await this.db.query("SELECT MAX(id) as maxId FROM calculation_history");
    const maxId = maxIdResult[0].maxId || 0;
    await this.db.query("ALTER TABLE calculation_history AUTO_INCREMENT = ?", [maxId + 1]);
  }
}

module.exports = CalculationHistoryRepository;