const express = require("express");
const { userAuth } = require("../middlewares/user");
const Connection = require("../models/connection");
const User = require("../models/schema")
const userRouter = express.Router();

const userData= "firstName lastName profilePhoto email phone about skills";

userRouter.get("/user/connectionRequest", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;

        const connectionRequests = await Connection.find({
            toUserID: loggedInUser, 
            status: "connect",
        }).populate("fromUserID", userData);
        
        const data = connectionRequests.map((row) => row.fromUserID);
        
        if(data.length === 0){
            res.send("You don't have any pending requests!!")
        }

        res.json({
            message: "Fetched all pending connection requests!!",
            data: connectionRequests
        });
    }
    catch (err) {
        res.status(err.statusCode).json({message: err.message});
    }

})

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;

        const connections1 = await Connection.find({toUserID: loggedInUser, status: "accept"}).populate("fromUserID", userData);
        const connections2 = await Connection.find({fromUserID: loggedInUser, status: "accept"}).populate("toUserID", userData);
        
        const dataa1 = connections1.map((row) => row.fromUserID);
        const dataa2 = connections2.map((row) => row.toUserID);
        
        const data = [...dataa1, ...dataa2];
        
        if(data.length === 0){
            res.send("You don't have any connections :(")
        }

        res.json({
            message: "Fetched all connections!!",
            data: data
        });
    }
    catch (err) {
        res.status(err.statusCode).json({message: err.message});
    }

})

userRouter.get("/user/feed", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;

        // Pagination
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit; //set maximum limit to 50
        const skip = ( page - 1 ) * limit;
        
        const connectionRequests = await Connection.find({
            $or: [
                { fromUserID: loggedInUser._id },
                { toUserID: loggedInUser._id }
            ]
        }).select("fromUserID toUserID");
        
        const hideUsers = new Set();
        connectionRequests.forEach((req) => {
            hideUsers.add(req.fromUserID.toString());
            hideUsers.add(req.toUserID.toString());
        });

        const feedUsers = await User.find({
            $and: [
                {_id: {$nin: Array.from(hideUsers)}},
                {_id: {$ne: loggedInUser._id}},
            ]
        })
        .select(userData)         // select only fields from User Obj
        .skip(skip).limit(limit); // set skip and limit
        res.json({data: feedUsers});
    }
    catch (err) {
        res.status(err.statusCode).json({message: err.message});
    }
})

module.exports = userRouter;