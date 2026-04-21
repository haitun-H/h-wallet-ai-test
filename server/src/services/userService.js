const authService = require('./authService');
const verificationService = require('./verificationService');
const okxWalletService = require('./okxWalletService');
const logger = require('../utils/logger');

/**
 * 用户注册服务
 */
const registerUser = async (email, verificationCode, password) => {
  try {
    logger.info('开始用户注册流程', { email });
    
    // 1. 验证验证码
    await verificationService.verifyCode(email, verificationCode);
    
    // 2. 创建用户
    const user = await authService.createUser(email, password);
    
    // 3. 生成JWT令牌（自动登录）
    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);
    
    // 4. 异步触发钱包创建任务
    const walletTask = okxWalletService.addWalletCreationTask(user.id);
    
    logger.info('钱包创建任务已触发', {
      userId: user.id,
      taskId: walletTask.id
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
      refreshToken
    };
  } catch (error) {
    logger.error('用户注册失败', {
      email,
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  registerUser
};
