const express = require('express');
const Joi = require('joi');
const authService = require('../services/authService');
const logger = require('../utils/logger');

const router = express.Router();

// Validation schemas
const sendVerificationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    'string.length': 'Verification code must be 6 digits',
    'string.pattern.base': 'Verification code must contain only digits',
  }),
});

// Send verification code
router.post('/send-verification', async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = sendVerificationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email } = value;

    logger.info('Sending verification code', { email });

    const result = await authService.sendVerificationCode(email);

    res.json({
      success: true,
      message: 'Verification code sent successfully',
      data: {
        expiresAt: result.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Register and create wallet
router.post('/register', async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, code } = value;

    logger.info('Processing registration', { email });

    const result = await authService.register(email, code);

    res.json({
      success: true,
      message: 'Registration successful',
      data: {
        walletAddress: result.walletAddress,
        userId: result.userId,
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;