const validator = require("validator");

const validateSignupData = (req) => {
    const { firstName, lastName, dob, gender, email, password, phone } = req.body;

    if(!firstName && !lastName) {
        throw {message: "Firtname or Lastname and must", errorCode: 406);
    }
    else if(!validator.isEmail(email)){
        throw {message: "Email is not appropriate!", errorCode: 406);
    }
    else if(!validator.isStrongPassword(password)){
        throw {message: "Password is not strong!!", errorCode: 406);
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
