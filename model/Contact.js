const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 2,
        max: 255
    },
    birthday: {
        type: Date,
        required: true,
        trim: true
    }
});

module.exports = mongoose.model('Contact', userSchema);