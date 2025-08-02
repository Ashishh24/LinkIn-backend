const express = require("express");
const {userAuth} = require("../middlewares/user");
const {validateEditData} = require("../utils/validation")
const User = require("../models/schema");
const validator = require("validator");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try{
        user = req.user;
        if(!user){
            throw new Error("Invalid Userr!!")
        }
        res.send(user);
    }
    catch(err) {
        res.status(402).send("ERROR: " + err.message);
    }
})

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if(!validateEditData(req)){
            throw new Error("Update Request is not valid!!")
        }
        const loggedInUser = req.user;
        Object.keys(req.body).forEach((k) => {
            loggedInUser[k] = req.body[k];
        })
        await loggedInUser.save();
        res.send("Update succesful!!")
    }
    catch(err) {
        res.status(400).send("user update failed: " + err.message);
    }
})

profileRouter.patch("/profile/changePassword", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const {oldPassword, newPassword} = req.body;
        
        const oldP = await loggedInUser.validatePassword(oldPassword);
        if(!oldP){
            throw new Error("Old password is not correct!")
        }
        newP = validator.isStrongPassword(newPassword);
        if(!newP){
            throw new Error("New Password is not strong enough!!")
        }
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        await loggedInUser.updateOne({password: newPasswordHash});

        res.send("Password Updated Successfully!!")
    }
    catch(err) {
        res.status(400).send("PASSWORD UPDATE FAILED: " + err.message);
    }
})

// profileRouter.get("/profile/view/:userID", userAuth, async (req, res) => {
//     try{
//         user = req.params.userID;
//         if(!user){
//             throw new Error("Invalid Userr!!")
//         }
//         res.send(user);
//     }
//     catch(err) {
//         res.status(402).send("ERROR: " + err.message);
//     }
// })

module.exports = profileRouter;