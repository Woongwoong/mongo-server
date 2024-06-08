const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Photo = require('../models/photo');
const User = require('../models/user');

const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 갤러리 페이지 라우트
router.get('/gallery', async (req, res, next) => {
  try {
    const photos = await Photo.find().populate('uploadedBy').sort({ uploadDate: -1 });
    res.render('gallery', { photos, user: req.session.user });
  } catch (err) {
    next(err);
  }
});

// 파일 업로드 라우트
router.post('/upload', upload.single('photo'), async (req, res, next) => {
  try {
    const newPhoto = new Photo({
      filename: req.file.filename,
      uploadedBy: req.session.user._id
    });
    await newPhoto.save();
    res.redirect('/gallery');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
