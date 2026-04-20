const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, '邮箱不能为空'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, '邮箱格式不正确']
  },
  passwordHash: {
    type: String,
    required: [true, '密码哈希不能为空'],
    select: false // 默认查询不返回此字段
  },
  nickname: {
    type: String,
    default: function() {
      // 默认昵称为邮箱@之前的部分
      return this.email.split('@')[0];
    },
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true // 允许暂时为null，但一旦有值必须唯一
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// 索引
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ walletAddress: 1 }, { unique: true, sparse: true });

const User = mongoose.model('User', userSchema);

module.exports = User;