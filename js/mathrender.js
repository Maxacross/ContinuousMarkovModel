/* =========================================================
   РЕНДЕРИНГ МАТРИЦІ ТА СИСТЕМИ РІВНЯНЬ КОЛМОГОРОВА
========================================================= */

function renderIntensityMatrix(matrix, containerId = "intensityMatrix") {
    if (!matrix || matrix.length === 0) return;

    let latex = "\\begin{bmatrix} ";
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            latex += matrix[i][j].toFixed(getSliderValue());
            if (j < matrix[i].length - 1) latex += " & ";
        }
        if (i < matrix.length - 1) latex += " \\\\ ";
    }
    latex += " \\end{bmatrix}";

    const container = document.getElementById(containerId);
    if (!container) return;

    container.style.display = "block";
    const title = document.getElementById("matrixTitle");
    if (title) title.style.display = "block";

    container.innerHTML = `\\[ ${latex} \\]`;

    MathJax.typesetPromise([container])
        .catch(err => notify({ message: `Помилка MathJax: ${err.message}`, type: "error" }));
}

function renderSystemLinearKolmogorova(matrix, containerId = "systemakolmogorova", titleId = "kolmogorovTitle") {
    if (!matrix || matrix.length === 0) return;

    const n = matrix.length;
    let latex = "\\begin{cases} ";

    for (let i = 0; i < n; i++) {
        let terms = [];
        for (let j = 0; j < n; j++) {
            const val = matrix[j][i];
            if (val === 0) continue;
            const sign = val > 0 ? "+" : "-";
            const absVal = Math.abs(val);
            let coef = absVal !== 1 ? absVal.toFixed(getSliderValue()) : "";
            terms.push(`${sign}${coef}p_{${j}}`);
        }
        let eq = terms.join("");
        if (eq.startsWith("+")) eq = eq.slice(1);
        latex += eq === "" ? "0 = 0 \\\\" : `${eq} = 0 \\\\`;
    }

    // Нормувальне рівняння
    let norm = [];
    for (let i = 0; i < n; i++) norm.push(`p_{${i}}`);
    latex += `${norm.join(" + ")} = 1`;

    latex += " \\end{cases}";

    const container = document.getElementById(containerId);
    const title = document.getElementById(titleId);
    if (!container || !title) return;

    container.style.display = "block";
    title.style.display = "block";
    container.innerHTML = `\\[ ${latex} \\]`;

    MathJax.typesetPromise([container])
        .catch(err => notify({ message: `Помилка MathJax: ${err.message}`, type: "error" }));
}

function solveAndRenderKolmogorov(matrix, containerId = "solutionContainer", titleId = "solutionTitle") {
    if (!matrix || matrix.length === 0) return;

    const n = matrix.length;
    const A = math.transpose(matrix);
    A.push(Array(n).fill(1));
    const b = Array(n).fill(0);
    b.push(1);

    let solution;
    try {
        const pinvA = math.pinv(A);
        solution = math.multiply(pinvA, b);
    } catch (err) {
        notify({ message: "Не вдалося розв'язати систему Колмогорова.", type: "error" });
        console.error(err);
        return;
    }

    let latex = "\\begin{cases} ";
    solution.forEach((val, i) => {
        const frac = math.fraction(val);
        latex += `p_{${i}} = ${Number(val).toFixed(getSliderValue())} = \\frac{${frac.n}}{${frac.d}} \\\\`;
    });
    latex += " \\end{cases}";

    const container = document.getElementById(containerId);
    const title = document.getElementById(titleId);
    if (!container || !title) return;

    container.style.display = "block";
    title.style.display = "block";
    container.innerHTML = `\\[ ${latex} \\]`;

    MathJax.typesetPromise([container])
        .catch(err => notify({ message: `Помилка MathJax: ${err.message}`, type: "error" }));
}
