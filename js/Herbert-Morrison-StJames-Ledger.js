const TRANSACTION_KEY = "transactions";
const STUDENT_KEY = "student";
const LEDGER_KEY =  "ledger";
const CURRENT_USER_KEY = "CurrentUser";

//Storage
const STORAGE = {
    get:function(storageKey){
        try{
            const json = localStorage.getItem(storageKey);
            if (!json) return [];

            const arr = JSON.parse(json);
            return arr;
        }catch (error){
            console.error("Cannot retrieve from STORAGE:" + error);
            return [];
        }
    },

    store:function(storageKey, value){
        try{
            localStorage.setItem(storageKey, JSON.stringify(value));
        }catch(error){
            console.error("Failed to store: " + error);
        }
    }
};

//Database
function createStudent(id, firstName, lastName, age, grade, term = "summer"){
    return {
        id: id,
        firstName: firstName,
        lastName: lastName,
        age: age,
        grade: grade,
        term: term
    };
}
function createLedger(studentId, tuition, amountPaid){
    return {
        studentId: studentId,
        tuition: tuition,
        amountPaid: amountPaid,
    };
}
function createUser(id, email, password, role, status = "active"){
    return {
        id: id,
        email: email,
        password: password,
        role: role,
        status: status,
    };//Can add that when user is created to adds to arr
}
function initTestStorage() {
    const testStudents = [
        createStudent(101, "Maya", "Campbell", 14, 9, "summer"),
        createStudent(102, "Devon", "Brown", 16, 11, "fall"),
        createStudent(103, "Tariq", "Williams", 12, 7),
    ];

    const testLedgers = [
        createLedger(101, 1500, 1500),
        createLedger(102, 1800, 900),
        createLedger(103, 1400, 500),
    ];
    const CURRENT_USER = [ createUser(1, "admin@example.com", "admin123", "admin")];
    STORAGE.store(STUDENT_KEY, testStudents);
    STORAGE.store(LEDGER_KEY, testLedgers);
    STORAGE.store(CURRENT_USER_KEY, CURRENT_USER);
}

initTestStorage();

//Finance
function getStatus(entry){
    if(entry.amountPaid >= entry.tuition){
        return "Paid";
    }
    if (entry.amountPaid > 0) {
        return "Pending";
    }
    return "Outstanding";
}

function calBalance(entry) {
    return entry.tuition - entry.amountPaid;
}
function getLedgerRecords(){
    const students = STORAGE.get(STUDENT_KEY);
    const ledger = STORAGE.get(LEDGER_KEY);
    const concatArr = [];

    for(let i = 0; i < students.length; i++){
        const student = students[i];
        const entry = ledger.find(en => en.studentId === student.id);

        concatArr.push({
            studentId: student.id,
            name: student.firstName + " " + student.lastName,
            grade: student.grade,
            term: student.term,
            tuition: entry.tuition,
            amountPaid: entry.amountPaid,
            balance: calBalance(entry),
            status: getStatus(entry)
        });
    }
    return concatArr;
}

function getStudentTransactions(studentId){
    const arr = STORAGE.get(TRANSACTION_KEY);
    return arr.filter(function (entry){
        return entry.studenId === studentId;
    });
}

function getLedgerStats(records){
    const totals = {
        tuition: 0,
        collected: 0,
        owing: 0, 
        paidCount: 0,
        pendingCount: 0,
        outstandingCount: 0,
    };

    for(let i = 0; i < records.length; i++){
        totals.tuition += records[i].tuition;
        totals.collected += records[i].amountPaid;
        totals.owing += records[i].balance;
        if (records[i].status === "Paid") {
            totals.paidCount++;
        } else if (records[i].status === "Pending") {
            totals.pendingCount++;
        } else {
            totals.outstandingCount++;
        }
    }
    return totals;
}

function checkPayment(studentId, amount){
    const arr  = STORAGE.get(LEDGER_KEY);
    const entry =  arr.find(entry => entry.studentId === studentId);

    if(!entry){
        return "Choose a student.";
    }
    if(amount <= 0) {
        return "Enter a amount greater than zero.";
    }
    if(amount > calBalance(entry)){
        return "Payment is greater than owing balance (" + calBalance(entry) + ").";
    }
    return "";

}

function recordPayment(studentId, amount, note){
    const currentUser = STORAGE.get(CURRENT_USER_KEY);
    if (!currentUser || currentUser[0].role !== "admin"){
        throw new Error("Only administrators");
    }

    const error = checkPayment(studentId, amount);
    if(error !== ""){
        throw new Error(error);
    }

    //Adds the amount currently paid to the amount pior
    const ledger = STORAGE.get(LEDGER_KEY);
    const entry = ledger.find(entry => entry.studentId === studentId);
    entry.amountPaid += amount;
    STORAGE.store(LEDGER_KEY, ledger);

    const transactions = STORAGE.get(TRANSACTION_KEY);
    let nextId = 1;
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].id >= nextId) {
        nextId = transactions[i].id + 1;//Searches for the last ID for transactions
        }
    }
    transactions.push({
        id:nextId,
        studentId: studentId,
        amount: amount,
        note: note.trim()
    });
    STORAGE.store(TRANSACTION_KEY, transactions);
}



//Display
const currentUser = STORAGE.get(CURRENT_USER_KEY);

