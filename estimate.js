const materialsSheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSmo_wgu_vIyfURXVhEBg07npBwo8Oh4W6ek3T82ss2p1zlJwORDiVvGbbU5U4ZoCq9r9jgcxcjzEQK/pub?gid=0&single=true&output=csv";
const labourSheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSmo_wgu_vIyfURXVhEBg07npBwo8Oh4W6ek3T82ss2p1zlJwORDiVvGbbU5U4ZoCq9r9jgcxcjzEQK/pub?gid=1723646196&single=true&output=csv";

async function fetchMaterials() {
    try {
        const response = await fetch(materialsSheetURL);
        const data = await response.text();
        const rows = data.split("\n").map(row => row.split(","));
        const tableBody = document.getElementById("materialsData");
        tableBody.innerHTML = "";
        rows.slice(1).forEach((cols, index) => {
            if (cols.length >= 4) {
                const materialCode = cols[0].trim();
                const description = cols[1].trim();
                const unit = cols[2].trim();
                const rate = parseFloat(cols[3].trim()).toFixed(2);

                const row = document.createElement("tr");
                row.innerHTML = `
    <td style=" text-align:center; ">${materialCode}</td>
    <td style=" ">${description}</td>
    <td style=" text-align: center;">${unit}</td>
    <td><input type="number" class="manual-input htoh-line" data-index="${index}" value=""></td>
    <td><input type="number" class="manual-input sstn-line" data-index="${index}" value=""></td>
    <td><input type="number" class="manual-input ltoh-line" data-index="${index}" value=""></td>
    <td class="total-qnty" style=" text-align: right;">0.00</td>
    <td style=" text-align: right;">${rate}</td>
    <td class="amount" style=" text-align: right;">0.00</td>
    <td class="delete-cell">
        <button class="delete-btn">&times;</button>
    </td>
`;
                tableBody.appendChild(row);
            }
        });

        addEventListeners();
        const tableFilter = document.getElementById("tableFilter");
        tableFilter.value = "option1"; // Set default option
        applyFilter("option1"); // Apply filtering immediately
    } catch (error) {
        console.error("Error fetching materials:", error);
    }
}

async function fetchLabour() {
    try {
        const response = await fetch(labourSheetURL);
        const data = await response.text();
        const rows = data.split("\n").map(row => row.split(","));
        const tableBody = document.getElementById("labourData");
        tableBody.innerHTML = "";
        rows.slice(1).forEach((cols, index) => {
            if (cols.length >= 4) {
                const labourCode = cols[0].trim();
                const description = cols[1].trim();
                const unit = cols[2].trim();
                const rate = parseFloat(cols[3].trim()).toFixed(2);
                const row = document.createElement("tr");
                row.innerHTML = `
    <td style=" text-align:center;">${labourCode}</td>
    <td style=" ">${description}</td>
    <td style=" text-align: center;">${unit}</td>
    <td><input type="number" class="manual-input htoh-line" data-index="${index}" value=""></td>
    <td><input type="number" class="manual-input sstn-line" data-index="${index}" value=""></td>
    <td><input type="number" class="manual-input ltoh-line" data-index="${index}" value=""></td>
    <td class="total-qnty" style=" text-align: right;">0.00</td>
    <td style=" text-align: right;">${rate}</td>
    <td class="amount" style=" text-align: right;">0.00</td>
    <td class="delete-cell">
        <button class="delete-btn">&times;</button>
    </td>
`;
                tableBody.appendChild(row);
            }
        });
        addEventListeners();
        const tableFilter = document.getElementById("tableFilter");
        tableFilter.value = "option1"; // Set default option
        applyFilter("option1"); // Apply filtering immediately
    } catch (error) {
        console.error("Error fetching labour:", error);
    }
}

function addEventListeners() {
    document.querySelectorAll(".total-qnty").forEach(input => {
        input.addEventListener("input", updateAmounts);
    });
}

function updateAmounts() {
    let totalMaterials = 0, totalLabour = 0;
    document.querySelectorAll(".materialsTable #materialsData tr").forEach(row => {
        const qnty = parseFloat(row.querySelector(".total-qnty")?.value) || 0;
        const rate = parseFloat(row.cells[7]?.textContent) || 0;
        const amount = qnty * rate;
        console.log(qnty);
        console.log(row);
        row.querySelector(".amount").textContent = amount.toFixed(2);
        row.querySelector(".total-qnty").textContent = qnty.toFixed(2);
        totalMaterials += amount;
    });
    document.querySelectorAll(".labourTable #labourData tr").forEach(row => {
        const qnty = parseFloat(row.querySelector(".total-qnty")?.value) || 0;
        const rate = parseFloat(row.cells[7]?.textContent) || 0;
        const amount = qnty * rate;
        row.querySelector(".amount").textContent = amount.toFixed(2);
        row.querySelector(".total-qnty").textContent = qnty.toFixed(2);
        totalLabour += amount;
    });
}

