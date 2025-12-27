/* =========================================================
   СТВОРЕННЯ ТА ОБРОБКА ТАБЛИЦІ
========================================================= */

// Створення таблиці (матриця переходів)
function createTable(size) {
    if (!Number.isFinite(size) || size <= 0) {
        notify({ message: "Некоректний розмір таблиці", type: "error" });
        return;
    }

    // Генеруємо HTML таблиці
    let html = "<table id='fsmTable'>";
    html += "<tr><th></th>";
    for (let j = 0; j < size; j++) html += `<th>S<sub>${j}</sub></th>`;
    html += "</tr>";

    for (let i = 0; i < size; i++) {
        html += `<th>S<sub>${i}</sub></th>`;
        for (let j = 0; j < size; j++) {
            html += `<td><input type="number" oninput="validateCell(this)"></td>`;
        }
        html += "</tr>";
    }

    html += "</table>";

    const container = document.getElementById("tableContainer");
    if (!container) {
        notify({ message: "Контейнер для таблиці не знайдено", type: "error" });
        return;
    }
    container.innerHTML = html;

    // Додаємо підсвітку активних рядка/стовпця
    addHoverEffects();
}

// Підсвітка активного рядка/стовпця
function addHoverEffects() {
    const table = document.getElementById("fsmTable");
    if (!table) return;

    const rows = table.rows;
    for (let r = 1; r < rows.length; r++) {
        for (let c = 1; c < rows[r].cells.length; c++) {
            const cell = rows[r].cells[c];
            const input = cell.querySelector("input");
            cell.onmouseover = () => highlight(r, c);
            cell.onmouseout = clearHighlight;
            if (input) {
                input.onfocus = () => highlight(r, c);
                input.onblur = clearHighlight;
            }
        }
    }
}

// Підсвітка вибраної клітинки, рядка та стовпця
function highlight(rowIndex, colIndex) {
    const table = document.getElementById("fsmTable");
    if (!table) return;
    const rows = table.rows;
    for (let c = 1; c < rows[rowIndex].cells.length; c++)
        rows[rowIndex].cells[c].classList.add("highlight-row");
    for (let r = 1; r < rows.length; r++)
        rows[r].cells[colIndex].classList.add("highlight-col");
    rows[rowIndex].cells[colIndex].classList.add("highlight-cell");
}

// Очистка підсвітки
function clearHighlight() {
    const table = document.getElementById("fsmTable");
    if (!table) return;
    const tds = table.getElementsByTagName("td");
    for (let td of tds) td.classList.remove("highlight-row", "highlight-col", "highlight-cell");
}

// Отримання значень таблиці
function getTableValues() {
    const table = document.getElementById("fsmTable");
    if (!table) {
        notify({ message: "Таблиця не знайдена", type: "error" });
        return [];
    }

    const rows = table.rows;
    const size = rows.length - 1;
    const values = [];

    for (let i = 1; i <= size; i++) {
        values[i - 1] = [];
        for (let j = 1; j <= size; j++) {
            const input = rows[i].cells[j].querySelector("input");
            values[i - 1][j - 1] = input?.value === "" ? NaN : Number(input.value);
        }
    }
    return values;
}

/* =========================================================
   СТВОРЕННЯ ВЕКТОРА ПОЧАТКОВИХ ЙМОВІРНОСТЕЙ
========================================================= */

// Створення одномірної таблиці (вектор початкових ймовірностей)
function createInitialVector(size) {
    if (!Number.isFinite(size) || size <= 0) {
        notify({ message: "Некоректний розмір вектора", type: "error" });
        return;
    }

    let html = "<table id='initialVectorTable'><tr>";
    for (let i = 0; i < size; i++) html += `<th>p<sub>${i}</sub></th>`;
    html += "</tr><tr>";

    for (let i = 0; i < size; i++) {
        html += `
            <td>
                <input type="number" min="0" max="1" step="any"
                       oninput="validateProbabilityCell(this)">
            </td>`;
    }
    html += "</tr></table>";

    const container = document.getElementById("initialVectorContainer");
    if (!container) {
        notify({ message: "Контейнер для вектора не знайдено", type: "error" });
        return;
    }
    container.innerHTML = html;
}

// Отримання значень вектора початкових ймовірностей
function getInitialVectorValues() {
    const table = document.getElementById("initialVectorTable");
    if (!table) {
        notify({ message: "Вектор початкових ймовірностей не знайдено", type: "error" });
        return [];
    }

    const inputs = table.querySelectorAll("input");
    const vector = [];
    for (let i = 0; i < inputs.length; i++) {
        vector[i] = inputs[i].value === "" ? NaN : Number(inputs[i].value);
    }
    return vector;
}
