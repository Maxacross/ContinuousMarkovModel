// fileIO.js — збереження / завантаження моделі
// з надійним керуванням розміром таблиці
(function () {
  "use strict";

  /* =========================================================
     ДОПОМІЖНІ ФУНКЦІЇ ЗЧИТУВАННЯ / ЗАПИСУ ТАБЛИЦЬ
  ========================================================= */

  /**
   * Зчитує матрицю з HTML-таблиці
   * @param {string} tableId id таблиці
   * @returns {Array|null} двовимірний масив чисел
   */
  function getMatrixFromTable(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return null;

    const rows = Array.from(table.querySelectorAll("tr"));
    if (rows.length === 0) return [];

    const matrix = [];

    // Пропускаємо заголовок (i = 1)
    for (let i = 1; i < rows.length; i++) {
      const inputs = rows[i].querySelectorAll("input");

      // Якщо input-ів немає — шукаємо їх у td
      if (!inputs || inputs.length === 0) {
        const tds = rows[i].querySelectorAll("td");
        const vals = [];
        tds.forEach(td => {
          const inp = td.querySelector("input");
          if (inp) vals.push(inp.value === "" ? NaN : Number(inp.value));
        });
        matrix.push(vals);
      } else {
        // Стандартний випадок
        const rowVals = Array.from(inputs).map(inp =>
          inp.value === "" ? NaN : Number(inp.value)
        );
        matrix.push(rowVals);
      }
    }
    return matrix;
  }

  /**
   * Зчитує вектор початкових імовірностей
   * @param {string} vectorTableId id таблиці
   * @returns {Array|null}
   */
  function getInitialVector(vectorTableId) {
    const table = document.getElementById(vectorTableId);
    if (!table) return null;

    const inputs = table.querySelectorAll("input");

    // Якщо input-ів немає — читаємо з td
    if (inputs.length === 0) {
      const tds = table.querySelectorAll("td");
      const vals = [];
      tds.forEach(td => {
        const inp = td.querySelector("input");
        if (inp) vals.push(inp.value === "" ? NaN : Number(inp.value));
      });
      return vals;
    }

    return Array.from(inputs).map(inp =>
      inp.value === "" ? NaN : Number(inp.value)
    );
  }

  /* =========================================================
     ПОБУДОВА DOM-СТРУКТУР ТАБЛИЦЬ
  ========================================================= */

  /**
   * Створює DOM-таблицю для матриці інтенсивностей
   */
  function buildMatrixTableDOM(tableId, size) {
    const table = document.getElementById(tableId);
    if (!table) return;

    table.innerHTML = "";

    // Заголовок
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    const firstTh = document.createElement("th");
    firstTh.textContent = "";
    headerRow.appendChild(firstTh);

    for (let j = 0; j < size; j++) {
      const th = document.createElement("th");
      th.textContent = `s${j + 1}`;
      headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Тіло таблиці
    const tbody = document.createElement("tbody");
    for (let i = 0; i < size; i++) {
      const row = document.createElement("tr");

      const labelTd = document.createElement("td");
      labelTd.textContent = `s${i + 1}`;
      row.appendChild(labelTd);

      for (let j = 0; j < size; j++) {
        const td = document.createElement("td");
        const inp = document.createElement("input");
        inp.type = "number";
        inp.step = "any";
        inp.value = "0";
        inp.className = "matrix-input";
        inp.setAttribute("data-row", i);
        inp.setAttribute("data-col", j);
        td.appendChild(inp);
        row.appendChild(td);
      }
      tbody.appendChild(row);
    }
    table.appendChild(tbody);
  }

  /**
   * Створює таблицю для початкового вектора
   */
  function buildInitialVectorDOM(tableId, size) {
    const table = document.getElementById(tableId);
    if (!table) return;

    table.innerHTML = "";
    const tbody = document.createElement("tbody");

    for (let i = 0; i < size; i++) {
      const row = document.createElement("tr");

      const tdLabel = document.createElement("td");
      tdLabel.textContent = `s${i + 1}`;

      const tdInput = document.createElement("td");
      const inp = document.createElement("input");
      inp.type = "number";
      inp.step = "any";
      inp.value = "0";
      inp.className = "initial-input";

      tdInput.appendChild(inp);
      row.appendChild(tdLabel);
      row.appendChild(tdInput);
      tbody.appendChild(row);
    }
    table.appendChild(tbody);
  }

  /**
   * Записує матрицю у таблицю
   */
  function setMatrixToTable(tableId, matrix) {
    const size = matrix.length;

    if (typeof createTable === "function") {
      try { createTable(size); } catch (e) {}
    } else {
      buildMatrixTableDOM(tableId, size);
    }

    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = table.querySelectorAll("tr");
    for (let i = 1; i < rows.length && i - 1 < matrix.length; i++) {
      const inputs = rows[i].querySelectorAll("input");
      for (let j = 0; j < inputs.length && j < matrix[i - 1].length; j++) {
        inputs[j].value = matrix[i - 1][j];
      }
    }
  }

  /**
   * Записує початковий вектор у таблицю
   */
  function setInitialVector(vectorTableId, vector) {
    const size = vector.length;

    if (typeof createInitialVector === "function") {
      try { createInitialVector(size); } catch (e) {}
    } else {
      buildInitialVectorDOM(vectorTableId, size);
    }

    const table = document.getElementById(vectorTableId);
    if (!table) return;

    const inputs = table.querySelectorAll("input");
    for (let i = 0; i < inputs.length && i < vector.length; i++) {
      inputs[i].value = vector[i];
    }
  }

  /* =========================================================
     ДОПОМІЖНІ УТИЛІТИ
  ========================================================= */

  function getStepsElement() {
    return document.getElementById("steps") ||
           document.getElementById("stepsCount");
  }

  function getStepsValue() {
    const el = getStepsElement();
    return el ? Number(el.value) : null;
  }

  function setStepsValue(v) {
    const el = getStepsElement();
    if (el) {
      el.value = v;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  /**
   * Оновлює елемент керування розміром таблиці
   */
  function setTableSizeControl(size) {
    if (!Number.isFinite(size)) return;

    const possibleIds = [
      "size", "matrixSize", "tableSize", "n", "nInput",
      "matrix-size", "table-size", "sizeInput",
      "tableSizeInput", "matrix_size", "N"
    ];

    for (const id of possibleIds) {
      const el = document.getElementById(id);
      if (!el) continue;

      if ("value" in el) {
        try {
          el.value = size;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        } catch (e) {}
      } else {
        el.textContent = String(size);
      }
      return;
    }

    const displaySpan =
      document.getElementById("tableSizeDisplay") ||
      document.getElementById("matrixSizeDisplay");

    if (displaySpan) displaySpan.textContent = String(size);
  }

  /* =========================================================
     ЗБЕРЕЖЕННЯ / ЗАВАНТАЖЕННЯ МОДЕЛІ
  ========================================================= */

  /**
   * Зберігає модель у JSON-файл
   */
  function saveModelToFile() {
    const matrix = getMatrixFromTable("fsmTable");
    const initialVector = getInitialVector("initialVectorTable");

    if (!matrix || !initialVector) {
      notify({
        message: "Не вдалося зчитати таблицю або вектор.",
        type: "error"
      });
      return;
    }

    const timeEndEl = document.getElementById("timeEnd");
    const precisionEl = document.getElementById("precisionSlider");

    const payload = {
      version: 1,
      size: matrix.length,
      matrix,
      initialVector,
      timeEnd: timeEndEl ? Number(timeEndEl.value) : null,
      steps: getStepsValue(),
      precision: precisionEl ? Number(precisionEl.value) : null,
      meta: { savedAt: new Date().toISOString() }
    };

    const text = JSON.stringify(payload, null, 2);
    const blob = new Blob([text], {
      type: "application/json;charset=utf-8"
    });

    const filename =
      `ctmc_model_${payload.size}x${payload.size}_` +
      `${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
  }

  /**
   * Обробляє текст JSON-файлу
   */
  function handleLoadFileContent(text) {
    let data;

    try {
      data = JSON.parse(text);
    } catch (err) {
      notify({ message: "Файл не є коректним JSON.", type: "error" });
      return;
    }

    if (!data.matrix || !data.initialVector) {
      notify({
        message: "Файл не містить обовʼязкових полів.",
        type: "error"
      });
      return;
    }

    const size =
      data.size || data.matrix.length || data.initialVector.length;

    if (!size || size <= 0) {
      notify({ message: "Некоректний розмір моделі.", type: "error" });
      return;
    }

    // Обрізання / доповнення нулями
    const trimmedMatrix = data.matrix.slice(0, size).map(row => {
      const r = Array.from(row || []);
      while (r.length < size) r.push(0);
      return r.slice(0, size);
    });

    const trimmedVector = Array.from(data.initialVector || []);
    while (trimmedVector.length < size) trimmedVector.push(0);

    setTableSizeControl(size);
    setMatrixToTable("fsmTable", trimmedMatrix);
    setInitialVector("initialVectorTable", trimmedVector.slice(0, size));

    if (data.timeEnd !== undefined && document.getElementById("timeEnd")) {
      const el = document.getElementById("timeEnd");
      el.value = data.timeEnd;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }

    if (data.steps !== undefined) setStepsValue(data.steps);

    if (
      data.precision !== undefined &&
      document.getElementById("precisionSlider")
    ) {
      const pEl = document.getElementById("precisionSlider");
      pEl.value = data.precision;
      const span = document.getElementById("precisionValue");
      if (span) span.textContent = data.precision;
      pEl.dispatchEvent(new Event("input", { bubbles: true }));
      pEl.dispatchEvent(new Event("change", { bubbles: true }));
    }

    if (typeof rerenderCTMC === "function") rerenderCTMC();
    else if (typeof calculateValues === "function") calculateValues();
  }

  /**
   * Завантажує модель з файлу
   */
  function loadModelFromFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => handleLoadFileContent(e.target.result);
    reader.onerror = () =>
      notify({ message: "Помилка читання файлу.", type: "error" });

    reader.readAsText(file, "utf-8");
  }

  /* =========================================================
     ПРИВʼЯЗКА ДО UI
  ========================================================= */

  function attachUI() {
    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn)
      saveBtn.addEventListener("click", e => {
        e.preventDefault();
        saveModelToFile();
      });

    const fileInput = document.getElementById("loadFileInput");
    if (fileInput)
      fileInput.addEventListener("change", e => {
        const f = e.target.files && e.target.files[0];
        if (f) loadModelFromFile(f);
        fileInput.value = "";
      });
  }

  // Експорт у глобальну область
  window.saveModelToFile = saveModelToFile;
  window.loadModelFromFile = loadModelFromFile;
  window.handleLoadFileContent = handleLoadFileContent;

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", attachUI);
  else attachUI();

})();
