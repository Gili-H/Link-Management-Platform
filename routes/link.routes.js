const express = require('express');
const router = express.Router();
const linkController = require('../controllers/link.controller');


router.post('/', linkController.createLink); // Create a new shortened link
router.get('/', linkController.getAllLinks); // Get all links
router.get('/:id', linkController.getLinkById); // <-- חדש! (או עדכון) - לקבלת נתוני קישור לפי ID
router.put('/:id', linkController.updateLink); // Update a link
router.delete('/:id', linkController.deleteLink); // Delete a link

module.exports = router;