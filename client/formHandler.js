// client/modules/formHandler.js
import EventEmitter from './eventEmitter.js';

const FormHandler = (function () {
  const form = document.getElementById("calculation-form");

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

  function validateForm() {
    const inputs = document.querySelectorAll('input[type="number"]:not(:disabled)');
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

    return isValid;
  }

  function getFormData() {
    return {
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
  }

  async function submitForm() {
    if (!validateForm()) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const formData = getFormData();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tính toán...';

    try {
      const response = await fetch("http://localhost:3000/submit-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.error) throw new Error(result.error);

      EventEmitter.emit("resultsReceived", result.results);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "SUBMIT";
    }
  }

  function init() {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await submitForm();
      } catch (error) {
        console.error("Error:", error);
        alert("Có lỗi xảy ra: " + error.message);
      }
    });

    document.getElementById("efficiency-x").addEventListener("blur", function () {
      validateInput(this);
    });
    document.getElementById("efficiency-br").addEventListener("blur", function () {
      validateInput(this);
    });
    document.getElementById("efficiency-oi").addEventListener("blur", function () {
      validateInput(this);
    });
  }

  return { init };
})();

export default FormHandler;