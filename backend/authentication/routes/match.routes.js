const express = require('express');
const matchController = require('../controllers/match.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/request', restrictTo('INDIVIDUAL', 'NGO', 'ADMIN'), matchController.requestItem);
router.post('/bulk-request', restrictTo('NGO', 'ADMIN'), matchController.bulkRequest);
router.get('/', matchController.getMatches);
router.get('/:id', matchController.getMatchById);
router.patch('/:id/schedule', matchController.scheduleHandover);
router.patch('/:id/urgency', matchController.setUrgency);
router.post('/:id/confirm-handover', matchController.confirmHandover);
router.patch('/:id', matchController.updateMatchStatus);

module.exports = router;
