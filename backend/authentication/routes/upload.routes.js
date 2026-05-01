const express = require('express');
const upload = require('../middleware/upload.middleware');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/image', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  }

  const url = `${req.protocol}://${req.get('host')}/public/uploads/${req.file.filename}`;
  
  res.status(200).json({
    status: 'success',
    url: url
  });
});

module.exports = router;
