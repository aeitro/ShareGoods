const express = require('express');
const { classifyCondition, getNGODemandForecast } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/classify-condition', protect, classifyCondition);
router.post('/ngo/forecast', protect, getNGODemandForecast);

module.exports = router;
