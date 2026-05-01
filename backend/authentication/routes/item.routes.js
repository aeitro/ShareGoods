const express = require('express');
const itemController = require('../controllers/item.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', itemController.getAllItems);
router.get('/:id', itemController.getItemById);

// Protected routes
router.use(protect);

router.post('/', restrictTo('DONOR', 'ADMIN'), itemController.createItem);
router.patch('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);
router.patch('/:id/pause', restrictTo('DONOR', 'ADMIN'), itemController.pauseItem);
router.patch('/:id/resume', restrictTo('DONOR', 'ADMIN'), itemController.resumeItem);

module.exports = router;
