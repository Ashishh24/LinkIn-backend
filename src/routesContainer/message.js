const express = require("express");
const userAuth = require("./auth");
const Message = require("../models/messages");

const messageRouter = express.Router();

messageRouter.get("/message/:userId/:targetUserId", userAuth, async(req, res) => {
    const { userId, targetUserId } = req.params;
    const roomId = [userId, targetUserId].sort().join("$");

    try {
        const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

module.exports = messageRouter;