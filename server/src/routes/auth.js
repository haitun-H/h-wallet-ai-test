const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 发送邮箱验证码
router.post('/send-verification-code', authController.sendVerificationCode);

// 提交注册
router.post('/register', authController.register);

module.exports = router;