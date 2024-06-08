const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: String,
  title: String,
  uploadedBy: String,
  filename: String // 파일 이름 저장
});

module.exports = mongoose.model('Image', imageSchema);
