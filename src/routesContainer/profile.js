const express = require("express");
const {userAuth} = require("../middlewares/user");
const {validateEditData} = require("../utils/validation")
const User = require("../models/schema");
const validator = require("validator");
const bcrypt = require("bcrypt");
const Connection = require("../models/connection");

const profileRouter = express.Router();

const userData= "firstName lastName profilePhoto email phone about skills";

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try{
        user = req.user;
        if(!user){
            throw {message: "Invalid Userr!!", statusCode: 404};
        }
        res.send(user);
    }
    catch(err) {
        res.status(err.statusCode).json({message: err.message});
    }
})

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if(!validateEditData(req)){
            throw {message: "Update Request is not valid!!", statusCode: 405};
        }
        const loggedInUser = req.user;
        Object.keys(req.body).forEach((k) => {
            loggedInUser[k] = req.body[k];
        })
        await loggedInUser.save();
        res.send("Update succesful!!")
    }
    catch(err) {
        res.status(err.statusCode).json({message: err.message});
    }
})

profileRouter.patch("/profile/changePassword", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const {oldPassword, newPassword} = req.body;
        
        const oldP = await loggedInUser.validatePassword(oldPassword);
        if(!oldP){
            throw {message: "Old password is not correct", statusCode: 401};
        }
        newP = validator.isStrongPassword(newPassword);
        if(!newP){
            throw {message: "New Password is not strong enough!!", statusCode: 406};
        }
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        await loggedInUser.updateOne({password: newPasswordHash});

        res.send("Password Updated Successfully!!")
    }
    catch(err) {
        res.status(err.statusCode).json({message: err.message});
    }
})

profileRouter.get("/profile/view/:userID", async (req, res) => {
    try{
        user = req.params.userID;
        if(!user){
            throw {message: "Invalid Userr!!", statusCode: 404};
        }
        res.send(user);
    }
    catch(err) {
        res.status(err.statusCode).json({message: err.message});
    }
})

profileRouter.get("/profile/connectionRequestSent", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;

        const connectionRequestsSent = await Connection.find({
            fromUserID: loggedInUser._id, 
            status: "connect",
        }).populate("toUserID", userData);
        
        const data = connectionRequestsSent.map((row) => row.toUserID);
        
        if(data.length === 0){
            res.send("You haven't any requests sent!!");
        }

        res.json({
            message: "Fetched all pending connection requests!!",
            data: connectionRequestsSent
        });
    }
    catch (err) {
        res.status(err.statusCode || 400).json({message: err.message});
    }

})

module.exports = profileRouter;
