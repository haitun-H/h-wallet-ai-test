/**
 * 认证服务
 * 处理用户认证、注册、登录等业务逻辑
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const verificationService = require('./verificationService');
const okxWalletService = require('./okxWalletService');
const logger = require('../utils/logger');

// 内存存储（MVP阶段使用，生产环境需替换为数据库）
const users = new Map(); // key: userId, value: user object
const emailToUserId = new Map(); // key: email, value: userId
const refreshTokens = new Map(); // key: refreshToken, value: { userId, expiresAt }

// JWT 配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-at-least-32-characters-long';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * 用户注册服务
 * @param {string} email - 用户邮箱
 * @param {string} verificationCode - 验证码
 * @param {string} password - 密码
 * @param {string} requestId - 请求ID
 * @returns {Promise<Object>} 注册结果
 */
const registerUser = async (email, verificationCode, password, requestId) => {
  try {
    logger.info('开始用户注册流程', { email, request_id: requestId });
    
    // 1. 验证验证码
    await verificationService.verifyCode(email, verificationCode, requestId);
    
    // 2. 检查邮箱是否已注册
    if (emailToUserId.has(email)) {
      const error = new Error('邮箱已注册');
      error.code = 'USER_002';
      throw error;
    }
    
    // 3. 创建用户
    const user = await createUser(email, password, requestId);
    
    // 4. 生成JWT令牌（自动登录）
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // 5. 存储refresh token
    storeRefreshToken(refreshToken, user.id);
    
    // 6. 异步触发钱包创建任务
    const walletTask = okxWalletService.addWalletCreationTask(user.id, requestId);
    
    logger.info('钱包创建任务已触发', {
      userId: user.id,
      taskId: walletTask.id,
      request_id: requestId
    });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        wallet_address: user.wallet_address,
        wallet_status: user.wallet_status,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 7 * 24 * 60 * 60, // 7天
      token_type: 'Bearer'
    };
    
  } catch (error) {
    logger.error('用户注册失败', {
      email,
      error: error.message,
      request_id: requestId
    });
    throw error;
  }
};

/**
 * 创建用户
 * @param {string} email - 用户邮箱
 * @param {string} password - 密码
 * @param {string} requestId - 请求ID
 * @returns {Promise<Object>} 用户对象
 */
const createUser = async (email, password, requestId) => {
  try {
    // 生成用户ID
    const userId = uuidv4();
    
    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // 创建用户对象
    const user = {
      id: userId,
      email: email.toLowerCase(),
      password: hashedPassword,
      wallet_address: null,
      wallet_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 存储用户
    users.set(userId, user);
    emailToUserId.set(email.toLowerCase(), userId);
    
    logger.info('用户创建成功', {
      userId,
      email,
      request_id: requestId
    });
    
    return user;
    
  } catch (error) {
    logger.error('创建用户失败', {
      email,
      error: error.message,
      request_id: requestId
    });
    throw error;
  }
};

/**
 * 用户登录服务
 * @param {string} email - 用户邮箱
 * @param {string} password - 密码
 * @param {string} requestId - 请求ID
 * @returns {Promise<Object>} 登录结果
 */
const login = async (email, password, requestId) => {
  try {
    logger.info('开始用户登录流程', { email, request_id: requestId });
    
    // 1. 查找用户
    const userId = emailToUserId.get(email.toLowerCase());
    if (!userId) {
      const error = new Error('邮箱或密码错误');
      error.code = 'AUTH_001';
      throw error;
    }
    
    const user = users.get(userId);
    if (!user) {
      const error = new Error('邮箱或密码错误');
      error.code = 'AUTH_001';
      throw error;
    }
    
    // 2. 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('邮箱或密码错误');
      error.code = 'AUTH_001';
      throw error;
    }
    
    // 3. 生成JWT令牌
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // 4. 存储refresh token
    storeRefreshToken(refreshToken, user.id);
    
    logger.info('用户登录成功', {
      userId: user.id,
      email: user.email,
      request_id: requestId
    });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        wallet_address: user.wallet_address,
        wallet_status: user.wallet_status,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 7 * 24 * 60 * 60, // 7天
      token_type: 'Bearer'
    };
    
  } catch (error) {
    logger.error('用户登录失败', {
      email,
      error: error.message,
      request_id: requestId
    });
    throw error;
  }
};

/**
 * 生成访问令牌
 * @param {Object} user - 用户对象
 * @returns {string} JWT token
 */
const generateAccessToken = (user) => {
  const payload = {
    sub: user.id,
    email: user.email,
    type: 'access'
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
    algorithm: 'HS256'
  });
};

/**
 * 生成刷新令牌
 * @param {Object} user - 用户对象
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    sub: user.id,
    email: user.email,
    type: 'refresh'
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    algorithm: 'HS256'
  });
};

/**
 * 存储刷新令牌
 * @param {string} refreshToken - 刷新令牌
 * @param {string} userId - 用户ID
 */
