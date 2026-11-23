/*
    Group Members (Monday 3pm - 5pm):
    Howard Davis     - 2501971
    Abigail Williams - 2404730
    Jason Reid       - 2509405
    Alyesha Hayles   - 2507383
*/
const TRANSACTION_KEY  = "transactions";
const LEDGER_KEY       = "ledger";
const CURRENT_USER_KEY = "CurrentUser";
const LOGIN_PAGE       = "Herbert-Morrison-StJames-Login.html";
const DEFAULT_TUITION  = 150000;

const STORAGE = {
    get: function(storageKey) {
        try {
            const json = localStorage.getItem(storageKey);
            if (!json) return [];
            return JSON.parse(json);
        } catch(error) {
            console.error("Cannot retrieve from STORAGE: " + error);
            return [];
        }
    },
    store: function(storageKey, value) {
        try {
            localStorage.setItem(storageKey, JSON.stringify(value));
        } catch(error) {
            console.error("Failed to store: " + error);
        }
    }
};

// CurrentUser is stored in sessionStorage by auth.js
function getCurrentUser() {
    try {
        const json = sessionStorage.getItem(CURRENT_USER_KEY);
        return json ? JSON.parse(json) : null;
    } catch(e) {
        return null;
    }
}

// Students come from the admin registration form
function getRegisteredStudents() {
    const json = localStorage.getItem("registeredStudents");
    return json ? JSON.parse(json) : [];
}

function logout() {
    sessionStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = LOGIN_PAGE;
}

// Finance
function getStatus(entry) {
    if (entry.amountPaid >= entry.tuition && entry.tuition > 0) return "Paid";
    if (entry.amountPaid > 0) return "Pending";
    return "Outstanding";
}

function calBalance(entry) {
    return entry.tuition - entry.amountPaid;
}

function getLedgerRecords() {
    const students = getRegisteredStudents();
    const ledger   = STORAGE.get(LEDGER_KEY);
    const records  = [];

    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        let entry = ledger.find(function(en) {
            return String(en.studentId) === String(student.studentID);
        });

        // Create a default entry if the student has no ledger record yet
        if (!entry) {
            entry = { studentId: student.studentID, tuition: DEFAULT_TUITION, amountPaid: 0 };
            ledger.push(entry);
            STORAGE.store(LEDGER_KEY, ledger);
        }

        records.push({
            studentId:  student.studentID,
            name:       student.studentfName + " " + student.studentlName,
            grade:      student.studentClass,
            term:       student.Term,
            tuition:    entry.tuition,
            amountPaid: entry.amountPaid,
            balance:    calBalance(entry),
            status:     getStatus(entry)
        });
    }
    return records;
}

function getStudentTransactions(studentId) {
    const arr = STORAGE.get(TRANSACTION_KEY);
    return arr.filter(function(entry) {
        return String(entry.studentId) === String(studentId);
    });
}

function getLedgerStats(records) {
    const totals = {
        tuition: 0, collected: 0, owing: 0,
        paidCount: 0, pendingCount: 0, outstandingCount: 0
    };
    for (let i = 0; i < records.length; i++) {
        totals.tuition   += records[i].tuition;
        totals.collected += records[i].amountPaid;
        totals.owing     += records[i].balance;
        if      (records[i].status === "Paid")    totals.paidCount++;
        else if (records[i].status === "Pending") totals.pendingCount++;
        else                                       totals.outstandingCount++;
    }
    return totals;
}

function checkPayment(studentId, amount) {
    const arr   = STORAGE.get(LEDGER_KEY);
    const entry = arr.find(function(en) { return String(en.studentId) === String(studentId); });
    if (!entry)       return "Choose a student.";
    if (amount <= 0)  return "Enter an amount greater than zero.";
    if (amount > calBalance(entry)) return "Payment exceeds outstanding balance (" + formatMoney(calBalance(entry)) + ").";
    return "";
}

function recordPayment(studentId, amount, note) {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") throw new Error("Only administrators can record payments.");

    const error = checkPayment(studentId, amount);
    if (error !== "") throw new Error(error);

    const ledger = STORAGE.get(LEDGER_KEY);
    const entry  = ledger.find(function(en) { return String(en.studentId) === String(studentId); });
    entry.amountPaid += amount;
    STORAGE.store(LEDGER_KEY, ledger);

    const transactions = STORAGE.get(TRANSACTION_KEY);
    let nextId = 1;
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].id >= nextId) nextId = transactions[i].id + 1;
    }
    transactions.push({ id: nextId, studentId: studentId, amount: amount, note: note.trim() });
    STORAGE.store(TRANSACTION_KEY, transactions);
}

// Display
const ledgerBody     = document.getElementById("ledgerBody");
const searchText     = document.getElementById("searchText");
const filterStatus   = document.getElementById("filterStatus");
const filterGrade    = document.getElementById("filterGrade");
const paymentStudent = document.getElementById("paymentStudent");

function formatMoney(amount) {
    return "J$" + amount;
}

function search(records, filters) {
    const text    = filters.text.trim().toLowerCase();
    const results = [];
    for (let i = 0; i < records.length; i++) {
        const record       = records[i];
        const matchesText   = text === "" || record.name.toLowerCase().includes(text) || String(record.studentId).includes(text);
        const matchesStatus = filters.status === "" || record.status === filters.status;
        const matchesGrade  = filters.grade  === "" || record.grade  === filters.grade;
        if (matchesText && matchesStatus && matchesGrade) results.push(record);
    }
    return results;
}

