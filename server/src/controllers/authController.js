const User = require('../models/User');
const EmailVerificationCode = require('../models/EmailVerificationCode');
const emailService = require('../services/emailService');
const okxWalletService = require('../services/okxWalletService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

/**
 * 统一成功响应格式
 */
const successResponse = (res, code, message, data = null) => {
  const response = { code, message };
  if (data) response.data = data;
  res.status(code === 201 ? 201 : 200).json(response);
};

/**
 * 统一错误响应格式
 */
const errorResponse = (res, code, message) => {
  res.status(code).json({ code, message });
};

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // 1. 基础验证
  if (!email || !validator.isEmail(email)) {
    return errorResponse(res, 400, '邮箱格式不正确');
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // 2. 检查邮箱是否已注册
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return errorResponse(res, 400, '邮箱已被注册');
    }

    // 3. 风控策略：同一邮箱60秒内只能请求一次
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentCode = await EmailVerificationCode.findOne({
      email: normalizedEmail,
      createdAt: { $gte: oneMinuteAgo }
    });
    if (recentCode) {
      return errorResponse(res, 429, '请求过于频繁，请60秒后再试');
    }

    // 4. 风控策略：同一IP地址24小时内最多请求10次
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const ipRequestCount = await EmailVerificationCode.countDocuments({
      ip: clientIp,
      createdAt: { $gte: twentyFourHoursAgo }
    });
    if (ipRequestCount >= 10) {
      return errorResponse(res, 429, '今日验证码请求次数已达上限');
    }

    // 5. 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 6. 创建验证码记录 (sid 由模型默认生成)
    const verificationCodeDoc = new EmailVerificationCode({
      email: normalizedEmail,
      code,
      ip: clientIp,
    });
    await verificationCodeDoc.save();

    // 7. 发送邮件 (异步，不阻塞响应)
    emailService.sendVerificationCode(normalizedEmail, code)
      .catch(err => console.error('后台邮件发送失败:', err.message));

    // 8. 返回成功响应
    successResponse(res, 200, '验证码发送成功', { sid: verificationCodeDoc.sid });

  } catch (error) {
    console.error('发送验证码错误:', error);
    errorResponse(res, 500, '服务器内部错误');
  }
};

exports.register = async (req, res) => {
  const { email, password, verificationCode, sid } = req.body;

  // 1. 基础验证
  if (!email || !validator.isEmail(email)) {
    return errorResponse(res, 400, '邮箱格式不正确');
  }
  if (!password || password.length < 8) {
    return errorResponse(res, 400, '密码至少8位');
  }
  if (!verificationCode || !/^\d{6}$/.test(verificationCode)) {
    return errorResponse(res, 400, '验证码必须为6位数字');
  }
  if (!sid) {
    return errorResponse(res, 400, '会话ID无效');
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // 2. 验证码校验
    const codeRecord = await EmailVerificationCode.findOne({
      sid,
      email: normalizedEmail,
      used: false,
      expiresAt: { $gt: new Date() } // 未过期
    });

    if (!codeRecord) {
      return errorResponse(res, 400, '验证码错误或已过期');
    }
    if (codeRecord.code !== verificationCode) {
      return errorResponse(res, 400, '验证码错误');
    }

    // 3. 二次检查邮箱是否已注册 (防止并发注册)
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      // 标记验证码为已使用，防止被滥用
      codeRecord.used = true;
      await codeRecord.save();
      return errorResponse(res, 409, '邮箱已被注册');
    }

    // 4. 密码哈希
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. 创建用户记录 (先不包含钱包地址)
    const newUser = new User({
      email: normalizedEmail,
      passwordHash,
      // nickname 由模型默认生成
    });
    await newUser.save();

    // 6. 调用OKX SDK创建钱包
    let walletAddress;
    try {
      const walletResult = await okxWalletService.createWalletForUser(newUser._id.toString());
      walletAddress = walletResult.address;
    } catch (walletError) {
      // 如果钱包创建失败，删除刚创建的用户记录，确保数据一致性
      await User.findByIdAndDelete(newUser._id);
      console.error('注册流程中断：钱包创建失败，已回滚用户创建', walletError);
      return errorResponse(res, 500, '系统繁忙，钱包创建失败，请稍后重试');
    }

    // 7. 更新用户钱包地址
    newUser.walletAddress = walletAddress;
    await newUser.save();

    // 8. 标记验证码为已使用
    codeRecord.used = true;
    await codeRecord.save();

    // 9. 生成JWT Token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 10. 返回成功响应
    successResponse(res, 201, '注册成功', {
      userId: newUser._id,
      token,
      walletAddress: newUser.walletAddress,
      nickname: newUser.nickname,
    });

  } catch (error) {
    console.error('注册错误:', error);
    // 区分已知错误和未知错误
    if (error.message.includes('E11000')) { // MongoDB重复键错误
      return errorResponse(res, 409, '邮箱或钱包地址已存在');
    }
    errorResponse(res, 500, '服务器内部错误');
  }
};