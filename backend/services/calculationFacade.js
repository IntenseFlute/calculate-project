// backend/services/calculationFacade.js
const MotorRepository = require("../repositories/motorRepository");

class CalculationFacade {
  constructor() {
    this.motorRepository = new MotorRepository();
  }

  /**
   * Validates input data to ensure all required fields are present and are valid numbers.
   * @param {Object} data - Input data object
   * @returns {Object} - Validated data with parsed numbers
   * @throws {Error} - If validation fails
   */
  #validateInput(data, requiredFields) {
    const validatedData = {};
    for (const field of requiredFields) {
      if (!data[field] || isNaN(parseFloat(data[field]))) {
        throw new Error(`Trường ${field} là bắt buộc và phải là số hợp lệ`);
      }
      validatedData[field] = parseFloat(data[field]);
    }
    return validatedData;
  }

  /**
   * Calculates initial motor parameters and retrieves matching motors from the database.
   * @param {Object} data - Input data from the form
   * @returns {Promise<Array>} - List of matching motors
   */
  async calculateInitial(data) {
    try {
      // Required fields for calculation
      const requiredFields = [
        "force", "velocity", "diameter", "T1", "t1", "T2", "t2",
        "efficiencyX", "efficiencyBr", "efficiencyOi", "transmissionX", "transmissionH"
      ];
      const validatedData = this.#validateInput(data, requiredFields);

      // Optional field with default value
      const efficiencyKn = parseFloat(data.efficiencyKn) || 1;

      const {
        force: F, velocity: v, diameter: D, T1: T_1, t1: t_1, T2: T_2, t2: t_2,
        efficiencyX: n_x, efficiencyBr: n_br, efficiencyOi: n_oi,
        transmissionX: u_x, transmissionH: u_h
      } = validatedData;

      // Perform calculations
      const P_lv = (F * v) / 1000; // Công suất lý thuyết (kW)
      if (t_1 + t_2 === 0) throw new Error("Tổng thời gian (t1 + t2) không được bằng 0");
      const P_td = (P_lv * (t_1 * T_1 ** 2 + t_2 * T_2 ** 2)) / (t_1 + t_2); // Công suất tương đương
      const n = n_x * n_br ** 2 * n_oi ** 4 * efficiencyKn; // Hiệu suất tổng
      if (n === 0) throw new Error("Hiệu suất tổng không được bằng 0");
      const P_ct = P_td / n; // Công suất công tác
      const n_lv = (60000 * v) / (3.14 * D); // Số vòng quay lý thuyết
      const u_sb = u_x * u_h; // Tỷ số truyền sơ bộ
      const n_sb = n_lv * u_sb; // Số vòng quay sơ bộ

      // Retrieve matching motors from database
      const motors = await this.motorRepository.findMotorsByParams(P_ct, n_sb, T_2, T_1);
      return motors;
    } catch (error) {
      console.error("Lỗi trong calculateInitial:", error);
      throw new Error(`Lỗi tính toán ban đầu: ${error.message}`);
    }
  }

  /**
   * Performs detailed calculations with selected motor data.
   * @param {Object} motorData - Selected motor data
   * @param {Object} originalData - Original form data
   * @returns {Promise<Object>} - Calculation results
   */
  async calculateWithMotor(motorData, originalData) {
    try {
      // Validate motor data
      const motorRequiredFields = ["power", "rpm", "transmissionRatio", "weight"];
      const validatedMotorData = this.#validateInput(motorData, motorRequiredFields);

      // Validate original data
      const originalRequiredFields = [
        "force", "velocity", "diameter", "T1", "t1", "T2", "t2",
        "efficiencyX", "efficiencyBr", "efficiencyOi", "transmissionX", "transmissionH"
      ];
      const validatedOriginalData = this.#validateInput(originalData, originalRequiredFields);

      // Optional field with default value
      const efficiencyKn = parseFloat(originalData.efficiencyKn) || 1;

      const {
        force: F, velocity: v, diameter: D, T1: T_1, t1: t_1, T2: T_2, t2: t_2,
        efficiencyX: n_x, efficiencyBr: n_br, efficiencyOi: n_oi,
        transmissionX: u_x, transmissionH: u_h
      } = validatedOriginalData;

      const { power: P_dc, rpm: n_dc, transmissionRatio: TK_TDn, weight: m_dc } = validatedMotorData;

      // Perform calculations
      const P_lv = (F * v) / 1000; // Công suất lý thuyết
      if (t_1 + t_2 === 0) throw new Error("Tổng thời gian (t1 + t2) không được bằng 0");
      const P_td = (P_lv * (t_1 * T_1 ** 2 + t_2 * T_2 ** 2)) / (t_1 + t_2); // Công suất tương đương
      const n = n_x * n_br ** 2 * n_oi ** 4 * efficiencyKn; // Hiệu suất tổng
      if (n === 0) throw new Error("Hiệu suất tổng không được bằng 0");
      const P_ct = P_td / n; // Công suất công tác
      const n_lv = (60000 * v) / (3.14 * D); // Số vòng quay lý thuyết
      const u_sb = u_x * u_h; // Tỷ số truyền sơ bộ
      const n_sb = n_lv * u_sb; // Số vòng quay sơ bộ
      if (n_lv === 0) throw new Error("Số vòng quay lý thuyết không được bằng 0");
      const u_t = n_dc / n_lv; // Tỷ số truyền tổng
      const u_hop = u_t / u_x; // Tỷ số hộp số
      const rounded_u_hop = Math.round(u_hop);

      // Retrieve transmission data
      const uComparison = await this.motorRepository.findUH(rounded_u_hop);
      if (!uComparison.data) {
        throw new Error("Không tìm thấy dữ liệu truyền động phù hợp");
      }

      const u_xm = u_t / (uComparison.data.u_1 * uComparison.data.u_2); // Tỷ số truyền xích
      const P_3 = P_lv / (n_oi * n_x); // Công suất trục 3
      const P_2 = P_3 / (n_oi * n_br); // Công suất trục 2
      const P_1 = P_2 / (n_oi * n_br); // Công suất trục 1
      const P_dc1 = P_1 / (n_oi * efficiencyKn); // Công suất động cơ
      const n_1 = n_dc; // Số vòng quay trục 1
      const n_2 = n_1 / uComparison.data.u_1; // Số vòng quay trục 2
      const n_3 = n_2 / uComparison.data.u_2; // Số vòng quay trục 3
      const n_ct = n_3 / u_x; // Số vòng quay công tác
      if (n_ct === 0) throw new Error("Số vòng quay công tác không được bằng 0");
      const T_ct = 9.55 * 10 ** 6 * (P_ct / n_ct); // Mô-men công tác
      const T3 = 9.55 * 10 ** 6 * (P_3 / n_3); // Mô-men trục 3
      const T2 = 9.55 * 10 ** 6 * (P_2 / n_2); // Mô-men trục 2
      const T1 = 9.55 * 10 ** 6 * (P_1 / n_1); // Mô-men trục 1
      const T_dc = 9.55 * 10 ** 6 * (P_dc / n_dc); // Mô-men động cơ

      // Additional parameters (hard-coded as per original)
      const z_1 = 23;
      const z_2 = 59;
      const k = 1.95;
      const k_z = 25 / z_1;
      const k_n = 50 / n_3;
      const P_t = P_3 * k * k_z * k_n;
      const p = 38.1;
      const d_c = 11.12;
      const B = 35.46;
      const Pt = 10.5 * 10 ** 3;
      const a = 40 * p;
      const d_1 = 279.8042;
      const d_2 = 715.867;
      const F_rx = 6927.7579;
      const x_c = 120;
      const aw1 = 160;
      const m1 = 2;
      const bw1 = 50.4;
      const B1 = 17.0107;
      const z1 = 23;
      const z2 = 130;
      const d1 = 48.1037;
      const d2 = 271.8965;
      const da1 = 52.1037;
      const da2 = 275.8965;
      const df1 = 43.1037;
      const df2 = 266.8965;
      const dw1 = 48.1037;
      const dw2 = 271.8965;
      const aw2 = 200;
      const m2 = 2;
      const bw2 = 63;
      const um2 = 3.17;
      const B2 = 11.478;
      const z3 = 47;
      const z4 = 149;
      const d3 = 95.9233;
      const d4 = 304.0769;
      const da3 = 99.9233;
      const da4 = 308.0769;
      const df3 = 90.9233;
      const df4 = 299.0769;
      const dw3 = 95.9233;
      const dw4 = 304.0769;

      return {
        motorInfo: motorData,
        systemParams: {
          P_lv: P_lv.toFixed(2),
          P_1: P_1.toFixed(2),
          P_2: P_2.toFixed(2),
          P_3: P_3.toFixed(2),
          P_td: P_td.toFixed(2),
          n: n.toFixed(2),
          P_ct: P_ct.toFixed(2),
          n_lv: n_lv.toFixed(2),
          u_sb: u_sb.toFixed(2),
          n_sb: n_sb.toFixed(2),
          u_t: u_t.toFixed(2),
          u_hop: u_hop.toFixed(2),
          rounded_u_hop,
          u_h_matched: uComparison.data.u_h.toFixed(2),
          u_1: uComparison.data.u_1.toFixed(2),
          u_2: uComparison.data.u_2.toFixed(2),
          u_xm: u_xm.toFixed(2),
          matchType: uComparison.matchType,
          P_dc1: P_dc1.toFixed(2),
          n_1: n_1.toFixed(2),
          n_dc: n_dc.toFixed(2),
          n_2: n_2.toFixed(2),
          n_3: n_3.toFixed(2),
          n_ct: n_ct.toFixed(2),
          T_dc: T_dc.toFixed(2),
          T1: T1.toFixed(2),
          T2: T2.toFixed(2),
          T3: T3.toFixed(2),
          T_ct: T_ct.toFixed(2),
          z_1, z_2, p, B, d_c, x_c, d_1, d_2, F_rx,
          aw1, m1, bw1, B1, z1, z2, d1, d2, da1, da2, df1, df2, dw1, dw2,
          aw2, m2, bw2, um2, B2, z3, z4, d3, d4, da3, da4, df3, df4, dw3, dw4,
        },
      };
    } catch (error) {
      console.error("Lỗi trong calculateWithMotor:", error);
      throw new Error(`Lỗi tính toán với động cơ: ${error.message}`);
    }
  }
}

module.exports = CalculationFacade;