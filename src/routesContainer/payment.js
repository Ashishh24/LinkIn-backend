const express = require("express");
const { userAuth } = require("../middlewares/user");
const instance = require("../utils/razorpay");
const Payment = require("../models/payment");
const { amount } = require("../utils/premiumAmount");

const paymentRouter = express.Router();

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const order = await instance.orders.create({
      amount: amount * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: "INR",
      receipt: "order_rcptid_11",
      notes: {
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
      },
    }); // returns a promise

    console.log(order);
    const payment = new Payment({
      userId: user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
});

module.exports = paymentRouter;
