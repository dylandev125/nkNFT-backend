const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    }
});

// Connects planetSchema with the "planets" collection
module.exports = mongoose.model('Register', registerSchema);
