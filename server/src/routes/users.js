const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userService = require('../services/userService');
const authService = require('../services/authService');
const logger = require('../utils/logger');

/**
 * @route POST /v1/users
 * @desc 用户注册
 * @access Public
 */
router.post('/', [
  body('email')
    .isEmail()
    .withMessage('邮箱格式错误')
    .normalizeEmail(),
  body('verification_code')
    .matches(/^[0-9]{6}$/)
    .withMessage('验证码必须是6位数字'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('密码至少8位')
    .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
    .withMessage('密码需包含字母和数字'),
  body('confirm_password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('两次输入的密码不一致')
], async (req, res, next) => {
  try {
    // 验证请求参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      let errorCode = 'USER_001';
      
      if (firstError.param === 'password') {
        errorCode = 'USER_003';
      } else if (firstError.param === 'verification_code') {
        errorCode = 'VERIFY_001';
      }
      
      return res.status(400).json({
        code: errorCode,
        message: firstError.msg,
        request_id: req.requestId
      });
    }
    
    const { email, verification_code, password } = req.body;
    
    logger.info('处理用户注册请求', {
      requestId: req.requestId,
      email
    });
    
    // 注册用户
    const result = await userService.registerUser(email, verification_code, password);
    
    logger.info('用户注册成功', {
      requestId: req.requestId,
      userId: result.user.id,
      email
    });
    
    res.status(201).json({
      id: result.user.id,
      email: result.user.email,
      wallet_address: result.user.wallet_address,
      wallet_status: result.user.wallet_status,
      created_at: result.user.created_at,
      updated_at: result.user.updated_at,
      message: '注册成功，钱包创建中...'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
