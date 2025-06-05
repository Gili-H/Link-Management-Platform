const Link = require('../models/link.model');
const User = require('../models/user.model'); // נצטרך את מודל המשתמש כדי לקשר קישורים למשתמשים

// Create a new shortened link
exports.createLink = async (req, res) => {
    try {
        const { originalUrl, userId } = req.body; // נניח שאנחנו מקבלים גם userId
        const newLink = new Link({ originalUrl });
        await newLink.save();

        // Add the link to the user's links array
        const user = await User.findById(userId);
        if (user) {
            user.links.push(newLink._id);
            await user.save();
        }

        // The shortened URL will be constructed on the client or by the API
        // For now, just return the saved link and its ID
        res.status(201).json({
            message: 'Link created successfully',
            link: newLink,
            shortenedUrl: `${process.env.BASE_URL}/${newLink._id}` // Example, BASE_URL should be in .env
        });
    } catch (error) {
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

// Get a link by ID and redirect
exports.getLinkByIdAndRedirect = async (req, res) => {
    try {
        const link = await Link.findById(req.params.id);
        if (!link) return res.status(404).json({ message: 'Link not found' });

        // Perform the redirect
        res.redirect(302, link.originalUrl); // 302 Found for temporary redirect
    } catch (error) {
        res.status(500).json({ message: error.message });
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