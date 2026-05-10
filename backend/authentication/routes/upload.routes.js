const express = require('express');
const upload = require('../middleware/upload.middleware');
const { protect } = require('../middleware/auth.middleware');
const supabase = require('../utils/supabase');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.post('/image', protect, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  }

  try {
    const file = req.file;
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = `items/${fileName}`;

    const { data, error } = await supabase.storage
      .from('items')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('items')
      .getPublicUrl(filePath);

    res.status(200).json({
      status: 'success',
      url: publicUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
