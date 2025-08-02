const validator = require("validator");

const validateSignupData = (req) => {
    const { firstName, lastName, dob, gender, email, password, phone } = req.body;

    if(!firstName && !lastName) {
        throw new Error("Firtname or Lastname and must")
    }
    else if(!validator.isEmail(email)){
        throw new Error("Email is not appropriate!")
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Password is not strong!!")
    }
}

const validateEditData = (req) => {
    const data = req.body;
    fieldAllowed = ["firtName", "lastName", "gender", "phone", "profilePhoto", "about", "skills"]
    isEditAllowed = Object.keys(data).every(k => fieldAllowed.includes(k));
    return isEditAllowed;
}

module.exports = {validateSignupData, validateEditData};