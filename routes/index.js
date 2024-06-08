const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Image = require('../models/Image');
const fs = require('fs');
const path = require('path');

module.exports = (upload) => {
  // 홈 라우트
  router.get('/', (req, res) => {
    if (req.session.loggedIn) {
      res.redirect('/gallery');
    } else {
      res.redirect('/login');
    }
  });

  // 로그인 라우트
  router.get('/login', (req, res) => {
    res.render('login');
  });

  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    User.findOne({ username, password }, (err, user) => {
      if (err || !user) {
        return res.redirect('/login');
      }
      req.session.loggedIn = true;
      req.session.username = username;
      res.redirect('/gallery');
    });
  });

  // 로그아웃 라우트
  router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
  });

  // 회원가입 라우트
  router.get('/register', (req, res) => {
    res.render('register');
  });

  router.post('/register', (req, res) => {
    const { username, password } = req.body;
    const newUser = new User({ username, password });
    newUser.save(err => {
      if (err) {
        return res.redirect('/register');
      }
      res.redirect('/login');
    });
  });

  // 갤러리 라우트
  router.get('/gallery', (req, res) => {
    if (!req.session.loggedIn) {
      return res.redirect('/login');
    }
    const page = parseInt(req.query.page) || 1;
    const perPage = 16;

    Image.find().skip((page - 1) * perPage).limit(perPage).exec((err, images) => {
      if (err) {
        return res.status(500).send('Error loading images');
      }
      Image.countDocuments().exec((err, count) => {
        if (err) {
          return res.status(500).send('Error counting images');
        }
        res.render('gallery', {
          images,
          page,
          totalPages: Math.ceil(count / perPage)
        });
      });
    });
  });

  // 이미지 삭제 라우트
  router.get('/delete/:id', (req, res) => {
    Image.findByIdAndDelete(req.params.id, (err, image) => {
      if (err) {
        return res.status(500).send('Error deleting image');
      }
      fs.unlink(path.join(__dirname, '../uploads', image.filename), (err) => {
        if (err) {
          console.error(err);
        }
        res.redirect('/gallery');
      });
    });
  });

  // 이미지 업로드 라우트
  router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.session.loggedIn) {
      return res.redirect('/login');
    }
    const newImage = new Image({
      url: '/uploads/' + req.file.filename,
      title: req.body.title,
      uploadedBy: req.session.username,
      filename: req.file.filename // 파일 이름 저장
    });
    newImage.save(err => {
      if (err) {
        return res.status(500).send('Error uploading image');
      }
      res.redirect('/gallery'); // 업로드 후 갤러리 페이지로 리다이렉트
    });
  });

  return router;
};
