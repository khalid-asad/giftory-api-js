const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        min: 2,
        max: 255
    },
    lastName: {
        type: String,
        required: true,
        min: 2,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    password: {
        type: String,
        required: true,
        min: 8,
        max: 1024
    },
    birthday: {
        type: Date,
        required: true,
        trim: true
    },
    isActivated: {
        type: Boolean,
        required: true,
        default: false
    },
    resetPasswordLink: {
        type: String
    },
    resetPasswordExpiry: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);