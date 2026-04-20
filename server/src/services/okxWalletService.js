const { AgentWallet } = require('@okxweb3/onchainos-agent-sdk');

class OKXWalletService {
  constructor() {
    // 根据OKX文档初始化SDK
    // 注意：实际配置可能需要根据SDK的具体要求调整
    this.agentWallet = new AgentWallet({
      apiKey: process.env.OKX_API_KEY,
      secretKey: process.env.OKX_SECRET_KEY,
      passphrase: process.env.OKX_PASSPHRASE,
      baseURL: process.env.OKX_BASE_URL || 'https://www.okx.com',
    });
  }

  /**
   * 为指定用户创建一个新的Agent钱包
   * @param {string} userId - 内部用户ID，可用于作为外部业务ID (externalBizId)
   * @returns {Promise<{address: string, externalBizId: string}>}
   */
  async createWalletForUser(userId) {
    try {
      // 根据OKX OnchainOS Agent Wallet API文档调用创建钱包接口
      // 假设 createWallet 方法接受一个参数对象，包含 externalBizId
      const response = await this.agentWallet.createWallet({
        externalBizId: `h_wallet_user_${userId}`, // 关联我们系统的用户ID
        // 可能还有其他参数，如链类型，根据文档补充
        // chainType: 'EVM',
      });

      // 解析响应，获取钱包地址
      // 实际响应结构需要参考OKX SDK文档
      const walletAddress = response.data?.address || response.address;
      const externalBizId = response.data?.externalBizId || response.externalBizId;

      if (!walletAddress) {
        throw new Error('OKX API响应中未找到钱包地址');
      }

      console.log(`✅ OKX钱包创建成功 for user ${userId}: ${walletAddress}`);
      return { address: walletAddress, externalBizId };
    } catch (error) {
      console.error('❌ OKX钱包创建失败:', error.message, error.response?.data);
      // 重新抛出错误，让上层处理
      throw new Error(`钱包创建失败: ${error.message}`);
    }
  }

  // 可以添加其他钱包相关方法，如查询余额、转账等
}

// 导出单例
module.exports = new OKXWalletService();