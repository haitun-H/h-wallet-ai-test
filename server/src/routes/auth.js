const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route POST /v1/auth/login
 * @desc 用户登录
 * @access Public
 */
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('邮箱格式错误')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 'USER_001',
      message: errors.array()[0].msg,
      request_id: req.requestId
    });
  }
  next();
}, authController.login);

/**
 * @route POST /v1/auth/refresh
 * @desc 刷新访问令牌
 * @access Public
 */
router.post('/refresh', [
  body('refresh_token')
    .notEmpty()
    .withMessage('refresh_token不能为空')
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 'AUTH_002',
      message: errors.array()[0].msg,
      request_id: req.requestId
    });
  }
  next();
}, authController.refreshToken);

module.exports = router;
