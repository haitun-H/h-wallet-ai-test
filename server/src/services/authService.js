const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const logger = require('../utils/logger');

// 模拟数据库存储（生产环境应使用真实数据库）
const users = new Map();
const refreshTokens = new Map();

/**
 * 用户登录服务
 */
const login = async (email, password) => {
  // 查找用户
  const user = Array.from(users.values()).find(u => u.email === email);
  
  if (!user) {
    const error = new Error('邮箱或密码错误');
    error.code = 'AUTH_001';
    error.statusCode = 401;
    throw error;
  }
  
  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error('邮箱或密码错误');
    error.code = 'AUTH_001';
    error.statusCode = 401;
    throw error;
  }
  
  // 生成JWT令牌
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // 存储refresh token
  refreshTokens.set(refreshToken, {
    userId: user.id,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天
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
    accessToken,
    refreshToken,
    expiresIn: 7 * 24 * 60 * 60 // 7天，单位秒
  };
};

/**
 * 刷新令牌服务
 */
const refreshToken = async (refreshToken) => {
  // 验证refresh token
  const tokenData = refreshTokens.get(refreshToken);
  
  if (!tokenData) {
    const error = new Error('refresh_token无效或过期');
    error.code = 'AUTH_001';
    error.statusCode = 401;
    throw error;
  }
  
  if (tokenData.expiresAt < new Date()) {
    refreshTokens.delete(refreshToken);
    const error = new Error('refresh_token无效或过期');
    error.code = 'AUTH_001';
    error.statusCode = 401;
    throw error;
  }
  
  // 查找用户
  const user = users.get(tokenData.userId);
  if (!user) {
    const error = new Error('用户不存在');
    error.code = 'AUTH_001';
    error.statusCode = 401;
    throw error;
  }
  
  // 生成新的令牌
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  
  // 删除旧的refresh token
  refreshTokens.delete(refreshToken);
  
  // 存储新的refresh token
  refreshTokens.set(newRefreshToken, {
    userId: user.id,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
  
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: 7 * 24 * 60 * 60,
    userId: user.id
  };
};

/**
 * 生成访问令牌
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
      issuer: 'h-wallet-api'
    }
  );
};

/**
 * 生成刷新令牌
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      type: 'refresh'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      issuer: 'h-wallet-api'
    }
  );
};

/**
 * 验证访问令牌
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const expiredError = new Error('Token已过期');
      expiredError.code = 'AUTH_001';
      expiredError.statusCode = 401;
      throw expiredError;
    }
    
    const invalidError = new Error('Token无效');
    invalidError.code = 'AUTH_002';
    invalidError.statusCode = 401;
    throw invalidError;
  }
};

/**
 * 创建用户（供注册服务调用）
 */
const createUser = async (email, password) => {
  // 检查邮箱是否已注册
  const existingUser = Array.from(users.values()).find(u => u.email === email);
  if (existingUser) {
    const error = new Error('邮箱已注册');
    error.code = 'USER_002';
    error.statusCode = 409;
    throw error;
  }
  
  // 加密密码
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.BCRYPT_SALT_ROUNDS || '10')
  );
  
  // 创建用户记录
  const userId = uuid.v4();
  const now = new Date().toISOString();
  
  const user = {
    id: userId,
    email,
    password: hashedPassword,
    wallet_address: null,
    wallet_status: 'pending',
    created_at: now,
    updated_at: now
  };
  
  users.set(userId, user);
  
  logger.info('用户创建成功', {
    userId,
    email
  });
  
  return user;
};

/**
 * 根据ID获取用户
 */
const getUserById = (userId) => {
  return users.get(userId);
};

/**
 * 根据邮箱获取用户
 */
const getUserByEmail = (email) => {
  return Array.from(users.values()).find(u => u.email === email);
};

/**
 * 更新用户钱包信息
 */
const updateUserWallet = (userId, walletAddress, status) => {
  const user = users.get(userId);
  if (!user) {
    return false;
  }
  
  user.wallet_address = walletAddress;
  user.wallet_status = status;
  user.updated_at = new Date().toISOString();
  
  users.set(userId, user);
  
  logger.info('用户钱包信息更新', {
    userId,
    walletAddress,
    status
  });
  
  return true;
};

module.exports = {
  login,
  refreshToken,
  verifyAccessToken,
  createUser,
  getUserById,
  getUserByEmail,
  updateUserWallet
};
