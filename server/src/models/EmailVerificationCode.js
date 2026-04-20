const mongoose = require('mongoose');
const crypto = require('crypto');

const emailVerificationCodeSchema = new mongoose.Schema({
  sid: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomUUID()
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    length: 6
  },
  ip: {
    type: String,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 5 * 60 * 1000) // 5分钟后过期
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // TTL索引，10分钟后自动删除文档（单位：秒）
  }
});

// 索引
emailVerificationCodeSchema.index({ sid: 1 }, { unique: true });
emailVerificationCodeSchema.index({ email: 1, createdAt: -1 });
emailVerificationCodeSchema.index({ ip: 1, createdAt: -1 });
emailVerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerificationCode = mongoose.model('EmailVerificationCode', emailVerificationCodeSchema);

module.exports = EmailVerificationCode;