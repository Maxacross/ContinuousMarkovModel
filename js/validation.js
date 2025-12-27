/* =========================================================
   ВАЛІДАЦІЯ ТА КОНТРОЛЬ ВВОДУ
========================================================= */

// Перевірка розміру таблиці та створення нової
function validateAndCreate() {
    const input = document.getElementById("size");

    const value = input.value; // рядок, без парсингу

    // ===== 1. Поле порожнє =====
    if (value === "") {
        createTable(2);
        createInitialVector(2);

        notify({
            message: "Розмір не задано. Використано значення за замовчуванням: 2",
            type: "warning"
        });

        return;
    }

    const size = parseInt(value, 10);

    // ===== 2. Коректний діапазон =====
    if (size >= 2 && size <= 100) {
        createTable(size);
        createInitialVector(size);
        return;
    }

    // ===== 3. Некоректне значення =====
    createTable(2);
    createInitialVector(2);

    notify({
        message: "Введіть число в діапазоні від 2 до 100",
        type: "error"
    });

}

// Перевірка поля "кількість кроків"
function validateSteps() {
    const input = document.getElementById("steps");

    // Поле не знайдено або порожнє
    if (!input || input.value === "") {
        notify({
            message: "Спочатку задайте кількість кроків",
            type: "error"
        });
        return false;
    }

    const steps = parseInt(input.value, 10);

    // Перевірка діапазону
    if (!Number.isInteger(steps) || steps < 1 || steps > 999) {
        notify({
            message: "Кількість кроків повинна бути цілим числом від 1 до 999",
            type: "error"
        });
        return false;
    }

    return true;
}

// Перевірка матриці інтенсивностей
function validateTableValues(matrix) {
    const EPS = 1e-9;

    if (!Array.isArray(matrix) || matrix.length === 0) {
        return { valid: false, message: "Матриця пуста або не є масивом" };
    }

    const n = matrix.length;

    for (let i = 0; i < n; i++) {
        if (!Array.isArray(matrix[i]) || matrix[i].length !== n) {
            return { valid: false, message: `Матриця не квадратна: рядок ${i} має довжину ${Array.isArray(matrix[i]) ? matrix[i].length : 'не масив'}` };
        }
    }

    for (let i = 0; i < n; i++) {
        let rowSum = 0;
        let offDiagSum = 0;
        for (let j = 0; j < n; j++) {
            const raw = matrix[i][j];
            const value = Number(raw);

            if (!isFinite(value)) {
                return { valid: false, message: `Некоректне значення у рядку ${i}, стовпці ${j}: ${raw}` };
            }

            if (i !== j) {
                if (value < -EPS) {
                    return { valid: false, message: `Поза-діагональні елементи повинні бути не від'ємні: q[${i}][${j}] = ${value} < 0` };
                }
                offDiagSum += value;
            } else {
                if (value > EPS) {
                    return { valid: false, message: `Діагональний елемент повинен бути непозитивним: q[${i}][${j}] = ${value} > 0` };
                }
            }

            rowSum += value;
        }

        if (Math.abs(rowSum) > Math.max(EPS, Math.abs(offDiagSum) * 1e-8)) {
            return { valid: false, message: `Сума рядка ${i} не дорівнює 0 (сума = ${rowSum})` };
        }

        const diag = Number(matrix[i][i]);
        if (Math.abs(diag + offDiagSum) > Math.max(EPS, Math.abs(offDiagSum) * 1e-8)) {
            return { valid: false, message: `Діагональний елемент q[${i}][${i}] = ${diag} не дорівнює -сумі поза-діагональних елементів (${ -offDiagSum })` };
        }
    }

    return { valid: true, message: "Матриця інтенсивностей коректна" };
}

// Перевірка вектора початкових ймовірностей
function validateInitialVector(vector) {
    const EPS = 1e-9;
    let sum = 0;

    for (let i = 0; i < vector.length; i++) {
        const value = vector[i];

        if (Number.isNaN(value)) {
            return { valid: false, message: `Пусте значення у векторі початкових ймовірностей (p${i})` };
        }

        sum += value;
    }

    if (Math.abs(sum - 1) > EPS) {
        return { valid: false, message: `Сума початкових ймовірностей повинна дорівнювати 1 (зараз = ${sum})` };
    }

    return { valid: true, message: "Вектор початкових ймовірностей коректний" };
}

// Перевірка вводу у клітинку матриці
function validateCell(input) {
    const value = input.value;
    if (value === "") return;

    const num = Number(value);
    if (!Number.isFinite(num)) {
        notify({ message: "Дозволені лише кінцеві числа (без NaN та нескінченностей)", type: "error" });
        input.value = "";
        input.focus();
    }
}

// Перевірка клітинки ймовірності (0 ≤ p ≤ 1)
function validateProbabilityCell(input) {
    if (input.value === "") return;

    const value = Number(input.value);

    if (!Number.isFinite(value)) {
        notify({ message: "Значення повинно бути кінцевим числом", type: "error" });
        input.value = "";
        input.focus();
        return;
    }

    if (value < 0 || value > 1) {
        notify({ message: "Ймовірність повинна бути у діапазоні від 0 до 1", type: "error" });
        input.value = "";
        input.focus();
    }
}

// Перевірка кінцевого моменту часу
function validateTimeEnd() {
    const input = document.getElementById("timeEnd");

    // Поле не знайдено або порожнє
    if (!input || input.value === "") {
        notify({
            message: "Спочатку задайте кінцевий момент часу",
            type: "error"
        });
        return false;
    }

    const value = Number(input.value);

    // Перевірка: додатнє число
    if (!Number.isFinite(value) || value <= 0) {
        notify({
            message: "Кінцевий момент часу повинен бути додатнім числом",
            type: "error"
        });
        return false;
    }

    return true;
}

// Оновлення значення слайдера точності
function updatePrecisionValue(value) {
    const el = document.getElementById('precisionValue');
    if (el) el.textContent = value;
}

// Отримання значення слайдера точності
function getSliderValue() {
    const el = document.getElementById('precisionSlider');
    return el ? Number(el.value) : 4; // за замовчуванням 4 знаки
}

//Перевірка розміру матриці
function checkMatrixSizeInput() {
    const sizeInput = document.getElementById("size");

    // Поле не знайдено або порожнє
    if (!sizeInput || sizeInput.value === "") {
        notify({
            message: "Спочатку задайте розмір матриці",
            type: "error"
        });
        return false;
    }

    const size = parseInt(sizeInput.value, 10);

    // Некоректне число або поза діапазоном
    if (!Number.isInteger(size) || size < 2 || size > 100) {
        notify({
            message: "Розмір матриці має бути цілим числом від 2 до 100",
            type: "error"
        });
        return false;
    }

    return true;
}