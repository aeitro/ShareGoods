const express = require('express');
const profileController = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/me', profileController.getProfile);
router.patch('/update', profileController.updateProfile);
router.post('/verify-phone/request', profileController.requestPhoneVerification);
router.post('/verify-email/request', profileController.requestEmailVerification);

module.exports = router;