function fillGradeFilter(records) {
    const grades = [];
    for (let i = 0; i < records.length; i++) {
        if (grades.indexOf(records[i].grade) === -1) grades.push(records[i].grade);
    }
    grades.sort();
    filterGrade.innerHTML = '<option value="">All grades</option>';
    for (let i = 0; i < grades.length; i++) {
        filterGrade.innerHTML += '<option value="' + grades[i] + '">' + grades[i] + '</option>';
    }
}

function fillPayment(records) {
    paymentStudent.innerHTML = "";
    for (let i = 0; i < records.length; i++) {
        const r = records[i];
        paymentStudent.innerHTML += '<option value="' + r.studentId + '">' + r.studentId + ' - ' + r.name + ' (owes ' + formatMoney(r.balance) + ')</option>';
    }
}

function generateTable() {
    const filtered = search(getLedgerRecords(), {
        text:   searchText.value,
        status: filterStatus.value,
        grade:  filterGrade.value
    });

    const totals = getLedgerStats(filtered);
    document.getElementById("totalTuition").innerHTML   = formatMoney(totals.tuition);
    document.getElementById("totalCollected").innerHTML = formatMoney(totals.collected);
    document.getElementById("totalOwing").innerHTML     = formatMoney(totals.owing);
    document.getElementById("statusCounts").innerHTML   = totals.paidCount + " / " + totals.pendingCount + " / " + totals.outstandingCount;

    ledgerBody.innerHTML = "";
    for (let i = 0; i < filtered.length; i++) {
        const r = filtered[i];
        ledgerBody.innerHTML +=
            '<tr>' +
            '<td>' + r.studentId + '</td>' +
            '<td>' + r.name + '</td>' +
            '<td>' + r.grade + '</td>' +
            '<td>' + formatMoney(r.tuition) + '</td>' +
            '<td>' + formatMoney(r.amountPaid) + '</td>' +
            '<td>' + formatMoney(r.balance) + '</td>' +
            '<td><span class="badge status-' + r.status + '">' + r.status + '</span></td>' +
            '<td class="no-print"><button type="button" onclick="showStatement(\'' + r.studentId + '\')">View</button></td>' +
            '</tr>';
    }
    document.getElementById("noResults").classList.toggle("hidden", filtered.length > 0);
}

function showStatement(studentId) {
    const records = getLedgerRecords();
    let record    = null;
    for (let i = 0; i < records.length; i++) {
        if (String(records[i].studentId) === String(studentId)) { record = records[i]; break; }
    }
    if (!record) return;

    const transactions = getStudentTransactions(studentId);
    const body         = document.getElementById("statementBody");
    body.innerHTML     = "";

    document.getElementById("statementTitle").innerHTML   = "Statement: " + record.name + " (ID " + record.studentId + ")";
    document.getElementById("statementSummary").innerHTML = "Tuition " + formatMoney(record.tuition) + " | Paid " + formatMoney(record.amountPaid) + " | Balance " + formatMoney(record.balance) + " | Status: " + record.status;

    for (let i = 0; i < transactions.length; i++) {
        const t = transactions[i];
        body.innerHTML += '<tr><td>' + formatMoney(t.amount) + '</td><td>' + t.note + '</td></tr>';
    }

    document.getElementById("statementEmpty").classList.toggle("hidden", transactions.length > 0);
    document.getElementById("statementSection").classList.remove("hidden");
}

function recordNewPayment() {
    const message     = document.getElementById("paymentMessage");
    const amountInput = document.getElementById("paymentAmount");
    const noteInput   = document.getElementById("paymentNote");
    try {
        recordPayment(paymentStudent.value, parseFloat(amountInput.value), noteInput.value);
        message.innerHTML = "Payment recorded.";
        message.className = "message success";
        amountInput.value = "";
        noteInput.value   = "";
        fillPayment(getLedgerRecords());
        generateTable();
    } catch(error) {
        message.innerHTML = error.message;
        message.className = "message error";
    }
}

searchText.addEventListener("input",    generateTable);
filterStatus.addEventListener("change", generateTable);
filterGrade.addEventListener("change",  generateTable);

document.getElementById("paymentButton").addEventListener("click", recordNewPayment);
document.getElementById("logoutButton").addEventListener("click",  logout);
document.getElementById("printLedgerButton").addEventListener("click", function() { window.print(); });
document.getElementById("printStatementButton").addEventListener("click", function() {
    document.body.classList.add("print-statement");
    window.print();
});
document.getElementById("closeStatementButton").addEventListener("click", function() {
    document.getElementById("statementSection").classList.add("hidden");
});

window.addEventListener("afterprint", function() {
    document.body.classList.remove("print-statement");
});

// Redirect to login if not authenticated
const currentUser = getCurrentUser();
if (!currentUser) {
    window.location.href = LOGIN_PAGE;
} else {
    const records = getLedgerRecords();
    fillGradeFilter(records);
    if (currentUser.role === "admin") {
        document.getElementById("paymentSection").classList.remove("hidden");
        fillPayment(records);
    } else {
        var srLink = document.querySelector('a[href="Herbert-Morrison-StJames-StudentRegistration.html"]');
        if (srLink) srLink.style.display = 'none';
    }
    generateTable();
}
