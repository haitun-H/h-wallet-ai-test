const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const verificationService = require('../services/verificationService');

/**
 * @route POST /v1/verification-codes
 * @desc 发送邮箱验证码
 * @access Public
 */
router.post('/', [
  body('email')
    .isEmail()
    .withMessage('邮箱格式错误')
    .normalizeEmail()
], async (req, res, next) => {
  try {
    // 验证请求参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 'USER_001',
        message: errors.array()[0].msg,
        request_id: req.requestId
      });
    }
    
    const { email } = req.body;
    
    // 发送验证码
    await verificationService.sendVerificationCode(email);
    
    res.status(200).json({
      success: true,
      message: '验证码发送成功',
      request_id: req.requestId
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
