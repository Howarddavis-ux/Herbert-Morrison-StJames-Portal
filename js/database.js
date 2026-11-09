import { storage } from "../js/storage.js";
const storageKey = 'testUser';

function createUser(id, email, password, role, status = "active"){
    return {
        id: id,
        email: email,
        password: password,
        role: role,
        status: status,
    };
}

export function initTestStorage(){
    const testUser = [
        createUser(1, "admin@example.com", "admin123", "admin"),
        createUser(2, "user@example.com", "user123", "user"),
        createUser(3, "inactive@example.com", "inactive123", "user", "inactive"),
    ];
    storage.store(storageKey, testUser);
}

export function findByEmail(email){
    const arr = storage.get();
    if (!arr) return [];
    console.log(arr.find(entry => entry.email = email));
}

