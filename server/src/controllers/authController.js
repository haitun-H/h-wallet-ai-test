/**
 * 认证控制器
 * 处理认证相关的HTTP请求和响应
 */

const authService = require('../services/authService');
const verificationService = require('../services/verificationService');
const okxWalletService = require('../services/okxWalletService');
const logger = require('../utils/logger');

/**
 * 发送邮箱验证码
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express next函数
 */
const sendVerificationCode = async (req, res, next) => {
  try {
    const { email } = req.body;
    const requestId = req.requestId;
    
    logger.info('收到发送验证码请求', { email, request_id: requestId });
    
    // 验证邮箱格式
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        code: 'USER_001',
        message: '邮箱格式错误',
        request_id: requestId
      });
    }
    
    // 发送验证码
    const result = await verificationService.sendVerificationCode(email, requestId);
    
    // 返回成功响应
    res.status(200).json({
      success: true,
      message: '验证码发送成功',
      request_id: requestId
    });
    
  } catch (error) {
    logger.error('发送验证码失败', {
      error: error.message,
      request_id: req.requestId
    });
    
    // 处理冷却时间错误
    if (error.code === 'VERIFY_003') {
      return res.status(429).json({
        code: 'VERIFY_003',
        message: error.message,
        request_id: req.requestId,
        details: { retry_after: error.retryAfter }
      });
    }
    
    // 其他错误
    next(error);
  }
};

/**
 * 用户注册
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express next函数
 */
const registerUser = async (req, res, next) => {
  try {
    const { email, verification_code, password, confirm_password } = req.body;
    const requestId = req.requestId;
    
    logger.info('收到用户注册请求', { email, request_id: requestId });
    
    // 验证请求参数
    if (!email || !verification_code || !password || !confirm_password) {
      return res.status(400).json({
        code: 'COMMON_001',
        message: '缺少必要参数',
        request_id: requestId
      });
    }
    
    // 验证邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        code: 'USER_001',
        message: '邮箱格式错误',
        request_id: requestId
      });
    }
    
    // 验证验证码格式
    if (!/^[0-9]{6}$/.test(verification_code)) {
      return res.status(400).json({
        code: 'VERIFY_001',
        message: '验证码格式错误，应为6位数字',
        request_id: requestId
      });
    }
    
    // 验证密码复杂度
    if (password.length < 8 || !/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      return res.status(400).json({
        code: 'USER_003',
        message: '密码需至少8位，包含字母和数字',
        request_id: requestId
      });
    }
    
    // 验证密码一致性
    if (password !== confirm_password) {
      return res.status(400).json({
        code: 'COMMON_001',
        message: '密码和确认密码不一致',
        request_id: requestId
      });
    }
    
    // 调用服务层进行注册
    const result = await authService.registerUser(
      email,
      verification_code,
      password,
      requestId
    );
    
    // 返回成功响应（根据PRD要求，注册成功后自动登录并返回token）
    res.status(201).json({
      id: result.user.id,
      email: result.user.email,
      wallet_address: result.user.wallet_address,
      wallet_status: result.user.wallet_status,
      created_at: result.user.created_at,
      updated_at: result.user.updated_at,
      message: '注册成功，钱包创建中...',
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_in: result.expires_in,
      token_type: result.token_type
    });
    
  } catch (error) {
    logger.error('用户注册失败', {
      error: error.message,
      request_id: req.requestId
    });
    
    // 处理特定业务错误
    if (error.code === 'USER_002') {
      return res.status(409).json({
        code: 'USER_002',
        message: error.message,
        request_id: req.requestId
      });
    }
    
    if (error.code === 'VERIFY_001') {
      return res.status(400).json({
        code: 'VERIFY_001',
        message: error.message,
        request_id: req.requestId
      });
    }
    
    if (error.code === 'VERIFY_002') {
      return res.status(400).json({
        code: 'VERIFY_002',
        message: error.message,
        request_id: req.requestId
      });
    }
    
    // 其他错误
    next(error);
  }
};

