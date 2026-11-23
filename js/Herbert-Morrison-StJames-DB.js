const STORAGE_K = 'testLogins';
const TRANSACTION_K = "transactions";
const STUDENT_K = "student";
const LEDGER_K =  "ledger";
const CURRENT_USER_K = "CurrentUser";

const STORAGEDB = {
    store:function(storageKey, value){
        try{
            sessionStorage.setItem(storageKey, JSON.stringify(value));
        }catch(error){
            console.error("Failed to store: " + error);
        }
    },
};

function createUser(id, email, password, role, status = "active"){
    return {
        id: id,
        email: email,
        password: password,
        role: role,
        status: status,
    };//Can add that when user is created to adds to arr
}

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
    const testUser = [
        createUser(1, "admin@example.com", "admin123", "admin"),
        createUser(2, "teacher@example.com", "teacher123", "teacher"),
        createUser(3, "inactive@example.com", "inactive123", "user", "inactive"),
    ];
    const CURRENT_USER = [ createUser(1, "admin@example.com", "admin123", "admin")];
    STORAGEDB.store(STUDENT_K, testStudents);
    STORAGEDB.store(LEDGER_K, testLedgers);
    STORAGEDB.store(CURRENT_USER_K, CURRENT_USER);
    STORAGEDB.store(STORAGE_K, testUser);
}

initTestStorage();