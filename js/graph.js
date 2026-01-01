/* =========================================================
   ПОБУДОВА ТА ВІЗУАЛІЗАЦІЯ ГРАФА МАРКОВСЬКОГО ЛАНЦЮГА
========================================================= */

// Останній згенерований SVG-граф (для повторного використання / збереження)
let lastGraphSVG = null;

// Опис графа у форматі DOT (Graphviz)
let lastDotGraph = null;

/**
 * Формує DOT-опис графа на основі матриці інтенсивностей
 * @param {number[][]} matrix матриця інтенсивностей
 * @returns {string} рядок DOT
 */
function buildDotGraph(matrix) {
    const size = matrix.length;

    // Початок опису графа
    let dot = "digraph G {\n" +
              "rankdir=LR;\n" +           // Орієнтація зліва направо
              "node [shape=circle];\n";   // Вузли у вигляді кіл

    // Оголошення вершин
    for (let i = 0; i < size; i++) {
        dot += `S${i} [label=<S<sub>${i}</sub>>];\n`;
    }

    // Додавання ребер відповідно до матриці
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const value = matrix[i][j];
            // Додовання ребер якщо вони не дорівнюють 0 і не діаганальні ребра
            if (value !== 0 && i !== j) {
                dot += `S${i} -> S${j} [label=<${value}>];\n`;
            }
        }
    }

    dot += "}";

    // Зберігаємо DOT-граф для подальшого експорту
    lastDotGraph = dot;
    return dot;
}

/**
 * Відображає граф у вигляді SVG на сторінці
 * @param {string} dot DOT-опис графа
 */
function renderGraph(dot) {
    const viz = new Viz();

    viz.renderSVGElement(dot)
        .then(svg => {
            const container = document.getElementById("graphContainer");
            container.innerHTML = "";
            container.appendChild(svg);

            // Зберігаємо SVG-граф
            lastGraphSVG = svg;

            // Показуємо керування та заголовки
            const controls = document.getElementById("downloadControls");
            const title = document.getElementById("graphTitle");
            const graph = document.getElementById("graphContainer");

            if (controls) controls.style.display = "block";
            if (title) title.style.display = "block";
            if (graph) graph.style.display = "block";
        })
        .catch(err => {
            notify({
                message: "Помилка побудови графа",
                type: "error"
            });
            console.error(err);
        });
}

/**
 * Рендерить граф та зберігає його у файл (SVG або PNG)
 * @param {string} dot DOT-опис графа
 * @param {string} format формат файлу ("svg" або "png")
 */
function renderGraphToFile(dot, format) {
    const viz = new Viz();

    viz.renderSVGElement(dot)
        .then(svg => {
            const serializer = new XMLSerializer();
            const source = serializer.serializeToString(svg);

            // Збереження у SVG
            if (format === "svg") {
                const blob = new Blob([source], {
                    type: "image/svg+xml;charset=utf-8"
                });
                const url = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = "graph.svg";
                a.click();

                URL.revokeObjectURL(url);
            }

            // Збереження у PNG
            if (format === "png") {
                const img = new Image();
                const svgBlob = new Blob([source], {
                    type: "image/svg+xml;charset=utf-8"
                });
                const url = URL.createObjectURL(svgBlob);

                img.onload = function () {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob(blob => {
                        if (!blob) {
                            notify({
                                message: "Помилка конвертації графа у PNG",
                                type: "error"
                            });
                            return;
                        }

                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(blob);
                        a.download = "graph.png";
                        a.click();
                    });

                    URL.revokeObjectURL(url);
                };

                img.onerror = function () {
                    notify({
                        message: "Помилка завантаження SVG для конвертації у PNG",
                        type: "error"
                    });
                };

                img.src = url;
            }
        })
        .catch(err => {
            notify({
                message: "Помилка рендерингу графа у файл",
                type: "error"
            });
            console.error(err);
        });
}

/**
 * Завантажує граф у вибраному форматі (SVG або PNG)
 */
function downloadGraph() {
    if (!lastDotGraph) {
        notify({
            message: "Граф ще не побудовано",
            type: "warning"
        });
        return;
    }

    const formatEl = document.getElementById("graphFormat");
    const format = formatEl ? formatEl.value : "svg";

    renderGraphToFile(lastDotGraph, format);
}
