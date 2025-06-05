const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // כדי למנוע כפילויות במייל
    },
    password: {
        type: String,
        required: true
    },
    links: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Link' // הפניה למודל Link
    }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;