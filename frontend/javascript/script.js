document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("calculation-form");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const inputs = document.querySelectorAll(
      'input[type="number"]:not(:disabled)'
    );
    let isValid = true;

    inputs.forEach((input) => {
      if (!input.value.trim()) {
        isValid = false;
        input.style.borderColor = "red";
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains("error-message")) {
          errorElement.textContent = "Vui lòng nhập giá trị này";
        }
      } else {
        input.style.borderColor = "#ddd";
      }
    });

    if (!isValid) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const formData = {
      force: document.getElementById("force").value,
      velocity: document.getElementById("velocity").value,
      diameter: document.getElementById("diameter").value,
      rotation: document.getElementById("rotation").value,
      T1: document.getElementById("load1").value,
      t1: document.getElementById("time1").value,
      T2: document.getElementById("load2").value,
      t2: document.getElementById("time2").value,
      serviceLife: document.getElementById("service-life").value,
      workDays: document.getElementById("work-days").value,
      shifts: document.getElementById("shifts").value,
      hoursPerShift: document.getElementById("hours-per-shift").value,
      efficiencyX: document.getElementById("efficiency-x").value,
      efficiencyBr: document.getElementById("efficiency-br").value,
      efficiencyOi: document.getElementById("efficiency-oi").value,
      efficiencyKn: document.getElementById("efficiency-kn").value,
      transmissionX: document.getElementById("transmission-x").value,
      transmissionH: document.getElementById("transmission-h").value,
    };

    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Đang tính toán...';

      const response = await fetch("http://localhost:3000/submit-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      displayResults(result.results);
    } catch (error) {
      console.error("Error:", error);
      alert("Có lỗi xảy ra: " + error.message);
    } finally {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = "SUBMIT";
    }
  });

  function validateInput(input) {
    const min = parseFloat(input.getAttribute("min"));
    const max = parseFloat(input.getAttribute("max"));
    const value = parseFloat(input.value);

    if (isNaN(value) || value < min || value > max) {
      input.style.borderColor = "red";
      const errorElement = input.nextElementSibling;
      if (errorElement && errorElement.classList.contains("error-message")) {
        errorElement.textContent = `Giá trị phải từ ${min} đến ${max}`;
      }
      return false;
    } else {
      input.style.borderColor = "#ddd";
      const errorElement = input.nextElementSibling;
      if (errorElement && errorElement.classList.contains("error-message")) {
        errorElement.textContent = "";
      }
      return true;
    }
  }

  document.getElementById("efficiency-x").addEventListener("blur", function () {
    validateInput(this);
  });

  document
    .getElementById("efficiency-br")
    .addEventListener("blur", function () {
      validateInput(this);
    });

  document
    .getElementById("efficiency-oi")
    .addEventListener("blur", function () {
      validateInput(this);
    });
});

