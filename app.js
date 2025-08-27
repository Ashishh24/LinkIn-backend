require("dotenv").config();
const http = require("http");
const express = require("express");
const connectDB = require("./database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { initializeSocket } = require("./src/utils/socket");

const app = express();
const User = require("./src/models/schema");

app.use(
  cors({
    origin: "http://localhost:1234",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json()); // a middleware that converts all json to js object
app.use(cookieParser()); // Get cookie from web

const authRouter = require("./src/routesContainer/auth");
const profileRouter = require("./src/routesContainer/profile");
const requestRouter = require("./src/routesContainer/request");
const userRouter = require("./src/routesContainer/user");
const uploadRouter = require("./src/routesContainer/upload");
const messageRouter = require("./src/routesContainer/message");
const paymentRouter = require("./src/routesContainer/payment");
const postRouter = require("./src/routesContainer/post");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", uploadRouter);
app.use("/", messageRouter);
app.use("/", paymentRouter);
app.use("/", postRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("DB connected :)");
    server.listen(parseInt(process.env.PORT), () => {
      console.log("server test connected");
    });
  })
  .catch((err) => {
    console.log(err.errmsg);
    console.log("DB not connected :(");
  });
