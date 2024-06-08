// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// 사용자 로그인 라우트 예제
router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email, password: req.body.password });
    if (user) {
      req.session.user = user;
      res.redirect('/gallery');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    next(err);
  }
});

// 사용자 등록 라우트 예제
router.post('/register', async (req, res, next) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    req.session.user = savedUser;
    res.redirect('/gallery');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
