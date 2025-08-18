const socket = require("socket.io");

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin:"http://localhost:1234",
        }
    });

    io.on("connection", (socket) => {
        console.log("⚡ New client connected:", socket.id);

        //handle events
        socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
            const roomId = [userId, targetUserId].sort().join("$");
            console.log(`${firstName} joined room: ${roomId}`);
            
            socket.join(roomId);
        })

        socket.on("sendMessage", ({ name, userId, targetUserId, text }) => {
            const roomId = [userId, targetUserId].sort().join("$");
            console.log(`${name}: ${text}`);
            
            io.to(roomId).emit("receivedMessage", {name, userId, text});
        });

        socket.on("disconnect", () => {
            console.log("❌ Client disconnected:", socket.id);
        });
    })
}

module.exports = {initializeSocket}