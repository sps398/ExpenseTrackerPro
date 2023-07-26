const User = require('../models/user');
const ForgotPasswordRequest = require('../models/forgotpasswordrequest');
const FilesDownloaded = require('../models/filesdownloaded');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const pageLimit = 5;

const postUserSignUp = async (req, res, next) => {
    try {
        const users = await User.find({ email: req.body.email });

        if (users[0]) return res.status(400).json({ message: "User already exist", success: false });

        const salt = await bcrypt.genSalt(10);
        let password = req.body.password;
        password = await bcrypt.hash(password, salt);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: password
        });

        await user.save();

        return res.status(200).json({ message: "You are registered successfully...", success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Some error occurred!", success: false });
    }
};

const postUserSignIn = async (req, res, next) => {
    try {
        const users = await User.find({ email: req.body.email });

        const user = users[0];

        if (!user)
            return res.status(404).json({ message: 'Error 404 : User not Found!', success: false });

        const isValidPassword = await bcrypt.compare(req.body.password, user.password);

        if (!isValidPassword) return res.status(401).json({ message: "Error 401 (Unauthorized) : Incorrect Password!", success: false });

        return res.status(200).json({
            message: "User login succesfull!", success: true,
            token: generateAccessToken({ userId: user.id, name: user.name, email: user.email, isPremium: user.isPremium })
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Some error occurred!", success: false });
    }
};

const forgotPassword = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    console.log('sending mail...');

    try {
        const email = req.body.email;

        const users = await User.find({ email });
        const user = users[0];

        if (!user)
            return res.status(400).json({ message: 'Incorrect Email', success: false });

        const requests = await ForgotPasswordRequest.find({ 'user.userId': user._id, isActive: true });

        console.log(requests);

        let request = requests[0];

        if (!request) {
            request = new ForgotPasswordRequest({
                user: {
                    userId: user._id,
                    email: user.email
                },
                isActive: true
            });

            request = await request.save({ session });
        }

        var client = SibApiV3Sdk.ApiClient.instance;

        // Configure API key authorization: api-key
        var apiKey = client.authentications['api-key'];
        apiKey.apiKey = process.env.SENDINBLUE_EMAIL_KEY;

        var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

        sendSmtpEmail = {
            sender: {
                email: 'vispsen@gmail.com',
                name: 'Ignite Pvt. Ltd.'
            },
            to: [{
                email: req.body.email,
            }],
            subject: 'Reset Password',
            htmlContent: `
            <html><head></head><body><a href="http://localhost:3000/user/password/resetpassword/${request._id.toString()}">Click on this link to reset your password</a></body></html>
            `,
            params: {
                API_KEY: process.env.SENDINBLUE_EMAIL_KEY
            },
            headers: {
                'X-Mailin-custom': 'api-key:{{params.API_KEY}}|content-type:application/json|accept:application/json'
            }
        };

        apiInstance.sendTransacEmail(sendSmtpEmail).then(async function (data) {
            await session.commitTransaction();
            session.endSession();
            console.log('API called successfully. Returned data: ' + data);
        }, function (error) {
            throw new Error(err);
        });
    } catch (err) {
        console.log(err);
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: 'Something went wrong!', success: false });
    }

}

const getResetPassword = async (req, res, next) => {
    return res.render('reset-password', { requestId: req.params.requestId, nonce1: `nonce1 + ${Math.random() * 100}`, nonce3: `nonce3 + ${Math.random() * 100}`, nonce2: `nonce2 + ${Math.random() * 100}` });
}

const postUpdatePassword = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let newPassword = req.body.newPassword;

        const salt = await bcrypt.genSalt(10);
        newPassword = await bcrypt.hash(newPassword, salt);

        const request = await ForgotPasswordRequest.findById(req.params.requestId);

        await User.findByIdAndUpdate(request.user.userId, { password: newPassword }, { session });

        request.isActive = false;

        await request.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ message: 'Password updated successfully!', success: true });

    } catch (err) {
        console.log(err);
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: "Something went wrong!", success: false });
    }
}

const getFilesDownloaded = async (req, res) => {
    try {
        const page = +req.query.page || 1;

        const result = await FilesDownloaded.find({ userId: req.user.id })
            .skip((page - 1) * pageLimit)
            .limit(pageLimit);

        const total = await FilesDownloaded.countDocuments({ userId: req.user.id });

        const pageData = {
            currentPage: page,
            hasNextPage: (page * pageLimit) < total,
            nextPage: page + 1,
            hasPreviousPage: (page > 1),
            previousPage: page - 1,
            lastPage: Math.ceil(total / pageLimit)
        }

        return res.status(200).json({ filesData: result, pageData: pageData, success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, err: err });
    }
}

const generateAccessToken = function (user) {
    console.log("authenticating..." + process.env.PRIVATE_KEY);
    const token = jwt.sign(user, process.env.PRIVATE_KEY);
    console.log(token);
    return token;
}

// async function generateNonce() {
//     try {
//       const randomBuffer = new Uint8Array(16); // 16 bytes for the nonce (adjust as needed)
//       const crypto = window.crypto || window.msCrypto; // Handle browser compatibility
//       crypto.getRandomValues(randomBuffer);
//       return btoa(String.fromCharCode(...randomBuffer));
//     } catch (error) {
//       console.error('Error generating nonce:', error.message);
//     }
//   }

module.exports = {
    postUserSignUp,
    postUserSignIn,
    forgotPassword,
    getResetPassword,
    postUpdatePassword,
    getFilesDownloaded,
    generateAccessToken
};