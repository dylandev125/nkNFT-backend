const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String
    }
});

// Connects planetSchema with the "planets" collection
module.exports = mongoose.model('ContactUs', registerSchema);
