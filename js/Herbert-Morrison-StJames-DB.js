const STORAGE_K = 'testLogins';

const STORAGEDB = {
    store: function(storageKey, value) {
        try {
            sessionStorage.setItem(storageKey, JSON.stringify(value));
        } catch(error) {
            console.error("Failed to store: " + error);
        }
    },
};

function createUser(id, email, password, role, status = "active") {
    return {
        id: id,
        email: email,
        password: password,
        role: role,
        status: status,
    };
}

function initTestStorage() {
    const testUsers = [
        createUser(1, "admin@herbertmorrison.edu.jm",    "admin123",    "admin"),
        createUser(2, "teacher@herbertmorrison.edu.jm",  "teacher123",  "teacher"),
        createUser(3, "reviewer@herbertmorrison.edu.jm", "reviewer123", "reviewer"),
    ];

    STORAGEDB.store(STORAGE_K, testUsers);
}

initTestStorage();
