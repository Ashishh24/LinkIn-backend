const socket = require("socket.io");
const Message = require("../models/messages");

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin:"*",
        }
    });

    io.on("connection", (socket) => {
        console.log("⚡ New client connected:", socket.id);

        //handle events
        socket.on("joinChat", async ({ firstName, senderId, targetUserId }) => {
            const roomId = [senderId, targetUserId].sort().join("$");
            console.log(`${firstName} joined room: ${roomId}`);            
            socket.join(roomId);
            await Message.updateMany(
                { roomId, receiverId: senderId, read: false },
                { $set: { read: true } }
            );
        })

        socket.on("sendMessage", async ({ name, senderId, targetUserId, message }) => {
            const roomId = [senderId, targetUserId].sort().join("$");
            console.log(`${name}: ${message}`);
            const msg = new Message({
                roomId,
                senderId,
                receiverId: targetUserId,
                message,
                });
            await msg.save();
            console.log("message saved to db");
            io.to(roomId).emit("receivedMessage", {name, senderId, message});
        });

        socket.on("disconnect", () => {
            console.log("❌ Client disconnected:", socket.id);
        });
    })
}

module.exports = {initializeSocket}