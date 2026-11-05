
// =====================================================
// 1. INITIAL MATRICES
// =====================================================

let A = [];
let B = [];
let C = [];

let lastCalculation = null;


// =====================================================
// 2. GET HTML ELEMENTS
// =====================================================

const matrixAInput = document.getElementById("matrixA");
const matrixBInput = document.getElementById("matrixB");

const rowSelect = document.getElementById("rowSelect");
const columnSelect = document.getElementById("columnSelect");

const displayA = document.getElementById("displayA");
const displayB = document.getElementById("displayB");
const displayC = document.getElementById("displayC");

const dimensions = document.getElementById("dimensions");

const errorMessage = document.getElementById("errorMessage");

const calculationResult =
    document.getElementById("calculationResult");

const selectedElement =
    document.getElementById("selectedElement");


// =====================================================
// 3. PARSE MATRIX INPUT
// =====================================================

function parseMatrix(input) {

    const rows = input.trim().split(/\r?\n/);

    const matrix = rows
        .filter(row => row.trim() !== "")
        .map(row => row.trim().split(/[\s,]+/).map(Number));

    if (matrix.length === 0) {
        throw new Error("Please enter matrix values.");
    }

    const columns = matrix[0].length;

    for (const row of matrix) {

        if (row.length !== columns) {
            throw new Error(
                "All rows must have the same number of elements."
            );
        }

        if (row.some(value => !Number.isFinite(value))) {
            throw new Error("Please enter valid numerical values.");
        }
    }

    return matrix;
}


// =====================================================
// 4. FORMAT NUMBERS
// =====================================================

function formatValue(value) {

    if (Math.abs(value - Math.round(value)) < 1e-10) {
        return String(Math.round(value));
    }

    return Number(value.toFixed(4)).toString();
}


// =====================================================
// 5. MATRIX MULTIPLICATION
// =====================================================

function multiplyMatrices(A, B) {

    const rowsA = A.length;
    const colsA = A[0].length;

    const colsB = B[0].length;

    const result = [];

    for (let i = 0; i < rowsA; i++) {

        result[i] = [];

        for (let j = 0; j < colsB; j++) {

            let sum = 0;

            for (let k = 0; k < colsA; k++) {

                sum += A[i][k] * B[k][j];

            }

            result[i][j] = sum;

        }

    }

    return result;
}


// =====================================================
// 6. CREATE MATRIX TABLE
// =====================================================

function createMatrixTable(
    matrix,
    mode,
    selectedRow,
    selectedColumn
) {

    let table = '<table class="matrix-table">';

    for (let i = 0; i < matrix.length; i++) {

        table += "<tr>";

        for (let j = 0; j < matrix[i].length; j++) {

            let cssClass = "";

            // Highlight selected row in A
            if (mode === "A" && i === selectedRow) {
                cssClass = "selected-row";
            }

            // Highlight selected column in B
            if (mode === "B" && j === selectedColumn) {
                cssClass = "selected-column";
            }

            // Highlight selected element in C
            if (mode === "C") {

                if (
                    i === selectedRow &&
                    j === selectedColumn
                ) {
                    cssClass = "selected-result";
                }

            }

            table += `
                <td class="${cssClass}">
                    ${formatValue(matrix[i][j])}
                </td>
            `;

        }

        table += "</tr>";

    }

    table += "</table>";

    return table;
}


// =====================================================
// 7. UPDATE MATRIX DISPLAY
// =====================================================

function renderMatrices() {

    const i = Number(rowSelect.value);
    const j = Number(columnSelect.value);

    displayA.innerHTML = createMatrixTable(
        A, "A", i, j
    );

    displayB.innerHTML = createMatrixTable(
        B, "B", i, j
    );

    displayC.innerHTML = createMatrixTable(
        C, "C", i, j
    );

    selectedElement.textContent =
        `Selected element: C[${i + 1}, ${j + 1}]`;

    // Clear old calculation if selection changes
    if (
        lastCalculation &&
        (lastCalculation.row !== i ||
         lastCalculation.column !== j)
    ) {
        lastCalculation = null;
        calculationResult.innerHTML = "";
    }

}


