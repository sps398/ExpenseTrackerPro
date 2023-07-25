const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forgotPasswordRequestSchema = new Schema({
    user: {
        userId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    isActive: Boolean
});

const ForgotPasswordRequest = mongoose.model('ForgotPasswordRequest', forgotPasswordRequestSchema);


module.exports = ForgotPasswordRequest;