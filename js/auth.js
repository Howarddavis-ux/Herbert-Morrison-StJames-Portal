//Authenitcation
const storageKey = 'testUser';

function findUser(credentials) {
    let search = findByEmail(credentials.email);
    if (!search) throw new Error("sssInvalid email or password");

    if (!checkPassword(search, credentials)) {
        throw new Error("Invalid email or password");
    }
    return search;
}
function checkPassword(user, credentials) {
    return user.email === credentials.email && user.password === credentials.password;
}

export function login(email, password) {
    const errorElement = document.getElementById('error');
    const outElement = document.getElementById('out');
    
    let credentials = {
        email: email,
        password: password,
    }
    try {
        const user = findUser(credentials);//Might redo line 5, 26 and 27
        outElement.textContent = `Welcome back`;
        errorElement.textContent = '';
    } catch (error) {
        outElement.textContent = 'Not logged in.';
        errorElement.textContent = error.message;
    }
}

//Database

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

function findByEmail(email) {
    const arr = storage.get();
    if (!arr) return null;
    return arr.find(entry => entry.email = email);
}

//Storage
export const storage = {
    get:function(){
        try{
            const json = sessionStorage.getItem(storageKey);
            if (!json) return [];

            const arr = JSON.parse(json);
            return arr;
        }catch (error){
            console.error("Cannot retrieve from storage:", error);
            return []
        }
    },

    store:function(storageKey, value){
        try{
            sessionStorage.setItem(storageKey, JSON.stringify(value));
        }catch(error){
            console.error("Failed to store:", error);
        }
    }
};
