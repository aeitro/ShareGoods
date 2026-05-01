const express = require('express');
const adminController = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(protect);
router.use(restrictTo('ADMIN'));

// Stats
router.get('/stats', adminController.getStats);

// User management
router.get('/users', adminController.getAllUsers);
router.post('/users/:id/suspend', adminController.suspendUser);
router.post('/users/:id/reinstate', adminController.reinstateUser);
router.delete('/users/:id', adminController.deleteUser);

// NGO Verification
router.get('/ngo-queue', adminController.getNGOQueue);
router.post('/ngo/:id/approve', adminController.approveNGO);
router.post('/ngo/:id/reject', adminController.rejectNGO);

// Reports & Moderation
router.get('/reports', adminController.getReports);
router.patch('/reports/:id', adminController.resolveReport);
router.patch('/items/:id/takedown', adminController.toggleItemStatus);

module.exports = router;
