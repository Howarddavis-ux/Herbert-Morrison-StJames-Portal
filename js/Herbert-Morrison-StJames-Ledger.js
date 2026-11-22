const TRANSACTION_KEY = "transactions";
const STUDENT_KEY = "student";
const LEDGER_KEY =  "ledger";
const CURRENT_USER_KEY = "CurrentUser";

//Storage
const STORAGE = {
    get:function(){
        try{
            const json = localStorage.getItem(STORAGE_KEY);
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

/*
Student:
id
First and Last Name
Age 
Grade 
Term

Ledger:
studentId
tuition
amountPaid
balance
*/

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
    STORAGE.store(STUDENT_KEY, testStudents);
    STORAGE.store(LEDGER_KEY, testLedgers);
}

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
        const student = student[i];
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
    const entry =  arr.find(entry => entry.studenId === studentId);

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
    if (!currentUser || currentUser.role !== "admin"){
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