/**
 * 认证相关路由
 * 包含用户注册、登录、刷新token等接口
 */

const express = require('express');
const router = express.Router();

// 导入控制器
const authController = require('../controllers/authController');

// 导入中间件
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route POST /verification-codes
 * @desc 发送邮箱验证码
 * @access Public
 */
router.post('/verification-codes', authController.sendVerificationCode);

/**
 * @route POST /users
 * @desc 用户注册
 * @access Public
 */
router.post('/users', authController.registerUser);

/**
 * @route POST /auth/login
 * @desc 用户登录
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /auth/refresh
 * @desc 刷新访问令牌
 * @access Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route GET /me
 * @desc 获取当前用户信息
 * @access Private
 */
router.get('/me', authMiddleware.verifyToken, authController.getCurrentUser);

/**
 * @route GET /wallets/status
 * @desc 查询钱包创建状态
 * @access Private
 */
router.get('/wallets/status', authMiddleware.verifyToken, authController.getWalletStatus);

module.exports = router;
