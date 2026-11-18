//Howard Davis, 2501971, auth.j
//Storage
const STORAGE_KEY = 'testLogins';
const STORAGE = {
    get:function(){
        try{
            const json = sessionStorage.getItem(STORAGE_KEY);
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
            sessionStorage.setItem(storageKey, JSON.stringify(value));
        }catch(error){
            console.error("Failed to store: " + error);
        }
    }
};


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

function initTestStorage(){
    const testUser = [
        createUser(1, "admin@example.com", "admin123", "admin"),
        createUser(2, "teacher@example.com", "teacher123", "teacher"),
        createUser(3, "inactive@example.com", "inactive123", "user", "inactive"),
    ];
    STORAGE.store(STORAGE_KEY, testUser);
}

function findByEmail(email) {
    const arr = STORAGE.get();
    if (!arr) return null;
    return arr.find(entry => entry.email === email);//Solved!!
}


//Authenitcation
initTestStorage(); 

const errorElement = document.getElementById('error');
const outElement = document.getElementById('out');
const emailElement = document.getElementById('email');
const passwordElement = document.getElementById('password');

function validInput(login){
    if(!login.email || !login.password) throw new Error("Email and password are required.");
    const validEmail =  /\S+@\S+\.\S+/;
    if (!validEmail.test(login.email)) throw new Error("Please enter a valid email");
    return login;
}

function findUser(login) {
    let search = findByEmail(login.email);
    if (!search) throw new Error("Invalid email or password");

    checkPassword(search, login)
    return search; 
}

function checkPassword(user, login) {
    if (user.email !== login.email || user.password !== login.password) {
        throw new Error("Invalid email or password");
    }
    //Possible return user;
}

function checkStatus(user) {
    if(user.status === "inactive") throw new Error("This account is currently inactive. Contact your administrator.");
}

function checkRole(user){
    if(user.role === "admin"){
        console.warn("weeeeeee");
    }else if (user.role === "teacher"){

    }else{
        throw new Error("Invalid Role. Contact your administrator.")
    }
}

function login(email, password) {
    let login = {
        email: email,
        password: password,
    }
    try {
        const user = findUser(validInput(login));
        checkStatus(user);
        checkRole(user);

        outElement.innerHTML = `Welcome back`;
        errorElement.innerHTML = '';
        console.log(user);

    } catch (error) {
        outElement.innerHTML = 'Not logged in.';
        errorElement.innerHTML = error.message;
    }
}

const formElement = document.getElementById('form');
if (formElement) {
    formElement.addEventListener("submit", (e) => {
        e.preventDefault();
        login(emailElement.value, passwordElement.value);
    });
} else {
    console.warn('Element with ID was not found in DOM.');
}