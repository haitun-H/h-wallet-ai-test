const authService = require('../services/authService');
const logger = require('../utils/logger');

/**
 * 用户登录控制器
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    logger.info('处理登录请求', {
      requestId: req.requestId,
      email
    });
    
    const result = await authService.login(email, password);
    
    logger.info('登录成功', {
      requestId: req.requestId,
      userId: result.user.id,
      email
    });
    
    res.status(200).json({
      user: result.user,
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
      expires_in: result.expiresIn,
      token_type: 'Bearer'
    });
  } catch (error) {
    logger.error('登录失败', {
      requestId: req.requestId,
      error: error.message,
      email: req.body.email
    });
    next(error);
  }
};

/**
 * 刷新令牌控制器
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    
    logger.info('处理令牌刷新请求', {
      requestId: req.requestId
    });
    
    const result = await authService.refreshToken(refresh_token);
    
    logger.info('令牌刷新成功', {
      requestId: req.requestId,
      userId: result.userId
    });
    
    res.status(200).json({
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
      expires_in: result.expiresIn,
      token_type: 'Bearer'
    });
  } catch (error) {
    logger.error('令牌刷新失败', {
      requestId: req.requestId,
      error: error.message
    });
    next(error);
  }
};

module.exports = {
  login,
  refreshToken
};