function displayResults(motors) {
  const modal = document.createElement("div");
  modal.className = "result-modal";

  modal.innerHTML = `
      <div class="modal-content">
          <span class="close-btn">×</span>
          <h2>KẾT QUẢ TÌM KIẾM ĐỘNG CƠ PHÙ HỢP</h2>
          
          <div class="motor-grid">
              ${
                motors.length > 0
                  ? motors
                      .map(
                        (motor) => `
                      <div class="motor-card">
                          <div class="card-header">
                            <h3>${motor.Ki_hieu || "Không có mã hiệu"}</h3>
                            <span class="motor-type">${motor.type || ""}</span>
                          </div>
                          <div class="spec-row">
                            <span class="spec-label">Công suất:</span>
                            <span class="spec-value">${
                              motor.Cong_suat
                            } kW</span>
                          </div>
                          <div class="spec-row">
                              <span class="spec-label">Số vòng quay:</span>
                              <span class="spec-value">${
                                motor.So_vong_quay
                              } vòng/phút</span>
                          </div>
                          <div class="spec-row">
                              <span class="spec-label">Hệ số công suất:</span>
                              <span class="spec-value">${motor.cos_phi}</span>
                          </div>
                          <div class="spec-row">
                              <span class="spec-label">Tỉ số truyền:</span>
                              <span class="spec-value">${motor.TK_TD}</span>
                          </div>
                          <div class="spec-row">
                              <span class="spec-label">Khối lượng:</span>
                              <span class="spec-value">${
                                motor.Khoi_Luong
                              } kg</span>
                          </div>
                          <button class="select-btn" data-id="${motor.Ki_hieu}">
                              Chọn động cơ này
                          </button>
                      </div>
                  `
                      )
                      .join("")
                  : '<p class="no-results">Không tìm thấy động cơ phù hợp với thông số đã nhập</p>'
              }
          </div>
      </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".close-btn").addEventListener("click", function () {
    document.body.removeChild(modal);
  });

  modal.querySelectorAll(".select-btn").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const motorCode = this.getAttribute("data-id");

      try {
        const motorResponse = await fetch(
          "http://localhost:3000/get-motor-details",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ motorCode }),
          }
        );

        if (!motorResponse.ok) throw new Error("Lỗi lấy thông tin động cơ");

        const motorData = await motorResponse.json();
        if (!motorData.motor) throw new Error("Không có dữ liệu động cơ");

        const form = document.getElementById("calculation-form");
        const formData = {
          force: form.querySelector("#force").value,
          velocity: form.querySelector("#velocity").value,
          diameter: form.querySelector("#diameter").value,
          rotation: form.querySelector("#rotation").value,
          T1: form.querySelector("#load1").value,
          t1: form.querySelector("#time1").value,
          T2: form.querySelector("#load2").value,
          t2: form.querySelector("#time2").value,
          serviceLife: form.querySelector("#service-life").value,
          workDays: form.querySelector("#work-days").value,
          shifts: form.querySelector("#shifts").value,
          hoursPerShift: form.querySelector("#hours-per-shift").value,
          efficiencyX: form.querySelector("#efficiency-x").value,
          efficiencyBr: form.querySelector("#efficiency-br").value,
          efficiencyOi: form.querySelector("#efficiency-oi").value,
          efficiencyKn: form.querySelector("#efficiency-kn").value,
          transmissionX: form.querySelector("#transmission-x").value,
          transmissionH: form.querySelector("#transmission-h").value,
        };

        const calculationResponse = await fetch(
          "http://localhost:3000/calculate-with-motor",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              motorData: motorData.motor,
              originalData: formData,
            }),
          }
        );

        if (!calculationResponse.ok) throw new Error("Lỗi tính toán hệ thống");

        const calculationResult = await calculationResponse.json();

        if (!calculationResult.success) {
          throw new Error(calculationResult.error || "Lỗi không xác định");
        }

        // Lưu lịch sử tính toán
        const saveResponse = await fetch(
          "http://localhost:3000/save-calculation",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              inputParams: formData,
              motorInfo: motorData.motor,
              calculationResults: calculationResult.results.systemParams,
            }),
          }
        );

        if (!saveResponse.ok) throw new Error("Lỗi lưu lịch sử tính toán");

        const saveResult = await saveResponse.json();
        if (!saveResult.success) throw new Error("Lỗi lưu lịch sử");

        displayMotorAnalysis(calculationResult.results);
        document.body.removeChild(modal);
      } catch (error) {
        console.error("Lỗi:", error);
        alert("Lỗi khi tính toán: " + error.message);
      }
    });
  });
}

function displayMotorAnalysis(results) {
  const modal = document.createElement("div");
  modal.className = "analysis-modal";

  modal.innerHTML = `
    <div class="modal-content">
      <h2 class="modal-title">KẾT QUẢ TÍNH TOÁN</h2>
      
      <div class="motor-info">
        <h3 class="section-title">THÔNG TIN ĐỘNG CƠ</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Mã hiệu:</span>
            <span class="info-value">${results.motorInfo.code || "N/A"}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Công suất:</span>
            <span class="info-value">${
              results.motorInfo.power || "N/A"
            } kW</span>
          </div>
          <div class="info-item">
            <span class="info-label">Tốc độ:</span>
            <span class="info-value">${
              results.motorInfo.rpm || "N/A"
            } vòng/phút</span>
          </div>
          <div class="info-item">
            <span class="info-label">Khối lượng:</span>
            <span class="info-value">${
              results.motorInfo.weight || "N/A"
            } kg</span>
          </div>
        </div>
      </div>
      
      <div class="transmission-table">
        <h3 class="section-title">BẢNG SỐ LIỆU ĐỘNG HỌC VÀ ĐỘNG LỰC HỌC TRÊN CÁC TRỤC</h3>
        <div class="table-container">
          <table class="result-table">
            <thead>
              <tr>
                <th class="parameter-col">Thông số</th>
                <th>Trục động cơ</th>
                <th>Trục 1</th>
                <th>Trục 2</th>
                <th>Trục 3</th>
                <th>Trục công tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="parameter-col">P (kW)</td>
                <td>${results.systemParams.P_dc1 || "N/A"}</td>
                <td>${results.systemParams.P_1 || "N/A"}</td>
                <td>${results.systemParams.P_2 || "N/A"}</td>
                <td>${results.systemParams.P_3 || "N/A"}</td>
                <td>${results.systemParams.P_ct || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">u</td>
                <td>1</td>
                <td>${results.systemParams.u_1 || "N/A"}</td>
                <td>${results.systemParams.u_2 || "N/A"}</td>
                <td>${results.systemParams.u_xm || "N/A"}</td>
                <td>-</td>
              </tr>
              <tr>
                <td class="parameter-col">n (vòng/phút)</td>
                <td>${results.systemParams.n_dc || "N/A"}</td>
                <td>${results.systemParams.n_1 || "N/A"}</td>
                <td>${results.systemParams.n_2 || "N/A"}</td>
                <td>${results.systemParams.n_3 || "N/A"}</td>
                <td>${results.systemParams.n_ct || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">T (N.mm)</td>
                <td>${results.systemParams.T_dc || "N/A"}</td>
                <td>${results.systemParams.T1 || "N/A"}</td>
                <td>${results.systemParams.T2 || "N/A"}</td>
                <td>${results.systemParams.T3 || "N/A"}</td>
                <td>${results.systemParams.T_ct || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="additional-params-table">
        <h3 class="section-title">THÔNG SỐ BỘ TRUYỀN XÍCH</h3>
        <div class="table-container">
          <table class="result-table">
            <thead>
              <tr>
                <th class="parameter-col">Thông số</th>
                <th>Giá trị</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="parameter-col">Số răng z₁</td>
                <td>${results.systemParams.z_1 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Số răng z₂</td>
                <td>${results.systemParams.z_2 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Bước xích p (mm)</td>
                <td>${results.systemParams.p || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Chiều rộng dây xích B (mm)</td>
                <td>${results.systemParams.B || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính chốt d_c (mm)</td>
                <td>${results.systemParams.d_c || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Hệ số xích x_c</td>
                <td>${results.systemParams.x_c || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính bánh xích nhỏ d₁ (mm)</td>
                <td>${results.systemParams.d_1 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính bánh xích lớn d₂ (mm)</td>
                <td>${results.systemParams.d_2 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Lực hướng kính F_rx (N)</td>
                <td>${results.systemParams.F_rx || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="gear-fast-table">
        <h3 class="section-title">THÔNG SỐ BỘ TRUYỀN BÁNH RĂNG CẤP NHANH</h3>
        <div class="table-container">
          <table class="result-table">
            <thead>
              <tr>
                <th class="parameter-col">Thông số</th>
                <th>Giá trị</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="parameter-col">Khoảng cách trục aw₁ (mm)</td>
                <td>${results.systemParams.aw1 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Mô-đun m₁ (mm)</td>
                <td>${results.systemParams.m1 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Chiều rộng bánh răng bw₁ (mm)</td>
                <td>${results.systemParams.bw1 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Hệ số chiều rộng bánh răng B₁</td>
                <td>${results.systemParams.B1 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Số răng z₁</td>
                <td>${results.systemParams.z1 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Số răng z₂</td>
                <td>${results.systemParams.z2 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Hệ số dịch chỉnh x₁</td>
                <td>${"0" || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Hệ số dịch chỉnh x₂</td>
                <td>${"0" || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính vòng chia d₁ (mm)</td>
                <td>${results.systemParams.d1 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính vòng chia d₂ (mm)</td>
                <td>${results.systemParams.d2 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính vòng đỉnh da₁ (mm)</td>
                <td>${results.systemParams.da1 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính vòng đỉnh da₂ (mm)</td>
                <td>${results.systemParams.da2 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính vòng chân df₁ (mm)</td>
                <td>${results.systemParams.df1 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính vòng chân df₂ (mm)</td>
                <td>${results.systemParams.df2 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính ngoài dw₁ (mm)</td>
                <td>${results.systemParams.dw1 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính ngoài dw₂ (mm)</td>
                <td>${results.systemParams.dw2 || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="gear-slow-table">
        <h3 class="section-title">THÔNG SỐ BỘ TRUYỀN BÁNH RĂNG CẤP CHẬM</h3>
        <div class="table-container">
          <table class="result-table">
            <thead>
              <tr>
                <th class="parameter-col">Thông số</th>
                <th>Giá trị</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="parameter-col">Khoảng cách trục aw₂ (mm)</td>
                <td>${results.systemParams.aw2 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Mô-đun m₂ (mm)</td>
                <td>${results.systemParams.m2 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Chiều rộng bánh răng bw₂ (mm)</td>
                <td>${results.systemParams.bw2 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Tỷ số truyền u_m₂</td>
                <td>${results.systemParams.um2 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Hệ số chiều rộng bánh răng B₂</td>
                <td>${results.systemParams.B2 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Số răng z₃</td>
                <td>${results.systemParams.z3 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Số răng z₄</td>
                <td>${results.systemParams.z4 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Hệ số dịch chỉnh x₁</td>
                <td>${"0" || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Hệ số dịch chỉnh x₂</td>
                <td>${"0" || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính vòng chia d₃ (mm)</td>
                <td>${results.systemParams.d3 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính vòng chia d₄ (mm)</td>
                <td>${results.systemParams.d4 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính vòng đỉnh da₃ (mm)</td>
                <td>${results.systemParams.da3 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính vòng đỉnh da₄ (mm)</td>
                <td>${results.systemParams.da4 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính vòng chân df₃ (mm)</td>
                <td>${results.systemParams.df3 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính vòng chân df₄ (mm)</td>
                <td>${results.systemParams.df4 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính ngoài dw₃ (mm)</td>
                <td>${results.systemParams.dw3 || "N/A"}</td>
              </tr>
              <tr>
                <td class="parameter-col">Đường kính ngoài dw₄ (mm)</td>
                <td>${results.systemParams.dw4 || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="print-btn">
          <i class="fas fa-print"></i> In kết quả
        </button>
        <button class="close-btn">
          <i class="fas fa-times"></i> Đóng
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const style = document.createElement("style");
  style.textContent = `
    .analysis-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .modal-content {
      background: white;
      padding: 25px;
      border-radius: 10px;
      width: 85%;
      max-width: 1000px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      position: relative;
    }
    
    .modal-title {
      color: #2c3e50;
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    
    .section-title {
      color: #3498db;
      margin: 20px 0 15px;
      font-size: 18px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .info-item {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .info-label {
      font-weight: 600;
      color: #555;
      display: block;
      margin-bottom: 5px;
    }
    
    .info-value {
      font-size: 16px;
      color: #2c3e50;
    }
    
    .table-container {
      overflow-x: auto;
      margin-bottom: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .result-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    
    .result-table th {
      background-color: #3498db;
      color: white;
      padding: 12px 8px;
      text-align: center;
      font-weight: 500;
    }
    
    .result-table td {
      padding: 10px 8px;
      text-align: center;
      border: 1px solid #e0e0e0;
    }
    
    .parameter-col {
      background-color: #f1f8fe;
      font-weight: 500;
      color: #2c3e50;
    }
    
    .result-table tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    
    .result-table tr:hover {
      background-color: #eef7ff;
    }
    
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    
    .print-btn, .close-btn {
      padding: 10px 20px;
      border-radius: 5px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    
    .print-btn {
      background-color: #3498db;
      color: white;
      border: none;
    }
    
    .print-btn:hover {
      background-color: #2980b9;
      transform: translateY(-2px);
    }
    
    .close-btn {
      background-color: #f8f9fa;
      color: #555;
      border: 1px solid #ddd;
    }
    
    .close-btn:hover {
      background-color: #e9ecef;
      color: #333;
    }
    
    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        padding: 15px;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .result-table {
        font-size: 13px;
      }
    }
    
    @media print {
      body * {
        visibility: hidden;
      }
      .analysis-modal, .analysis-modal * {
        visibility: visible;
      }
      .analysis-modal {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: auto;
        background: white;
      }
      .modal-content {
        max-height: none;
        overflow: visible;
        width: 100%;
        padding: 20px;
        box-shadow: none;
      }
      .close-btn {
        display: none !important;
      }
      .print-btn {
        display: none !important;
      }
      .table-container {
        overflow-x: visible;
      }
      .result-table {
        font-size: 12px;
      }
    }
  `;
  modal.appendChild(style);

  if (!document.querySelector('link[href*="font-awesome"]')) {
    const faLink = document.createElement("link");
    faLink.rel = "stylesheet";
    faLink.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css";
    document.head.appendChild(faLink);
  }

  modal.querySelector(".print-btn").addEventListener("click", () => {
    window.print();
  });

  modal.querySelector(".close-btn").addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}