fetchMaterials();
fetchLabour();
document.addEventListener("input", function (event) {
    if (event.target.classList.contains("manual-input")) {
        const row = event.target.closest("tr"); // Get the closest row
        if (!row) return;
        const htoh = parseFloat(row.querySelector(".htoh-line")?.value) || 0;
        const sstn = parseFloat(row.querySelector(".sstn-line")?.value) || 0;
        const ltoh = parseFloat(row.querySelector(".ltoh-line")?.value) || 0;
        const totalField = row.querySelector(".total-qnty");
        if (totalField) {
            totalField.value = (htoh + sstn + ltoh).toFixed(2);
        }
        updateAmounts(); // Trigger recalculation of Total Amount
    }
});

function calculateSummary() {
    let total = 0;
    document.querySelectorAll(".materialsTable tbody tr").forEach(row => {
        let amountCell = row.cells[8]; // Amount (₹) column
        if (amountCell && amountCell.textContent.trim() !== "") {
            total += parseFloat(amountCell.textContent) || 0;
        }
    });
    document.getElementById("totalRs").textContent = total.toFixed(2);
    document.getElementById("escalationRs").textContent = (total * 0.05).toFixed(2);
    let subTotal = total + (total * 0.05);
    document.getElementById("subTotalRs").textContent = subTotal.toFixed(2);
    let sundry = subTotal * 0.05;
    document.getElementById("sundryRs").textContent = sundry.toFixed(2);
    let grandTotal = subTotal + sundry;
    document.getElementById("grandTotalRs").textContent = grandTotal.toFixed(2);
}

function calculateLabourTotal() {
    let labourTotal = 0;
    document.querySelectorAll(".labourTable tbody tr").forEach(row => {
        let amountCell = row.cells[8]; // Amount (₹) column
        if (amountCell && amountCell.textContent.trim() !== "") {
            labourTotal += parseFloat(amountCell.textContent) || 0;
        }
    });
    document.getElementById("labourTotalRs").textContent = labourTotal.toFixed(2);
}

document.addEventListener("DOMContentLoaded", () => {
    calculateSummary();
    calculateLabourTotal();
    const observer1 = new MutationObserver(calculateSummary);
    observer1.observe(document.getElementById("materialsData"), {childList: true, subtree: true});
    const observer2 = new MutationObserver(calculateLabourTotal);
    observer2.observe(document.getElementById("labourData"), {childList: true, subtree: true});
});

function calculateAllSummary() {
    let materialsTotal = parseFloat(document.getElementById("grandTotalRs").textContent) || 0;
    let labourTotal = parseFloat(document.getElementById("labourTotalRs").textContent) || 0;
    let supervision = (materialsTotal + labourTotal) * 0.15;
    let totalAB = materialsTotal + labourTotal + supervision;
    let cess = totalAB * 0.01;
    let subTotalAll = totalAB + cess;
    let cgst = labourTotal * 0.09;
    let sgst = labourTotal * 0.09;
    let grandTotalAll = subTotalAll + cgst + sgst;
    document.getElementById("materialsTotal").textContent = materialsTotal.toFixed(2);
    document.getElementById("labourTotal").textContent = labourTotal.toFixed(2);
    document.getElementById("supervision").textContent = supervision.toFixed(2);
    document.getElementById("totalAB").textContent = totalAB.toFixed(2);
    document.getElementById("cess").textContent = cess.toFixed(2);
    document.getElementById("subTotalAll").textContent = subTotalAll.toFixed(2);
    document.getElementById("cgst").textContent = cgst.toFixed(2);
    document.getElementById("sgst").textContent = sgst.toFixed(2);
    document.getElementById("grandTotalAll").textContent = grandTotalAll.toFixed(2);
    // Ensure Grand Total All in words updates
    updateTotalInWords();
}

document.addEventListener("DOMContentLoaded", () => {
    calculateAllSummary();
    const observer = new MutationObserver(calculateAllSummary);
    observer.observe(document.getElementById("totalRs"), {childList: true, subtree: true});
    observer.observe(document.getElementById("labourTotalRs"), {childList: true, subtree: true});
});
document.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-btn")) {
        const row = event.target.closest("tr");
        if (row) {
            const tableBody = row.parentElement;
            row.remove();
            updateRowColors(tableBody); // Reapply alternating colors
        }
    }
});