// =====================================================
// 8. UPDATE DROPDOWN OPTIONS
// =====================================================

function updateDropdowns() {

    rowSelect.innerHTML = "";
    columnSelect.innerHTML = "";

    for (let i = 0; i < A.length; i++) {

        const option = document.createElement("option");

        option.value = i;
        option.textContent = `Row ${i + 1}`;

        rowSelect.appendChild(option);

    }

    for (let j = 0; j < B[0].length; j++) {

        const option = document.createElement("option");

        option.value = j;
        option.textContent = `Column ${j + 1}`;

        columnSelect.appendChild(option);

    }

}


// =====================================================
// 9. UPDATE MATRIX DIMENSIONS
// =====================================================

function updateDimensions() {

    dimensions.textContent =
        `Matrix A: ${A.length} × ${A[0].length}   |   ` +
        `Matrix B: ${B.length} × ${B[0].length}   |   ` +
        `Matrix C: ${C.length} × ${C[0].length}`;

}


// =====================================================
// 10. UPDATE ALL MATRICES
// =====================================================

function updateMatrices() {

    try {

        errorMessage.textContent = "";

        A = parseMatrix(matrixAInput.value);
        B = parseMatrix(matrixBInput.value);

        if (A[0].length !== B.length) {

            throw new Error(
                "Matrix multiplication is not possible. " +
                "Columns of A must equal rows of B."
            );

        }

        C = multiplyMatrices(A, B);

        lastCalculation = null;

        calculationResult.innerHTML = "";

        updateDropdowns();

        updateDimensions();

        renderMatrices();

    }

    catch (error) {

        errorMessage.textContent = error.message;

        displayA.innerHTML = "";
        displayB.innerHTML = "";
        displayC.innerHTML = "";

        dimensions.textContent = "";

        selectedElement.textContent = "";

        calculationResult.innerHTML = "";

        lastCalculation = null;

    }

}


// =====================================================
// 11. SELECTED ELEMENT CALCULATION
// =====================================================

function calculateSelectedElement() {

    const i = Number(rowSelect.value);
    const j = Number(columnSelect.value);

    const row = A[i];

    const column = B.map(
        matrixRow => matrixRow[j]
    );

    const products = row.map(
        (value, k) => value * column[k]
    );

    const result = products.reduce(
        (sum, value) => sum + value,
        0
    );

    lastCalculation = {
        row: i,
        column: j,
        result: result
    };

    // First line: multiplication
    const multiplicationText = row.map(
        (value, k) =>
            `(${formatValue(value)} × ${formatValue(column[k])})`
    ).join(" + ");

    // Second line: individual products
    const productsText = products.map(
        value => formatValue(value)
    ).join(" + ");

    calculationResult.innerHTML = `

        <div class="calculation-card">

            <div class="section-label">
                MATRIX ELEMENT CALCULATION
            </div>

            <h3>
                C<sub>${i + 1},${j + 1}</sub>
            </h3>

            <div class="calculation-line">
                ${multiplicationText}
            </div>

            <div class="calculation-line products-line">
                = ${productsText}
            </div>

            <div class="calculation-line result-number">
                = ${formatValue(result)}
            </div>

            <div class="final-result">
                C[${i + 1},${j + 1}] = ${formatValue(result)}
            </div>

        </div>

    `;

}


// =====================================================
// 12. RESET CALCULATION
// =====================================================

function resetCalculation() {

    lastCalculation = null;

    calculationResult.innerHTML = "";

    selectedElement.textContent =
        `Selected element: C[${Number(rowSelect.value) + 1}, ` +
        `${Number(columnSelect.value) + 1}]`;

}


// =====================================================
// 13. EVENT LISTENERS
// =====================================================

document.getElementById("updateMatrices")
    .addEventListener("click", updateMatrices);

document.getElementById("calculateButton")
    .addEventListener("click", calculateSelectedElement);

document.getElementById("resetButton")
    .addEventListener("click", resetCalculation);

rowSelect.addEventListener("change", renderMatrices);

columnSelect.addEventListener("change", renderMatrices);


// =====================================================
// 14. INITIALIZE APPLICATION
// =====================================================

updateMatrices();
