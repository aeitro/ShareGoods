const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const wishlistController = require('../controllers/wishlist.controller');

const router = express.Router();
router.use(protect);

router.get('/my', wishlistController.getMyWishlist);
router.post('/', wishlistController.createEntry);
router.patch('/:id/alert', wishlistController.toggleAlert);
router.delete('/:id', wishlistController.deleteEntry);

module.exports = router;
