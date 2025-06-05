const Link = require('../models/link.model');
const User = require('../models/user.model');
const { ObjectId } = require('mongoose').Types; // Import for validation

exports.createLink = async (req, res) => {
    try {
        // --- עדכון עבור ספרינט 3: קבלת פרמטרי טרגוט ---
        const { originalUrl, userId, targetParamName, targetValues } = req.body;

        // Validate userId
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid User ID provided.' });
        }

        // Check if the user exists
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // --- עדכון עבור ספרינט 3: יצירת קישור עם פרמטרי טרגוט ---
        const newLink = new Link({
            originalUrl,
            userId,
            targetParamName: targetParamName || 't', // Use default 't' if not provided
            targetValues: targetValues || [] // Default to empty array if not provided
        });
        await newLink.save();

        // Add the link to the user's links array
        userExists.links.push(newLink._id);
        await userExists.save();

        // --- תיקון קריטי: הגדרת shortenedUrl באופן תקין ---
        const shortenedUrl = `${process.env.BASE_URL}/${newLink._id}`;
        console.log('Generated Shortened URL:', shortenedUrl);

        res.status(201).json({
            message: 'Link created successfully',
            link: newLink,
            shortenedUrl: shortenedUrl // שימוש במשתנה שהוגדר כרגע
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

// Get a link by ID and redirect with click tracking AND targeting
exports.getLinkByIdAndRedirect = async (req, res) => {
    try {
        const link = await Link.findById(req.params.id);
        if (!link) {
            return res.status(404).json({ message: 'Link not found' });
        }

        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // --- לוגיקת טרגוט עבור ספרינט 3 ---
        let targetParamValue = null;
        // בדוק אם יש שם פרמטר מוגדר לטרגוט בקישור, ואם הערך שלו קיים ב-query string
        if (link.targetParamName && req.query[link.targetParamName]) {
            targetParamValue = req.query[link.targetParamName];
        }
        // --- סוף לוגיקת טרגוט ---

        // Create a new click object
        const newClick = {
            insertedAt: new Date(),
            ipAddress: ipAddress,
            targetParamValue: targetParamValue // <-- שמור את ערך הטרגוט שחולץ
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

// --- פונקציה חדשה עבור ספרינט 3: אחזור קליקים מפולחים לפי טרגוט ---
exports.getLinkClicksByTarget = async (req, res) => {
    try {
        const link = await Link.findById(req.params.id);
        if (!link) {
            return res.status(404).json({ message: 'Link not found' });
        }

        // קבץ קליקים לפי targetParamValue
        const clicksByTarget = link.clicks.reduce((acc, click) => {
            const target = click.targetParamValue || 'No Target'; // השתמש ב-'No Target' לקליקים ללא פרמטר טרגוט
            acc[target] = (acc[target] || 0) + 1; // הגדל מונה
            return acc;
        }, {});

        // בנה פירוט ידידותי יותר למשתמש כולל שמות הטרגוט
        const totalClicks = link.clicks.length;
        const targetBreakdown = Object.keys(clicksByTarget).map(value => {
            const targetInfo = link.targetValues.find(tv => tv.value === value);
            return {
                targetValue: value,
                targetName: targetInfo ? targetInfo.name : 'Unknown', // השתמש בשם שסופק או 'Unknown'
                count: clicksByTarget[value]
            };
        });

        res.status(200).json({
            linkId: link._id,
            originalUrl: link.originalUrl,
            totalClicks: totalClicks,
            clicksByTarget: targetBreakdown
        });

    } catch (error) {
        console.error('Error getting link clicks by target:', error.message);
        res.status(500).json({ message: 'Server error: ' + error.message });
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