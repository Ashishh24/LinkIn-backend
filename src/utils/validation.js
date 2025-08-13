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
    if (!isEditAllowed) {
        throw {message: "Some fields are not allowed to be updated", statusCode: 406};
    }

    if (data.phone && !/^(\+91)?[6-9]\d{9}$/.test(data.phone)) {
        throw {message: "Invalid phone number", statusCode: 406};
    }
    
    return isEditAllowed;
}

module.exports = {validateSignupData, validateEditData};
