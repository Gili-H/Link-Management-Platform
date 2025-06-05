const express = require('express');
const router = express.Router();
const linkController = require('../controllers/link.controller');

router.post('/', linkController.createLink);
router.get('/', linkController.getAllLinks);
router.get('/:id', linkController.getLinkById); // For getting link JSON data
router.get('/:id/clicks-by-target', linkController.getLinkClicksByTarget); // <-- NEW ROUTE for filtered clicks
router.put('/:id', linkController.updateLink);
router.delete('/:id', linkController.deleteLink);

// Keep the main redirect route in app.js as it handles the base URL redirection
// app.get('/:id', linkController.getLinkByIdAndRedirect); // This remains in app.js

module.exports = router;