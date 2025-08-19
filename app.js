require('dotenv').config();
const http = require("http");
const express = require("express");
const connectDB = require("./database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { initializeSocket } = require("./src/utils/socket")

const app = express();
const User = require("./src/models/schema");

app.use(cors({
    origin:"https://link-inn.vercel.app",
    credentials: true
}));
app.use(express.json()); // a middleware that converts all json to js object
app.use(cookieParser()); // Get cookie from web

const authRouter = require("./src/routesContainer/auth");
const profileRouter = require("./src/routesContainer/profile");
const requestRouter = require("./src/routesContainer/request");
const userRouter = require("./src/routesContainer/user");
const uploadRouter = require("./src/routesContainer/upload");

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
