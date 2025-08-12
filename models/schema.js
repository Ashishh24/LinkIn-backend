const mongoose = require("mongoose");
var validator = require('validator');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function get18YearsAgoDate() {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 18);
  return today;
}

const schema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 20,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 20,
        trim: true,
    },
    dob: {
        type: Date,
        max: [get18YearsAgoDate(), 'User must be at least 18 years old.']
    },
    gender: {
        type: String,
        enum: ["Male", "Female"]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error("invalid email!!")
            }
        },
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            return (
                validator.isStrongPassword(value, {
                    minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
                })
            );
        }
    },
    phone: {
        type: Number,
        min: 1000000000,
        max: 10000000000,
    },
    profilePhoto: {
        type: String,
        default: "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg",
    },
    about: {
        type: String,
    },
    skills: {
        type: [String] // array of strings
    },
},
{
    timestamps: true,
});

schema.methods.getJWT = function() {
    const user = this;
    const jwtToken = jwt.sign({ _id: user._id }, 'Link@in@1804', { expiresIn: '1d' });
    return jwtToken;
}

schema.methods.validatePassword = async function(passwordByUserInput) {
    const user = this;
    const passowrdHash = user.password
    const isPasswordValid = await bcrypt.compare(passwordByUserInput, passowrdHash);
    return isPasswordValid;
}

const User = mongoose.model("User", schema);

module.exports = User;