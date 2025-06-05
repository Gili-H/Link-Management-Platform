const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true
    }
    // _id ייווצר אוטומטית על ידי MongoDB
});

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;