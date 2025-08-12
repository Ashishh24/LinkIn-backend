const express = require("express");
const {userAuth} = require("../middlewares/user");

const Connection = require("../models/connection");
const User = require("../models/schema");

const requestRouter = express.Router();

requestRouter.post("/request/send/:status/:userID", userAuth, async (req, res) => {
    try {
        const toUserID = req.params.userID;
        const status = req.params.status;
        const fromUserID = req.user._id;

        const toUser = await User.findById(toUserID);
        if(!toUser){
            res.status(404).send("User not found!!!");
        }

        const allowed_status = ["connect", "ignore"];
        if(!allowed_status.includes(status)){
            res.status(403).send("Invalid request!!!");
        }

        const existingConnectionRequest = await Connection.findOne({ fromUserID, toUserID })
        const existingConnectionRequest2 = await Connection.findOne({ fromUserID: toUserID, toUserID: fromUserID })

        if(existingConnectionRequest){
            res.status(403).send("Connection request already sent!!!");
        }
        else if(existingConnectionRequest2){
            res.status(403).send("Connection request already exist, Please check the request list!!!");
        }
        else{
            const connection = new Connection({fromUserID, toUserID, status});
            await connection.save();
            res.send(req.user.firstName + " " + req.user.lastName + " sent a connection requet!");
        }
    }
    catch (err) {
        res.send("ERROR: " + err.message);
    }
});

requestRouter.patch("/request/review/:status/:requestID", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user._id;
        const status = req.params.status;
        const requestID = req.params.requestID;

        const allowed_status = ["accept", "reject"];
        if(!allowed_status.includes(status)){
            res.status(403).send("Invalid request!!!");
        }

        const currStatus = "connect";
        const existingConnectionRequest = await Connection.findOne({_id: requestID, toUserID: loggedInUser, status: currStatus});
        if(!existingConnectionRequest){
            res.status(404).send("Request not found!!!");
        }

        await Connection.findByIdAndUpdate( existingConnectionRequest._id, {status:status});
        
        res.send("Connection Updated!!");
    }
    catch (err) {
        res.send("ERROR: " + err.message);
    }
});

module.exports = requestRouter;