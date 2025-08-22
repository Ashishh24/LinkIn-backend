const validator = require("validator");

const validateSignupData = (req) => {
    const { firstName, lastName, dob, gender, email, password, phone } = req.body;

    if(!firstName && !lastName) {
        throw {message: "Firtname or Lastname and must", statusCode: 406};
    }
    else if(!validator.isEmail(email)){
        throw {message: "Email is not appropriate!", statusCode: 406};
    }
    else if(!password || password.length < 8) {
        throw {message: "Password should atleast be of 8 characters", statusCode: 406};
    }
    else if(!validator.isStrongPassword(password)){
        throw {message: "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.", statusCode: 406};
    }
}

const validateEditData = (req) => {
    const data = req.body;
    fieldAllowed = ["firstName", "lastName", "gender", "phone", "profilePhoto", "about", "skills"]
    isEditAllowed = Object.keys(data).every(k => fieldAllowed.includes(k));
    if (!isEditAllowed) {
        throw {message: "Some fields are not allowed to be updated", statusCode: 406};
    }

    if (data.phone && data.phone.trim() !== "" && !/^(\+91)?[6-9]\d{9}$/.test(data.phone)) {
        throw {message: "Invalid phone number", statusCode: 406};
    }
    return isEditAllowed;
}

const validatePassword = (req) => {
    const {newPassword} = req.body;
    if(!password || password.length < 8) {
        throw {message: "Password should atleast be of 8 characters", statusCode: 406};
    }
    else if(!validator.isStrongPassword(password)){
        throw {message: "Password is not strong!!", statusCode: 406};
    }
}

module.exports = {validateSignupData, validateEditData, validatePassword};