function numberToWords(num) {
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    if (num === 0) return "Zero";
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + a[num % 10] : "");
    if (num < 1000) return a[Math.floor(num / 100)] + " Hundred" + (num % 100 !== 0 ? " and " + numberToWords(num % 100) : "");
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 !== 0 ? " " + numberToWords(num % 1000) : "");
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 !== 0 ? " " + numberToWords(num % 100000) : "");
    if (num < 1000000000) return numberToWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 !== 0 ? " " + numberToWords(num % 10000000) : "");
    return "‎";
}

function updateTotalInWords() {
    let grandTotalAllElement = document.getElementById("grandTotalAll");
    if (!grandTotalAllElement) {
        console.error("Grand Total All element not found!");
        return;
    }
    let grandTotalAllText = grandTotalAllElement.textContent.trim().replace(/,/g, '');
    let grandTotalAll = parseFloat(grandTotalAllText);
    // ✅ Fix: Round to nearest integer
    let roundedTotal = Math.round(grandTotalAll);
    if (isNaN(roundedTotal) || roundedTotal <= 0) {
        document.getElementById("totalInWords").textContent = "";
        return;
    }
    // ✅ Format number as ₹ X,XX,XXX.00
    let formattedTotal = "₹ " + roundedTotal.toLocaleString("en-IN") + ".00";
    // ✅ Convert to words
    let totalInWords = numberToWords(roundedTotal) + " Rupees Only";
    // ✅ Update the display
    document.getElementById("totalInWords").textContent = formattedTotal + " (" + totalInWords + ")";
}

// Call this function whenever the total updates
document.addEventListener("DOMContentLoaded", function () {
    updateTotalInWords();
});

// Add CSS styles for animation
document.addEventListener("DOMContentLoaded", function() {
    document.head.insertAdjacentHTML("beforeend", `
    <style>
        .delete-btn {
            background: darkred;
            color: white;
            border: none;
            padding: 0px 4px;
            cursor: pointer;
            transition: transform 0.4s ease-in-out, background 0.4s;
        }
        .delete-btn:hover {
            background: red;
            transform: scale(1.1);
        }
        .delete-btn:active {
            transform: scale(2);
        }
        
        /* Print styles */
        @media print {
            #summaryTable tr:nth-child(5) {
                display: none !important;
            }
            button, .delete-cell {
                display: none !important;
            }
            /* Remove borders for cleaner print */
            input {
                border: none !important;
                background-color: transparent !important;
                -webkit-appearance: none !important;
                appearance: none !important;
            }
        }
    </style>
`);
});

