const userRepository = require('../repositories/userRepository');
const verificationCodeRepository = require('../repositories/verificationCodeRepository');
const mailer = require('./mailer');
const okxService = require('./okxService');

const authService = {
  async sendVerificationCode(email) {
    // Check if email is already registered
    const isRegistered = await userRepository.isEmailRegistered(email);
    if (isRegistered) {
      throw new Error('Email already registered');
    }

    // Rate limiting: check if a code was sent in the last 60 seconds
    const recentCount = await verificationCodeRepository.getRecentCodeCount(email, 60);
    if (recentCount > 0) {
      throw new Error('Please wait 60 seconds before requesting a new code');
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration (60 seconds from now)
    const expiresAt = new Date(Date.now() + 60 * 1000);

    // Save to database
    await verificationCodeRepository.create({ email, code, expiresAt });

    // Send email
    await mailer.sendVerificationEmail(email, code);

    return { expiresAt };
  },

  async register(email, code) {
    // Validate code
    const validCode = await verificationCodeRepository.findValidCode(email, code);
    if (!validCode) {
      throw new Error('Invalid or expired verification code');
    }

    // Check again if email is already registered (race condition)
    const isRegistered = await userRepository.isEmailRegistered(email);
    if (isRegistered) {
      throw new Error('Email already registered');
    }

    // Mark code as used
    await verificationCodeRepository.markAsUsed(validCode.id);

    // Create wallet via OKX API
    const walletResult = await okxService.createAgentWallet(email);
    if (!walletResult.success) {
      throw new Error(walletResult.message || 'Failed to create wallet');
    }

    // Save user to database
    const user = await userRepository.create({
      email,
      walletAddress: walletResult.data.walletAddress,
    });

    return {
      walletAddress: walletResult.data.walletAddress,
      userId: user.id,
      createdAt: user.created_at,
    };
  },
};

module.exports = authService;