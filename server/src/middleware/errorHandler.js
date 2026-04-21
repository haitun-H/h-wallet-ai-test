const logger = require('../utils/logger');

/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  const requestId = req.requestId || 'unknown';
  
  // 记录错误日志
  logger.error('请求处理失败', {
    requestId,
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    statusCode: err.statusCode || 500
  });
  
  // 设置默认错误响应
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'COMMON_001';
  const message = err.message || '服务器内部错误';
  
  // 构建错误响应
  const errorResponse = {
    code: errorCode,
    message: message,
    request_id: requestId
  };
  
  // 添加错误详情（开发环境）
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = {
      stack: err.stack,
      path: req.path
    };
  }
  
  // 特定错误类型的处理
  if (err.name === 'ValidationError') {
    errorResponse.code = 'USER_001';
    errorResponse.message = '请求参数验证失败';
  }
  
  if (err.name === 'JsonWebTokenError') {
    errorResponse.code = 'AUTH_002';
    errorResponse.message = 'Token格式错误';
  }
  
  if (err.name === 'TokenExpiredError') {
    errorResponse.code = 'AUTH_001';
    errorResponse.message = 'Token已过期';
  }
  
  // 发送错误响应
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
