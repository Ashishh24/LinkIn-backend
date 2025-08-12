const express = require("express");
const connectDB = require("./database");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

const User = require("./src/models/schema");

app.use(cors({
    origin:"http://localhost:1234",
    credentials: true
}));
app.use(express.json()); // a middleware that converts all json to js object
app.use(cookieParser()); //Get cookie from web

const authRouter = require("./src/routesContainer/auth");
const profileRouter = require("./src/routesContainer/profile");
const requestRouter = require("./src/routesContainer/request");
const userRouter = require("./src/routesContainer/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB().then(() => {
    console.log("DB connected :)");
    app.listen(3000, () => {
        console.log("server test connected");
    });
}).catch((err) => {
    console.log(err);
    console.log("DB connected :(");
});