const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const authService = require('../services/authService');

/**
 * @route GET /v1/me
 * @desc 获取当前用户信息
 * @access Private
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const user = authService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        code: 'COMMON_001',
        message: '用户不存在',
        request_id: req.requestId
      });
    }
    
    res.status(200).json({
      id: user.id,
      email: user.email,
      wallet_address: user.wallet_address,
      wallet_status: user.wallet_status,
      created_at: user.created_at,
      updated_at: user.updated_at
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
