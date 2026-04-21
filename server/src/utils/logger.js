const winston = require('winston');
const path = require('path');

// 定义日志级别
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// 定义日志级别颜色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

// 定义日志格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message} ${info.data ? JSON.stringify(info.data) : ''}`
  )
);

// 定义日志传输方式
const transports = [
  // 控制台输出
  new winston.transports.Console(),
  // 文件输出
  new winston.transports.File({
    filename: path.join(process.env.LOG_FILE_PATH || './logs', 'error.log'),
    level: 'error'
  }),
  new winston.transports.File({
    filename: path.join(process.env.LOG_FILE_PATH || './logs', 'combined.log')
  })
];

// 创建logger实例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports
});

// 添加自定义方法，支持结构化日志
logger.info = (message, data) => {
  logger.log('info', message, { data });
};

logger.error = (message, data) => {
  logger.log('error', message, { data });
};

logger.warn = (message, data) => {
  logger.log('warn', message, { data });
};

logger.http = (message, data) => {
  logger.log('http', message, { data });
};

logger.debug = (message, data) => {
  logger.log('debug', message, { data });
};

module.exports = logger;
