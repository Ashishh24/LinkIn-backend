const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    fromUserID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["connect", "ignore", "accept", "reject"],
    },
  },
  {
    timestamps: true,
  }
);

connectionSchema.index({ fromUserID: 1 }, { toUserID: 1 });

connectionSchema.pre("save", function (next) {
  const conn = this;
  //check if fromUserId is same as toUserId:
  if (this.fromUserID.equals(this.toUserID)) {
    throw new Error("You can't send req to yourself!!");
  }
  next();
});

const Connection = new mongoose.model("Connection", connectionSchema);

module.exports = Connection;
