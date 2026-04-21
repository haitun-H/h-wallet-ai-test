const logger = require('../utils/logger');

// 模拟验证码存储（生产环境应使用Redis等缓存服务）
const verificationCodes = new Map();

/**
 * 发送邮箱验证码
 */
const sendVerificationCode = async (email) => {
  // 检查邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const error = new Error('邮箱格式错误');
    error.code = 'USER_001';
    error.statusCode = 400;
    throw error;
  }
  
  // 检查冷却时间（60秒内只能发送一次）
  const existingCode = verificationCodes.get(email);
  if (existingCode) {
    const now = Date.now();
    const timeDiff = now - existingCode.createdAt;
    const cooldownSeconds = parseInt(process.env.VERIFICATION_CODE_COOLDOWN_SECONDS || '60');
    
    if (timeDiff < cooldownSeconds * 1000) {
      const error = new Error('请求过于频繁，请60秒后再试');
      error.code = 'VERIFY_003';
      error.statusCode = 429;
      error.details = {
        retry_after: cooldownSeconds - Math.floor(timeDiff / 1000)
      };
      throw error;
    }
  }
  
  // 生成6位数字验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresInMinutes = parseInt(process.env.VERIFICATION_CODE_EXPIRY_MINUTES || '5');
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  
  // 存储验证码
  verificationCodes.set(email, {
    code,
    createdAt: Date.now(),
    expiresAt,
    verified: false
  });
  
  // 模拟发送邮件（MVP阶段仅记录日志）
  logger.info('验证码已生成（模拟发送邮件）', {
    email,
    code,
    expiresAt: new Date(expiresAt).toISOString()
  });
  
  // 清理过期验证码
  cleanupExpiredCodes();
  
  return { success: true };
};

/**
 * 验证验证码
 */
const verifyCode = (email, code) => {
  const storedCode = verificationCodes.get(email);
  
  if (!storedCode) {
    const error = new Error('验证码错误');
    error.code = 'VERIFY_001';
    error.statusCode = 400;
    throw error;
  }
  
  // 检查验证码是否过期
  if (Date.now() > storedCode.expiresAt) {
    verificationCodes.delete(email);
    const error = new Error('验证码已过期');
    error.code = 'VERIFY_002';
    error.statusCode = 400;
    throw error;
  }
  
  // 检查验证码是否正确
  if (storedCode.code !== code) {
    const error = new Error('验证码错误');
    error.code = 'VERIFY_001';
    error.statusCode = 400;
    throw error;
  }
  
  // 标记验证码为已验证
  storedCode.verified = true;
  verificationCodes.set(email, storedCode);
  
  logger.info('验证码验证成功', { email });
  
  return { success: true };
};

/**
 * 清理过期验证码
 */
const cleanupExpiredCodes = () => {
  const now = Date.now();
  for (const [email, codeData] of verificationCodes.entries()) {
    if (now > codeData.expiresAt) {
      verificationCodes.delete(email);
    }
  }
};

module.exports = {
  sendVerificationCode,
  verifyCode
};
