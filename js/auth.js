import { findByEmail } from "../js/database.js";

function findUser(user){
    let search = findByEmail(user.email);
    if (!search) throw new Error("Invalid email or password");
    return search;
}