require('dotenv').config();
const http = require("http");
const express = require("express");
const connectDB = require("../database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { initializeSocket } = require("./utils/socket")

const app = express();
const User = require("./models/schema");

app.use(cors({
    origin:"*",
    credentials: true
}));
app.use(express.json()); // a middleware that converts all json to js object
app.use(cookieParser()); // Get cookie from web

const authRouter = require("./routesContainer/auth");
const profileRouter = require("./routesContainer/profile");
const requestRouter = require("./routesContainer/request");
const userRouter = require("./routesContainer/user");
const uploadRouter = require("./routesContainer/upload");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", uploadRouter)

const server = http.createServer(app);
initializeSocket(server);

connectDB().then(() => {
    console.log("DB connected :)");
    server.listen(process.env.PORT, () => {
        console.log("server test connected");
    });
}).catch((err) => {
    console.log(err.errmsg);
    console.log("DB not connected :(");
});
