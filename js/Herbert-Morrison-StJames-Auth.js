/*
    Group Members (Monday 3pm - 5pm):
    Howard Davis     - 2501971
    Abigail Williams - 2404730
    Jason Reid       - 2509405
    Alyesha Hayles   - 2507383
*/

// Key under which test accounts are stored in sessionStorage
const STORAGE_KEY = 'testLogins';

// Wrapper for reading and writing to sessionStorage
const STORAGE = {
    get: function() {
        try {
            const json = sessionStorage.getItem(STORAGE_KEY);
            if (!json) return [];
            return JSON.parse(json);
        } catch (error) {
            console.error("Cannot retrieve from STORAGE:" + error);
            return [];
        }
    },

    store: function(storageKey, value) {
        try {
            sessionStorage.setItem(storageKey, JSON.stringify(value));
        } catch(error) {
            console.error("Failed to store: " + error);
        }
    },

    remove: function(storageKey) {
        sessionStorage.removeItem(storageKey);
    }
};

// Finds a user account by email address
function findByEmail(email) {
    const arr = STORAGE.get();
    if (!arr) return null;
    return arr.find(entry => entry.email === email);
}

// Authentication — DOM element references
const errorElement    = document.getElementById('error');
const outElement      = document.getElementById('out');
const emailElement    = document.getElementById('email');
const passwordElement = document.getElementById('password');

// Validates that email and password fields are not empty and email is formatted correctly
function validInput(login) {
    if (!login.email || !login.password) throw new Error("Email and password are required.");
    const validEmail = /\S+@\S+\.\S+/;
    if (!validEmail.test(login.email)) throw new Error("Please enter a valid email");
    return login;
}

// Looks up the user by email and verifies the password
function findUser(login) {
    let search = findByEmail(login.email);
    if (!search) throw new Error("Invalid email or password");
    checkPassword(search, login);
    return search;
}

// Throws an error if the credentials do not match
function checkPassword(user, login) {
    if (user.email !== login.email || user.password !== login.password) {
        throw new Error("Invalid email or password");
    }
}

// Throws an error if the account is inactive
function checkStatus(user) {
    if (user.status === "inactive") throw new Error("This account is currently inactive. Contact your administrator.");
}

// Throws an error if the role is not recognised
function checkRole(user) {
    if (user.role === "admin") {
        // admin access granted
    } else if (user.role === "teacher") {
        // teacher access granted
    } else if (user.role === "reviewer") {
        // reviewer access granted
    } else {
        throw new Error("Invalid Role. Contact your administrator.");
    }
}

// Clears any existing session, validates credentials, and stores the logged-in user
function login(email, password) {
    sessionStorage.removeItem('CurrentUser');
    let login = {
        email: email,
        password: password,
    };
    try {
        const user = findUser(validInput(login));
        checkStatus(user);
        checkRole(user);
        STORAGE.store('CurrentUser', user);

        outElement.innerHTML  = 'Welcome back';
        errorElement.innerHTML = '';

    } catch (error) {
        outElement.innerHTML  = 'Not logged in.';
        errorElement.innerHTML = error.message;
    }
}

// Attach login handler to the form on page load
const formElement = document.getElementById('form');
if (formElement) {
    formElement.addEventListener("submit", (e) => {
        e.preventDefault();
        login(emailElement.value, passwordElement.value);
    });
} else {
    console.warn('Element with ID was not found in DOM.');
}
