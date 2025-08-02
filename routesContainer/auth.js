const express = require("express");
const User = require("../models/schema");
const {validateSignupData} = require("../utils/validation")
const bcrypt = require("bcrypt");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
    try {
        validateSignupData(req);

        const {firstName, lastName, email, password} = req.body;
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            firstName, lastName, email, password: passwordHash
        });
        await user.save();
        res.send("User added successfully!!");
    } catch(err) {
        res.status(402).send("User not added: " + err.message);
    }
});

authRouter.post("/login", async (req, res) => {
    try{
        const {email, password} = req.body;
        const isUser = await User.findOne({email: email});

        if(!isUser){
            throw new Error("Invalid email!!")
        }
        const isPasswordValid = await isUser.validatePassword(password);
        if(!isPasswordValid){
            throw new Error("Invalid password!!");
        }
        else{
            var token = isUser.getJWT();
            res.cookie("token", token, {
                expires: new Date(Date.now() + 8 * 3600000),
            });
            res.send("Login Successful!!!!😊");
        }
    }
    catch(err) {
        res.status(402).send("ERROR: " + err.message);
    }
});

authRouter.post("/logout", (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    });
    res.send("Logout Successful!!")
})

module.exports = authRouter;