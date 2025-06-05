const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true
    },
    userId: { // This should have been added in Sprint 2, ensure it's here.
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clicks: [ // This should have been updated in Sprint 2, ensure it's here.
        {
            insertedAt: {
                type: Date,
                default: Date.now
            },
            ipAddress: {
                type: String
            },
            targetParamValue: { // <-- New field for Sprint 3
                type: String,
                default: null // Will be null if no target parameter is found
            }
        }
    ],
    targetParamName: { // <-- New field for Sprint 3
        type: String,
        default: 't' // Default to 't' as per requirements, but can be changed by user
    },
    targetValues: [ // <-- New field for Sprint 3
        {
            name: { // E.g., "Facebook Ads", "Google Search"
                type: String,
                required: true
            },
            value: { // E.g., "fb", "google" - the actual value in the URL query string
                type: String,
                required: true
            },
            _id: false // Prevents Mongoose from creating default _id for sub-documents in this array if not needed
        }
    ]
}, {
    timestamps: true // Optional: Adds createdAt and updatedAt timestamps
});

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;