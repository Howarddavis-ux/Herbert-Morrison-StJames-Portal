/*
    Group Members:
    Howard Davis    - 2501971 - Monday 3pm-5pm
    Abigail Williams - 2404730 - Monday 3pm-5pm
    Jason Reid      - 2509405 - Monday 3pm-5pm
    Alyesha Hayles  - 2507383 - Monday 3pm-5pm
*/
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
    },

    remove:function(storageKey){
        sessionStorage.removeItem(storageKey);
    }
};


function findByEmail(email) {
    const arr = STORAGE.get();
    if (!arr) return null;
    return arr.find(entry => entry.email === email);//Solved!!
}


//Authenitcation
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
}

function checkStatus(user) {
    if(user.status === "inactive") throw new Error("This account is currently inactive. Contact your administrator.");
}

function checkRole(user){
    if(user.role === "admin"){
        // admin access granted
    }else if (user.role === "teacher"){
        // teacher access granted
    }else if (user.role === "reviewer"){
        // reviewer access granted
    }else{
        throw new Error("Invalid Role. Contact your administrator.")
    }
}

function login(email, password) {
    sessionStorage.removeItem('CurrentUser');
    let login = {
        email: email,
        password: password,
    }
    try {
        const user = findUser(validInput(login));
        checkStatus(user);
        checkRole(user);
        STORAGE.store('CurrentUser', user);//can delete when logging out

        outElement.innerHTML = `Welcome back`;
        errorElement.innerHTML = '';

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