/**
 * 用户登录
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express next函数
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const requestId = req.requestId;
    
    logger.info('收到用户登录请求', { email, request_id: requestId });
    
    // 验证请求参数
    if (!email || !password) {
      return res.status(400).json({
        code: 'COMMON_001',
        message: '缺少必要参数',
        request_id: requestId
      });
    }
    
    // 验证邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        code: 'USER_001',
        message: '邮箱格式错误',
        request_id: requestId
      });
    }
    
    // 调用服务层进行登录
    const result = await authService.login(email, password, requestId);
    
    // 返回成功响应
    res.status(200).json({
      user: {
        id: result.user.id,
        email: result.user.email,
        wallet_address: result.user.wallet_address,
        wallet_status: result.user.wallet_status,
        created_at: result.user.created_at,
        updated_at: result.user.updated_at
      },
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_in: result.expires_in,
      token_type: result.token_type
    });
    
  } catch (error) {
    logger.error('用户登录失败', {
      error: error.message,
      request_id: req.requestId
    });
    
    // 处理认证失败错误
    if (error.code === 'AUTH_001') {
      return res.status(401).json({
        code: 'AUTH_001',
        message: error.message,
        request_id: req.requestId
      });
    }
    
    // 其他错误
    next(error);
  }
};

/**
 * 刷新访问令牌
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express next函数
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    const requestId = req.requestId;
    
    logger.info('收到刷新token请求', { request_id: requestId });
    
    // 验证请求参数
    if (!refresh_token) {
      return res.status(400).json({
        code: 'COMMON_001',
        message: '缺少refresh_token参数',
        request_id: requestId
      });
    }
    
    // 调用服务层刷新token
    const result = await authService.refreshToken(refresh_token, requestId);
    
    // 返回成功响应
    res.status(200).json({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_in: result.expires_in,
      token_type: result.token_type
    });
    
  } catch (error) {
    logger.error('刷新token失败', {
      error: error.message,
      request_id: req.requestId
    });
    
    // 处理token无效错误
    if (error.code === 'AUTH_001' || error.code === 'AUTH_002') {
      return res.status(401).json({
        code: error.code,
        message: error.message,
        request_id: req.requestId
      });
    }
    
    // 其他错误
    next(error);
  }
};

/**
 * 获取当前用户信息
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express next函数
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    const requestId = req.requestId;
    
    logger.info('收到获取用户信息请求', { userId, request_id: requestId });
    
    // 调用服务层获取用户信息
    const user = await authService.getUserById(userId, requestId);
    
    // 返回成功响应
    res.status(200).json({
      id: user.id,
      email: user.email,
      wallet_address: user.wallet_address,
      wallet_status: user.wallet_status,
      created_at: user.created_at,
      updated_at: user.updated_at
    });
    
  } catch (error) {
    logger.error('获取用户信息失败', {
      error: error.message,
      request_id: req.requestId
    });
    
    // 处理用户不存在错误
    if (error.code === 'USER_004') {
      return res.status(404).json({
        code: 'USER_004',
        message: error.message,
        request_id: req.requestId
      });
    }
    
    // 其他错误
    next(error);
  }
};

/**
 * 查询钱包创建状态
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express next函数
 */
const getWalletStatus = async (req, res, next) => {
  try {
    const userId = req.userId;
    const requestId = req.requestId;
    
    logger.info('收到查询钱包状态请求', { userId, request_id: requestId });
    
    // 调用服务层获取钱包状态
    const walletStatus = await okxWalletService.getWalletStatusByUserId(userId, requestId);
    
    // 返回成功响应
    res.status(200).json({
      wallet_address: walletStatus.wallet_address,
      status: walletStatus.status,
      created_at: walletStatus.created_at,
      updated_at: walletStatus.updated_at,
      error_message: walletStatus.error_message
    });
    
  } catch (error) {
    logger.error('查询钱包状态失败', {
      error: error.message,
      request_id: req.requestId
    });
    
    // 处理钱包不存在错误
    if (error.code === 'WALLET_002') {
      return res.status(404).json({
        code: 'WALLET_002',
        message: error.message,
        request_id: req.requestId
      });
    }
    
    // 其他错误
    next(error);
  }
};

module.exports = {
  sendVerificationCode,
  registerUser,
  login,
  refreshToken,
  getCurrentUser,
  getWalletStatus
};
