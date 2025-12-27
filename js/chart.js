/* =========================================================
   ПЕРЕВІРКИ КОРЕКТНОСТІ ДАНИХ
========================================================= */

/**
 * Перевірка, чи є вектор ймовірнісним
 * - усі елементи ≥ 0
 * - сума елементів = 1
 */
function isProbabilityVector(p) {
    const sum = p.reduce((a, b) => a + b, 0);
    return p.every(v => v >= 0) && Math.abs(sum - 1) < 1e-9;
}

/**
 * Перевірка, чи є матриця матрицею інтенсивностей Q
 * Вимоги:
 * 1) діагональні елементи ≤ 0
 * 2) позадіагональні елементи ≥ 0
 * 3) сума кожного рядка дорівнює 0
 */
function isIntensityMatrix(Q) {
    const n = Q.length;

    for (let i = 0; i < n; i++) {
        let rowSum = 0;

        for (let j = 0; j < n; j++) {

            // Діагональний елемент не може бути додатним
            if (i === j && Q[i][j] > 0) {
                notify({
                    message: `Діагональний елемент Q[${i}][${j}] > 0`,
                    type: "error"
                });
                return false;
            }

            // Позадіагональні елементи не можуть бути від’ємними
            if (i !== j && Q[i][j] < 0) {
                notify({
                    message: `Позадіагональний елемент Q[${i}][${j}] < 0`,
                    type: "error"
                });
                return false;
            }

            rowSum += Q[i][j];
        }

        // Сума рядка повинна дорівнювати нулю
        if (Math.abs(rowSum) > 1e-9) {
            notify({
                message: `Сума рядка ${i} не дорівнює 0 (сума = ${rowSum})`,
                type: "error"
            });
            return false;
        }
    }
    return true;
}

/* =========================================================
   ГЕНЕРАЦІЯ КОЛЬОРІВ ДЛЯ ГРАФІКА
========================================================= */

let hue = 0;

/**
 * Повертає унікальний колір у форматі HSL
 * Використовується для різних кривих на графіку
 */
function getUniqueColor() {
    const color = `hsl(${hue % 360}, 70%, 50%)`;
    hue += 360 / 12;
    return color;
}

/* =========================================================
   ОСНОВНА ФУНКЦІЯ ПОБУДОВИ CTMC (ТОЧНЕ РІШЕННЯ)
========================================================= */

/**
 * Побудова динаміки безперервного марковського ланцюга
 * за формулою:
 *      p(t) = p(0) · exp(Q·t)
 *
 * @param {Array} p0     початковий вектор імовірностей
 * @param {Array} Q      матриця інтенсивностей
 * @param {Number} T     кінцевий момент часу
 * @param {Number} steps кількість кроків дискретизації
 * @param {String} canvasId id canvas для графіка
 */
function renderCTMCExact(p0, Q, T, steps = 200, canvasId = "ctmcChart") {

    // Перевірка вектора p0
    if (!isProbabilityVector(p0)) {
        notify({
            message: "p(⁰) не є ймовірнісним вектором",
            type: "error"
        });
        return;
    }

    // Перевірка матриці Q
    if (!isIntensityMatrix(Q)) {
        notify({
            message: "Q не є матрицею інтенсивностей",
            type: "error"
        });
        return;
    }

    // Перевірка розмірностей
    if (p0.length !== Q.length) {
        notify({
            message: "Розмірності p(⁰) та Q не збігаються",
            type: "error"
        });
        return;
    }

    // Якщо графік уже існує — знищуємо його
    if (window.ctmcChartInstance) {
        window.ctmcChartInstance.destroy();
    }

    // Скидання генератора кольорів
    hue = 0;

    const n = p0.length;
    const dt = T / steps;

    const labels = [];
    const histories = Array.from({ length: n }, () => []);

    // Перетворюємо p0 у рядок-матрицю
    const p0Row = math.matrix([p0]);

    // Основний цикл за часом
    for (let k = 0; k <= steps; k++) {
        const t = +(k * dt).toFixed(getSliderValue());
        labels.push(t);

        // Обчислення exp(Q·t)
        const Qt = math.multiply(Q, t);
        const expQt = math.expm(Qt);

        // p(t) = p(0) · exp(Q·t)
        let p = math.multiply(p0Row, expQt).toArray()[0];

        // Числова стабілізація
        p = p.map(v => Math.max(0, v));
        const sum = p.reduce((a, b) => a + b, 0);
        p = p.map(v => v / sum);

        // Збереження історії ймовірностей
        for (let i = 0; i < n; i++) {
            histories[i].push(p[i]);
        }
    }

    // Формування наборів даних для Chart.js
    const datasets = histories.map((data, i) => ({
        label: `p${i}(t)`,
        data,
        borderColor: getUniqueColor(),
        borderWidth: 2,
        tension: 0.15,
        fill: false,
        pointRadius: 0
    }));

    const ctx = document
        .getElementById(canvasId)
        .getContext("2d");

    // Побудова графіка
    window.ctmcChartInstance = new Chart(ctx, {
        type: "line",
        data: { labels, datasets },
        options: {
            responsive: true,
            animation: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    title: {
                        display: true,
                        text: "Ймовірність"
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Час t"
                    }
                }
            }
        }
    });
}
