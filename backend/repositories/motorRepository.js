// backend/repositories/motorRepository.js
const Database = require("../database");

class MotorRepository {
  constructor() {
    this.db = Database.getInstance();
  }

  async findMotorsByParams(P_ct, n_sb, T_2, T_1) {
    const query = `
      SELECT * FROM dong_co
      WHERE Cong_suat >= ?
      AND So_vong_quay >= ?
      AND TK_TD >= ? / ?;
    `;
    return await this.db.query(query, [P_ct, n_sb, T_2, T_1]);
  }

  async findMotorByCode(motorCode) {
    const results = await this.db.query(
      "SELECT * FROM dong_co WHERE Ki_hieu = ? LIMIT 1",
      [motorCode.trim()]
    );
    return results[0];
  }

  async findUH(u_hop) {
    const rounded_u_hop = Math.round(u_hop);
    let results = await this.db.query(
      "SELECT * FROM TST WHERE u_h = ? ORDER BY ABS(u_h - ?) LIMIT 1",
      [rounded_u_hop, rounded_u_hop]
    );

    if (results.length === 0) {
      results = await this.db.query(
        "SELECT * FROM TST ORDER BY ABS(u_h - ?) LIMIT 1",
        [rounded_u_hop]
      );
      return { matchType: "nearest", data: results[0], originalValue: u_hop, roundedValue: rounded_u_hop };
    }
    return { matchType: "exact", data: results[0], originalValue: u_hop, roundedValue: rounded_u_hop };
  }
}

module.exports = MotorRepository;