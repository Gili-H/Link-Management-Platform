const Link = require('../models/link.model');
const User = require('../models/user.model');
const { ObjectId } = require('mongoose').Types; // Import for validation

exports.createLink = async (req, res) => {
    try {
        const { originalUrl, userId } = req.body;

        // Validate userId
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid User ID provided.' });
        }

        // Check if the user exists
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const newLink = new Link({ originalUrl, userId });
        await newLink.save();

        // Add the link to the user's links array
        userExists.links.push(newLink._id);
        await userExists.save();

        // *** FIX THIS LINE: Define shortenedUrl correctly using a template literal ***
        const shortenedUrl = `<span class="math-inline">\{process\.env\.BASE\_URL\}/</span>{newLink._id}`; console.log('Generated Shortened URL:', shortenedUrl);

        res.status(201).json({
            message: 'Link created successfully',
            link: newLink,
            shortenedUrl: `${process.env.BASE_URL}/${newLink._id}` // השורה הזו היא המקור לבעיה אם היא לא נכתבה נכון אצלך.
        });
    } catch (error) {
        console.error('Error creating link:', error.message);
        res.status(400).json({ message: error.message });
    }
};

// Get all links
exports.getAllLinks = async (req, res) => {
    try {
        const links = await Link.find();
        res.status(200).json(links);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLinkById = async (req, res) => {
    try {
        const link = await Link.findById(req.params.id);
        if (!link) {
            return res.status(404).json({ message: 'Link not found' });
        }
        res.status(200).json(link); // Return the link object as JSON
    } catch (error) {
        console.error('Error fetching link by ID:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// Get a link by ID and redirect with click tracking
exports.getLinkByIdAndRedirect = async (req, res) => {
    try {
        const link = await Link.findById(req.params.id);
        if (!link) {
            return res.status(404).json({ message: 'Link not found' });
        }

        // Get IP address from the request
        // req.ip works well for localhost. For deployed apps behind proxy,
        // req.headers['x-forwarded-for'] is often preferred.
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // Create a new click object
        const newClick = {
            insertedAt: new Date(),
            ipAddress: ipAddress
        };

        // Add the new click to the link's clicks array
        link.clicks.push(newClick);

        // Save the updated link document
        await link.save();

        // Perform the redirect (302 Found for temporary redirect)
        res.redirect(302, link.originalUrl);

    } catch (error) {
        console.error('Error in getLinkByIdAndRedirect:', error.message); // Log full error
        res.status(500).json({ message: 'Server error: ' + error.message }); // Return 500 for server issues
    }
};


// Update a link
exports.updateLink = async (req, res) => {
    try {
        const { originalUrl } = req.body;
        const updatedLink = await Link.findByIdAndUpdate(
            req.params.id,
            { originalUrl },
            { new: true }
        );
        if (!updatedLink) return res.status(404).json({ message: 'Link not found' });
        res.status(200).json(updatedLink);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a link
exports.deleteLink = async (req, res) => {
    try {
        const deletedLink = await Link.findByIdAndDelete(req.params.id);
        if (!deletedLink) return res.status(404).json({ message: 'Link not found' });

        // Optional: Remove the link ID from any user's links array
        await User.updateMany(
            { links: deletedLink._id },
            { $pull: { links: deletedLink._id } }
        );

        res.status(200).json({ message: 'Link deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};