const express = require("express");
const { userAuth } = require("../middlewares/user");
const { validateEditData, validatePassword } = require("../utils/validation");
const User = require("../models/user");
const validator = require("validator");
const bcrypt = require("bcrypt");
const Connection = require("../models/connection");

const profileRouter = express.Router();

const userData = "firstName lastName profilePhoto email phone about skills";

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw { message: "Invalid Userr!!", statusCode: 404 };
    }
    res.send(user);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditData(req)) {
      throw { message: "Update Request is not valid!!", statusCode: 405 };
    }
    const loggedInUser = req.user;
    Object.keys(req.body).forEach((k) => {
      loggedInUser[k] = req.body[k];
    });
    await loggedInUser.save();
    res.send("Update succesful!!");
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
});

profileRouter.patch("/profile/changePassword", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw { message: "All fields are required", statusCode: 404 };
    }
    const oldP = await loggedInUser.validatePassword(oldPassword);
    if (!oldP) {
      throw { message: "Old password is not correct", statusCode: 401 };
    }
    if (oldPassword === newPassword) {
      throw {
        message: "New password must be different from old password",
        statusCode: 400,
      };
    }
    validatePassword(newPassword);

    const newPasswordHash = await bcrypt.hash(
      newPassword,
      parseInt(process.env.PASS_HASH_SALT)
    );

    await loggedInUser.updateOne({ password: newPasswordHash });

    res.send("Password Updated Successfully!!");
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
});

profileRouter.get("/profile/view/:userID", async (req, res) => {
  try {
    const userID = req.params.userID;
    if (!userID) {
      throw { message: "Invalid Userr!!", statusCode: 404 };
    }
    const user = await User.findById(userID);
    res.send(user);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
});

profileRouter.get(
  "/profile/connectionRequestSent",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;

      const connectionRequestsSent = await Connection.find({
        fromUserID: loggedInUser._id,
        status: "connect",
      }).populate("toUserID", userData);

      if (connectionRequestsSent.length === 0) {
        res.send("You haven't any requests sent!!");
      } else {
        res.json({
          message: "Fetched all pending connection requests!!",
          data: connectionRequestsSent,
        });
      }
    } catch (err) {
      res.status(err.statusCode || 400).json({ message: err.message });
    }
  }
);

profileRouter.delete("/profile/delete", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    console.log("userrrrrrrrrrrr", loggedInUser);

    const dlt = await User.findByIdAndDelete(loggedInUser._id);

    res.send("User Deleted Successfully!!");
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
});

module.exports = profileRouter;
