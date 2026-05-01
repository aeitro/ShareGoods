const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const savedListingController = require('../controllers/savedListing.controller');

const router = express.Router();
router.use(protect);

router.get('/my', savedListingController.getMySaved);
router.get('/check/:itemId', savedListingController.checkSaved);
router.post('/', savedListingController.saveItem);
router.delete('/:itemId', savedListingController.unsaveItem);

module.exports = router;