// Improved print functionality
document.getElementById("printButton").addEventListener("click", function () {
    // Create a function to notify the parent when printing is done
    function notifyPrintComplete() {
        try {
            // Try to notify the parent window
            if (window.parent && window.parent !== window) {
                window.parent.postMessage("printComplete", "*");
            }
        } catch(e) {
            console.log("Could not communicate with parent window:", e);
        }
    }

    // Fix for Google Sites embedded content
    try {
        // Create print styles
        const printStyles = document.createElement('style');
        printStyles.id = 'print-styles';
        printStyles.innerHTML = `
            @media print {
                body, html {
                    width: 100% !important;
                    height: auto !important;
                    overflow: visible !important;
                }
                
                #summaryTable tr:nth-child(5) {
                    display: none !important;
                }
                
                button, .delete-cell {
                    display: none !important;
                }
                
                input {
                    border: none !important;
                    background-color: transparent !important;
                    -webkit-appearance: none !important;
                    appearance: none !important;
                }
                
                .table-container {
                    page-break-inside: avoid;
                }
            }
        `;
        document.head.appendChild(printStyles);
        
        // Ensure input values persist in print
        document.querySelectorAll("input").forEach(input => {
            const value = input.value || "0";
            input.setAttribute("value", value);
            input.dataset.originalValue = value;
            
            // Force the input to show its value even when printing
            const span = document.createElement('span');
            span.className = 'print-value';
            span.textContent = value;
            span.style.display = 'none';
            input.parentNode.insertBefore(span, input.nextSibling);
        });
        
        // Create special styles for print-only span values
        const valueStyles = document.createElement('style');
        valueStyles.innerHTML = `
            @media print {
                input { display: none !important; }
                .print-value { display: inline !important; }
            }
        `;
        document.head.appendChild(valueStyles);
        
        // Try two methods for printing:
        
        // Method 1: Direct print - works in most browsers
        window.print();
        
        // Method 2: Create an iframe and print that - often works in embedded scenarios
        setTimeout(() => {
            try {
                const printFrame = document.createElement('iframe');
                printFrame.style.position = 'fixed';
                printFrame.style.right = '0';
                printFrame.style.bottom = '0';
                printFrame.style.width = '0';
                printFrame.style.height = '0';
                printFrame.style.border = '0';
                
                document.body.appendChild(printFrame);
                
                // Copy the document content to the iframe
                const frameDoc = printFrame.contentWindow.document;
                frameDoc.open();
                
                // Copy head content (styles)
                frameDoc.write('<html><head>');
                Array.from(document.head.querySelectorAll('style, link')).forEach(el => {
                    frameDoc.write(el.outerHTML);
                });
                frameDoc.write('</head><body>');
                
                // Copy body content
                frameDoc.write(document.body.innerHTML);
                frameDoc.write('</body></html>');
                frameDoc.close();
                
                // Wait for the iframe to load completely
                printFrame.onload = function() {
                    try {
                        // Focus and print the iframe
                        printFrame.contentWindow.focus();
                        printFrame.contentWindow.print();
                        
                        // Remove the iframe after printing
                        setTimeout(() => {
                            document.body.removeChild(printFrame);
                            notifyPrintComplete();
                        }, 1000);
                    } catch(e) {
                        console.error("Error printing iframe:", e);
                    }
                };
            } catch(e) {
                console.error("Error setting up print iframe:", e);
            }
        }, 500);
        
        // Clean up after printing
        window.addEventListener('afterprint', function() {
            // Remove the special print styles
            if (document.getElementById('print-styles')) {
                document.head.removeChild(document.getElementById('print-styles'));
            }
            if (valueStyles.parentNode) {
                document.head.removeChild(valueStyles);
            }
            
            // Remove the print-value spans
            document.querySelectorAll('.print-value').forEach(span => {
                span.parentNode.removeChild(span);
            });
            
            notifyPrintComplete();
        });
    } catch(e) {
        console.error("Print error:", e);
        // Fallback to basic print
        window.print();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("input").forEach(input => {
        const savedValue = localStorage.getItem(input.dataset.index);
        if (savedValue) input.value = savedValue;
    });
});

document.addEventListener("input", (event) => {
    if (event.target.tagName === "INPUT") {
        localStorage.setItem(event.target.dataset.index, event.target.value);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const tableFilter = document.getElementById("tableFilter");
    tableFilter.value = "option1"; // Set default option
    applyFilter("option1"); // Apply filtering immediately
});

// Add event listener for dropdown changes
document.getElementById("tableFilter").addEventListener("change", function () {
    applyFilter(this.value);
});

function applyFilter(selectedValue) {
    const materialRows = {
        "option1": [1, 10, 16, 30, 31, 32, 33, 34, 46, 47],
        "option2": [1, 10, 16, 30, 31, 32, 33, 34, 46, 47],
        "option3": [2, 5, 8, 12],
        "option4": [6, 10, 15, 20],
        "option5": [9, 13, 18, 21],
        "option6": [11, 16, 22, 30]
    };
    const labourRows = {
        "option1": [7, 18, 19, 35, 37, 38, 40, 43, 75, 72, 73],
        "option2": [7, 18, 19, 35, 37, 38, 40, 43, 67, 72, 73],
        "option3": [5, 8, 12, 20],
        "option4": [3, 7, 10, 25],
        "option5": [13, 17, 21, 26],
        "option6": [14, 19, 24, 28]
    };

    filterTableRows("materialsData", materialRows[selectedValue]);
    filterTableRows("labourData", labourRows[selectedValue]);
}

// Function to filter table rows
function filterTableRows(tableId, allowedRows) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = table.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        rows[i].style.display = allowedRows.includes(i + 1) ? "" : "none";
    }
    updateRowColors(table);
}

// Update alternating row colors
function updateRowColors(table) {
    if (!table) return;

    let visibleRows = Array.from(table.getElementsByTagName("tr")).filter(row => row.style.display !== "none");

    visibleRows.forEach((row, index) => {
        row.style.backgroundColor = (index % 2 === 0) ? "#ffffff" : "#f2f2f2";
    });
}

// Handle messages from parent frame (Google Sites)
window.addEventListener('message', function(event) {
    // Check if the message is requesting a print
    if (event.data === 'print') {
        document.getElementById('printButton').click();
    }
});

// Let the parent know this frame is ready
window.addEventListener('load', function() {
    try {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage('iframeReady', '*');
        }
    } catch(e) {
        console.log("Could not communicate with parent window:", e);
    }
});
