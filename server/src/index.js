require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// 导入路由
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 8080;
const API_PREFIX = process.env.API_PREFIX || '/v1';

// 安全中间件
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://hwallet.com' : '*',
  credentials: true
}));

// 请求体解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = requestId;
  
  logger.info('收到请求', {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // 将requestId添加到响应头
  res.setHeader('X-Request-ID', requestId);
  next();
});

// 限流配置
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制100个请求
  message: {
    code: 'COMMON_001',
    message: '请求过于频繁，请稍后再试',
    request_id: 'system'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// 路由注册
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/verification-codes`, require('./routes/verification'));
app.use(`${API_PREFIX}/users`, require('./routes/users'));
app.use(`${API_PREFIX}/wallets`, require('./routes/wallets'));
app.use(`${API_PREFIX}/me`, require('./routes/me'));

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'h-wallet-api'
  });
});

// 404处理
app.use('*', (req, res) => {
  logger.warn('路由未找到', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl
  });
  
  res.status(404).json({
    code: 'COMMON_001',
    message: '接口不存在',
    request_id: req.requestId
  });
});

// 全局错误处理
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  logger.info(`服务器启动成功`, {
    port: PORT,
    environment: process.env.NODE_ENV,
    apiPrefix: API_PREFIX
  });
  
  // 启动钱包创建任务处理器
  require('./services/walletCreationService').start();
});

module.exports = app;
