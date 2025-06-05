const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true
    },
    userId: { // Add this field to link the link to a user
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the 'User' model
        required: true // Assuming a link must belong to a user
    },
    clicks: [ // This makes 'clicks' an array of objects
        {
            insertedAt: {
                type: Date,
                default: Date.now // Timestamp of the click
            },
            ipAddress: {
                type: String // IP address of the user
            }
        }
    ]
}, {
    timestamps: true // Optional: Adds createdAt and updatedAt timestamps
});

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;