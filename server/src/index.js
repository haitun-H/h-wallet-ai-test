/**
 * H Wallet 服务器入口文件
 * 启动 Express 服务器并配置中间件、路由
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 导入自定义模块
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// 导入路由
const authRoutes = require('./routes/auth');

// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 8080;
const BASE_PATH = '/v1';

// 安全中间件
app.use(helmet());

// CORS 配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://hwallet.com'] 
    : ['http://localhost:3000'],
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
    request_id: requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    user_agent: req.get('user-agent')
  });
  
  // 将 requestId 添加到响应头
  res.setHeader('X-Request-ID', requestId);
  next();
});

// 速率限制
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制100个请求
  message: {
    code: 'COMMON_001',
    message: '请求过于频繁，请稍后再试',
    request_id: 'rate_limit'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 应用速率限制到所有API
app.use(`${BASE_PATH}/`, apiLimiter);

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'h-wallet-api'
  });
});

// API 路由
app.use(`${BASE_PATH}/auth`, authRoutes);

// 404 处理
app.use((req, res) => {
  logger.warn('路由未找到', {
    request_id: req.requestId,
    method: req.method,
    path: req.path
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
  logger.info('服务器启动成功', {
    port: PORT,
    environment: process.env.NODE_ENV,
    base_url: `${process.env.BASE_URL || `http://localhost:${PORT}`}${BASE_PATH}`
  });
  
  // 启动钱包创建任务处理器
  const okxWalletService = require('./services/okxWalletService');
  okxWalletService.startWalletCreationProcessor();
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信号，开始优雅关闭');
  
  // 停止钱包创建任务处理器
  const okxWalletService = require('./services/okxWalletService');
  okxWalletService.stopWalletCreationProcessor();
  
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到 SIGINT 信号，开始优雅关闭');
  
  // 停止钱包创建任务处理器
  const okxWalletService = require('./services/okxWalletService');
  okxWalletService.stopWalletCreationProcessor();
  
  process.exit(0);
});

module.exports = app;