const ledgerBody = document.getElementById("ledgerBody");
const searchText = document.getElementById("searchText");
const filterStatus = document.getElementById("filterStatus");
const filterGrade = document.getElementById("filterGrade");
const paymentStudent = document.getElementById("paymentStudent");

function formatMoney(amount) {
    return "J$" + amount;
}

function search(records, filters) {
    const text = filters.text.trim().toLowerCase();
    const results = [];

    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const matchesText = text === "" || String(record.studentId) === text;
        const matchesStatus = filters.status === "" || record.status === filters.status;
        const matchesGrade = filters.grade === "" || record.grade === filters.grade;

        if (matchesText && matchesStatus && matchesGrade) {
            results.push(record);
        }
    }
    return results;
}

function fillGradeFilter(records) {
    const grade = [];
    for (let i = 0; i < records.length; i++) {
        if (grade.indexOf(records[i].grade) === -1) {
            grade.push(records[i].grade);
        }
    }
    grade.sort();

    filterGrade.innerHTML = '<option value="">All grade</option>';
    for (let i = 0; i < grade.length; i++) {
        filterGrade.innerHTML += `<option value="${grade[i]}">${grade[i]}</option>`;
    }
}

function fillPayment(records) {
    paymentStudent.innerHTML = "";
    for (let i = 0; i < records.length; i++) {
        const r = records[i];
        paymentStudent.innerHTML += `<option value="${r.studentId}">${r.studentId} - ${r.name} (owes ${formatMoney(r.balance)})</option>`;
    }
}

function generateTable() {
    const filtered = search(getLedgerRecords(), {
        text: searchText.value,
        status: filterStatus.value,
        grade: filterGrade.value
    });

    const totals = getLedgerStats(filtered);
    document.getElementById("totalTuition").innerHTML = formatMoney(totals.tuition);
    document.getElementById("totalCollected").innerHTML = formatMoney(totals.collected);
    document.getElementById("totalOwing").innerHTML = formatMoney(totals.owing);
    document.getElementById("statusCounts").innerHTML = totals.paidCount + " / " + totals.pendingCount + " / " + totals.outstandingCount;

    ledgerBody.innerHTML = "";
    for (let i = 0; i < filtered.length; i++) {
        const record = filtered[i];
        ledgerBody.innerHTML += `
            <tr>
                <td>${record.studentId}</td>
                <td>${record.name}</td>
                <td>${record.grade}</td>
                <td>${formatMoney(record.tuition)}</td>
                <td>${formatMoney(record.amountPaid)}</td>
                <td>${formatMoney(record.balance)}</td>
                <td><span class="badge status-${record.status}">${record.status}</span></td>
                <td class="no-print"><button type="button" onclick="showStatement(${record.studentId})">View</button></td>
            </tr>
        `;
    }

    document.getElementById("noResults").classList.toggle("hidden", filtered.length > 0);
}

function showStatement(studentId) {
    const records = getLedgerRecords();
    let record = null;

    for (let i = 0; i < records.length; i++) {
        if (records[i].studentId === studentId) {
            record = records[i];
            break;
        }
    }

    const transactions = getTransactionsForStudent(studentId);
    const body = document.getElementById("statementBody");
    body.innerHTML = "";

    document.getElementById("statementTitle").innerHTML = `Statement: ${record.name} (ID ${record.studentId})`;
    document.getElementById("statementSummary").innerHTML =
        `Tuition ${formatMoney(record.tuition)} | Paid ${formatMoney(record.amountPaid)} | Balance ${formatMoney(record.balance)} | Status: ${record.status}`;

    for (let i = 0; i < transactions.length; i++) {
        const t = transactions[i];
        body.innerHTML += `
            <tr>
                <td>${formatMoney(t.amount)}</td>
                <td>${t.note}</td>
            </tr>
        `;
    }

    document.getElementById("statementEmpty").classList.toggle("hidden", transactions.length > 0);
    document.getElementById("statementSection").classList.remove("hidden");
}

function recordNewPayment() {
    const message = document.getElementById("paymentMessage");
    const amountInput = document.getElementById("paymentAmount");
    const noteInput = document.getElementById("paymentNote");

    try {
        recordPayment(Number(paymentStudent.value), parseFloat(amountInput.value), noteInput.value);
        message.innerHTML = "Payment recorded.";
        message.className = "message success";
        amountInput.value = "";
        noteInput.value = "";
        fillPayment(getLedgerRecords());
        generateTable();
    } catch (error) {
        message.innerHTML = error.message;
        message.className = "message error";
    }
}

function handleLogout() {
    logout();
    window.location.href = LOGIN_PAGE;
}


searchText.addEventListener("input", generateTable);//change while typing
filterStatus.addEventListener("change", generateTable);
filterGrade.addEventListener("change", generateTable);

document.getElementById("paymentButton").addEventListener("click", recordNewPayment);
document.getElementById("logoutButton").addEventListener("click", handleLogout);

window.addEventListener("afterprint", function () {
    document.body.classList.remove("print-statement");
});

if (currentUser) {
    const records = getLedgerRecords();
    fillGradeFilter(records);
    if (currentUser[0].role === "admin") {
        document.getElementById("paymentSection").classList.remove("hidden");
        fillPayment(records);
    }
    generateTable();
}