const Razorpay = require('razorpay');
const Order = require('../models/order');
const User = require('../models/user');
const userController = require('./user');
const mongoose = require('mongoose');
const shortid = require('shortid');
require('dotenv').config();

module.exports.purchasePremium = async (req, res) => {
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        let order = await rzp.orders.create({ amount: 100, currency: "INR" });

        const newOrder = new Order({
            orderId: order.id,
            status: 'Pending',
            user: {
                userId: req.user._id,
                name: req.user.name,
                email: req.user.email
            }
        });

        await newOrder.save();

        return res.status(200).json({ order, key_id: rzp.key_id });
    } catch (err) {
        console.log(err);
        return res.status(403).json({ message: "Something went wrong", error: err });
    }
}

module.exports.updateTransactionStatus = async (req, res) => {
    try {
        const { order_id, payment_id } = req.body;

        const order = await Order.findOne({ orderId: order_id });

        if (!payment_id) {
            await Order.updateOne({ _id: order._id }, { paymentId: null, status: "FAILED" });
            return res.status(202).json({ message: "Transaction failed", success: false });
        }

        const updateStatusToSuccess = Order.updateOne({ _id: order._id }, { paymentId: payment_id, status: "SUCCESSFULL" });
        const updateUserToPremium = User.findByIdAndUpdate(req.user._id, { isPremium: true });
        Promise.all([updateStatusToSuccess, updateUserToPremium]).then(() => {
            const { id, name, email } = req.user;
            const updatedUser = {
                userId: id,
                name: name,
                email: email,
                isPremium: true
            };

            return res.status(202).json({ message: "Transaction Successfull", success: true, token: userController.generateAccessToken(updatedUser) });
        }).catch((err) => {
            throw new Error(err);
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error!", success: true });
    }
}