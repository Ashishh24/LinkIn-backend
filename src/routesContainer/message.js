const express = require("express");
const { userAuth } = require("../middlewares/user");
const Message = require("../models/messages");

const messageRouter = express.Router();

messageRouter.get(
  "/message/:userId/:targetUserId",
  userAuth,
  async (req, res) => {
    const { userId, targetUserId } = req.params;
    const roomId = [userId, targetUserId].sort().join("$");

    try {
      const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  }
);

messageRouter.patch("/message/mark-read", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { senderId } = req.body;

    if (!senderId) {
      return res.status(400).json({ message: "senderId is required" });
    }

    const result = await Message.updateMany(
      { senderId, receiverId: loggedInUser._id, isRead: false },
      { $set: { isRead: true } }
    );

    if (result.matchedCount === 0) {
      return res.json({ message: "No unread messages found" });
    }

    res.json({ message: "All messages marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = messageRouter;
