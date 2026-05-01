const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { getMyKarma, getMyImpact, getCertificate, getReceivedHistory } = require('../controllers/karma.controller');

const router = express.Router();
router.use(protect);

router.get('/karma/my', getMyKarma);
router.get('/impact/my', getMyImpact);
router.get('/impact/received', getReceivedHistory);
router.get('/impact/certificate/:matchId', getCertificate);

module.exports = router;