const storeRefreshToken = (refreshToken, userId) => {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30天后过期
  refreshTokens.set(refreshToken, {
    userId: userId,
    expiresAt: expiresAt
  });
  
  // 清理过期token（简单实现）
  cleanupExpiredRefreshTokens();
};

/**
 * 清理过期的刷新令牌
 */
const cleanupExpiredRefreshTokens = () => {
  const now = new Date();
  for (const [token, data] of refreshTokens.entries()) {
    if (data.expiresAt < now) {
      refreshTokens.delete(token);
    }
  }
};

/**
 * 刷新令牌服务
 * @param {string} refreshToken - 刷新令牌
 * @param {string} requestId - 请求ID
 * @returns {Promise<Object>} 新的token对
 */
const refreshToken = async (refreshToken, requestId) => {
  try {
    logger.info('开始刷新token流程', { request_id: requestId });
    
    // 1. 验证refresh token是否存在且未过期
    const tokenData = refreshTokens.get(refreshToken);
    if (!tokenData) {
      const error = new Error('refresh_token无效或过期');
      error.code = 'AUTH_001';
      throw error;
    }
    
    const now = new Date();
    if (tokenData.expiresAt < now) {
      refreshTokens.delete(refreshToken);
      const error = new Error('refresh_token无效或过期');
      error.code = 'AUTH_001';
      throw error;
    }
    
    // 2. 验证JWT签名
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (jwtError) {
      refreshTokens.delete(refreshToken);
      const error = new Error('refresh_token无效或过期');
      error.code = 'AUTH_001';
      throw error;
    }
    
    // 3. 验证token类型
    if (decoded.type !== 'refresh') {
      const error = new Error('token类型错误');
      error.code = 'AUTH_002';
      throw error;
    }
    
    // 4. 查找用户
    const user = users.get(decoded.sub);
    if (!user) {
      const error = new Error('用户不存在');
      error.code = 'USER_004';
      throw error;
    }
    
    // 5. 生成新的token对
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    // 6. 删除旧的refresh token，存储新的
    refreshTokens.delete(refreshToken);
    storeRefreshToken(newRefreshToken, user.id);
    
    logger.info('token刷新成功', {
      userId: user.id,
      request_id: requestId
    });
    
    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_in: 7 * 24 * 60 * 60, // 7天
      token_type: 'Bearer'
    };
    
  } catch (error) {
    logger.error('刷新token失败', {
      error: error.message,
      request_id: requestId
    });
    throw error;
  }
};

/**
 * 根据用户ID获取用户信息
 * @param {string} userId - 用户ID
 * @param {string} requestId - 请求ID
 * @returns {Promise<Object>} 用户对象
 */
const getUserById = async (userId, requestId) => {
  try {
    const user = users.get(userId);
    if (!user) {
      const error = new Error('用户不存在');
      error.code = 'USER_004';
      throw error;
    }
    
    // 返回用户信息（不包含密码）
    return {
      id: user.id,
      email: user.email,
      wallet_address: user.wallet_address,
      wallet_status: user.wallet_status,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
    
  } catch (error) {
    logger.error('获取用户信息失败', {
      userId,
      error: error.message,
      request_id: requestId
    });
    throw error;
  }
};

/**
 * 验证JWT令牌
 * @param {string} token - JWT令牌
 * @returns {Object} 解码后的token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const jwtError = new Error('Token已过期');
      jwtError.code = 'AUTH_001';
      throw jwtError;
    }
    
    const jwtError = new Error('Token无效');
    jwtError.code = 'AUTH_002';
    throw jwtError;
  }
};

/**
 * 更新用户钱包信息
 * @param {string} userId - 用户ID
 * @param {string} walletAddress - 钱包地址
 * @param {string} walletStatus - 钱包状态
 * @param {string} requestId - 请求ID
 */
const updateUserWallet = async (userId, walletAddress, walletStatus, requestId) => {
  try {
    const user = users.get(userId);
    if (!user) {
      logger.error('更新用户钱包信息失败：用户不存在', { userId, request_id: requestId });
      return;
    }
    
    user.wallet_address = walletAddress;
    user.wallet_status = walletStatus;
    user.updated_at = new Date().toISOString();
    
    users.set(userId, user);
    
    logger.info('用户钱包信息更新成功', {
      userId,
      walletAddress,
      walletStatus,
      request_id: requestId
    });
    
  } catch (error) {
    logger.error('更新用户钱包信息失败', {
      userId,
      error: error.message,
      request_id: requestId
    });
  }
};

module.exports = {
  registerUser,
  login,
  refreshToken,
  getUserById,
  verifyToken,
  updateUserWallet,
  createUser
};
