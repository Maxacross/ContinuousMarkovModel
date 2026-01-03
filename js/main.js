/* =========================================================
   ГОЛОВНА ФУНКЦІЯ ПРОГРАМИ
========================================================= */

/**
 * Основна функція обчислення значень для марковської моделі
 */
function calculateValues() {

    const modelWorkspace = document.getElementById('modelWorkspace');
    if (!modelWorkspace) return;

    // тимчасово ховаємо результати
    modelWorkspace.style.display = "none";

    // ===== Перевірка розміру матриці =====
    if (!checkMatrixSizeInput()) return;

    // ===== Перевірка кількості кроків =====
    if (!validateSteps()) return;

    // ===== Перевірка кінцевого часу =====
    if (!validateTimeEnd()) return;

    // якщо всі перевірки пройдені — показуємо блок
    modelWorkspace.style.display = "block";

    // Приховуємо заголовок матриці до рендерингу
    const title = document.getElementById("matrixTitle");
    if (title) title.style.display = "none";

    // ===== Отримання даних =====
    const matrix = getTableValues();
    const vector = getInitialVectorValues();
    const endTime = Number(document.getElementById("timeEnd").value);
    const steps = Number(document.getElementById("steps").value);

    // ===== Перевірка матриці =====
    const check = validateTableValues(matrix);
    if (!check.valid) {
        // тимчасово ховаємо результати і виводимо помилку
        modelWorkspace.style.display = "none";
        notify({ message: check.message, type: "error" });
        return;
    }

    // якщо всі перевірки пройдені — показуємо блок
     modelWorkspace.style.display = "block";

    // ===== Перевірка вектора =====
    const checkVector = validateInitialVector(vector);
    if (!checkVector.valid) {
        // тимчасово ховаємо результати і виводимо помилку
        modelWorkspace.style.display = "none";
        notify({ message: checkVector.message, type: "error" });
        return;
    }

    // якщо всі перевірки пройдені — показуємо блок
     modelWorkspace.style.display = "block";

    // ===== Побудова графа =====
    const dot = buildDotGraph(matrix);
    lastDotGraph = dot;
    renderGraph(dot);

    // ===== Аналітика =====
    renderIntensityMatrix(matrix);
    renderSystemLinearKolmogorova(matrix);
    solveAndRenderKolmogorov(matrix);

    // ===== Графік =====
    showChart();
    renderCTMCExact(vector, matrix, endTime, steps);
}

/**
 * Показує графік динаміки ймовірностей станів
 */
function showChart() {
    const title = document.getElementById("chartTitle");
    const canvas = document.getElementById("ctmcChart");

    if (title) title.style.display = "block";
    if (canvas) canvas.style.display = "block";
}

/* =========================================================
   ІНІЦІАЛІЗАЦІЯ ПРИ ЗАВАНТАЖЕННІ СТОРІНКИ
========================================================= */

// Створюємо таблицю інтенсивностей за замовчуванням (2x2)
createTable(2);

// Створюємо вектор початкових ймовірностей за замовчуванням
createInitialVector(2);
