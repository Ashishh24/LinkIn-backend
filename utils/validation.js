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
    fieldAllowed = ["firstName", "lastName", "gender", "phone", "profilePhoto", "about", "skills"]
    isEditAllowed = Object.keys(data).every(k => fieldAllowed.includes(k));
    console.log(isEditAllowed);
    
    return isEditAllowed;
}

module.exports = {validateSignupData, validateEditData};