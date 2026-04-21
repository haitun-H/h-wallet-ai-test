const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const okxWalletService = require('../services/okxWalletService');

/**
 * @route GET /v1/wallets/status
 * @desc 查询钱包创建状态
 * @access Private
 */
router.get('/status', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const walletStatus = okxWalletService.getWalletStatusByUserId(userId);
    
    if (!walletStatus) {
      return res.status(404).json({
        code: 'COMMON_001',
        message: '钱包记录不存在',
        request_id: req.requestId
      });
    }
    
    res.status(200).json(walletStatus);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
