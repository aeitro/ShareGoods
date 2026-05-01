const express = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const ngoAnalyticsController = require('../controllers/ngo.analytics.controller');
const driveController = require('../controllers/drive.controller');

const ngoController = require('../controllers/ngo.controller');

const router = express.Router();

// All routes here require NGO or ADMIN role
router.use(protect);
router.use(restrictTo('NGO', 'ADMIN'));

// Bulk Requests
router.post('/requests/bulk', ngoController.createBulkRequest);

// Analytics & Inventory
router.get('/analytics/demand-gap', ngoAnalyticsController.getDemandGap);
router.get('/donors', ngoAnalyticsController.getNGODonors);
router.get('/inventory', ngoAnalyticsController.getNGOInventory);

// Drives
router.post('/drives', driveController.createDrive);
router.get('/drives', driveController.getAllDrives);
router.get('/drives/:id/rsvps', driveController.getDriveRSVPs);

// RSVP for Donors (This one is special, needs different role)
router.post('/drives/:id/rsvp', restrictTo('DONOR', 'ADMIN'), driveController.rsvpToDrive);

module.exports = router;
