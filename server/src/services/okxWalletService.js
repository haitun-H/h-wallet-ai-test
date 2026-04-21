const logger = require('../utils/logger');
const authService = require('./authService');

// 模拟钱包创建任务队列
const walletCreationQueue = [];

/**
 * 模拟创建OKX Agent Wallet
 * 注意：MVP阶段完全模拟实现，不连接真实OKX服务
 */
const createWallet = async (userId) => {
  logger.info('开始创建钱包', { userId });
  
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 模拟钱包地址生成（实际应调用OKX API）
    const walletAddress = generateMockWalletAddress();
    
    logger.info('钱包创建成功', {
      userId,
      walletAddress
    });
    
    return {
      success: true,
      walletAddress,
      status: 'active'
    };
  } catch (error) {
    logger.error('钱包创建失败', {
      userId,
      error: error.message
    });
    
    return {
      success: false,
      walletAddress: null,
      status: 'failed',
      errorMessage: error.message
    };
  }
};

/**
 * 生成模拟钱包地址
 */
const generateMockWalletAddress = () => {
  const chars = '0123456789abcdef';
  let address = '0x';
  
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return address;
};

/**
 * 添加钱包创建任务到队列
 */
const addWalletCreationTask = (userId) => {
  const task = {
    id: `wallet_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    status: 'pending',
    retryCount: 0,
    maxRetries: parseInt(process.env.WALLET_CREATION_MAX_RETRIES || '3'),
    createdAt: new Date().toISOString()
  };
  
  walletCreationQueue.push(task);
  logger.info('钱包创建任务已添加到队列', task);
  
  return task;
};

/**
 * 处理钱包创建任务
 */
const processWalletCreationTask = async (task) => {
  try {
    logger.info('开始处理钱包创建任务', { taskId: task.id, userId: task.userId });
    
    // 更新任务状态
    task.status = 'processing';
    task.startedAt = new Date().toISOString();
    
    // 创建钱包
    const result = await createWallet(task.userId);
    
    // 更新用户钱包信息
    const updateSuccess = authService.updateUserWallet(
      task.userId,
      result.walletAddress,
      result.status
    );
    
    if (!updateSuccess) {
      throw new Error('用户不存在');
    }
    
    // 更新任务状态
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    task.result = result;
    
    logger.info('钱包创建任务完成', {
      taskId: task.id,
      userId: task.userId,
      result
    });
    
    return result;
  } catch (error) {
    logger.error('钱包创建任务失败', {
      taskId: task.id,
      userId: task.userId,
      error: error.message
    });
    
    // 重试逻辑
    if (task.retryCount < task.maxRetries) {
      task.retryCount++;
      task.status = 'retrying';
      task.lastError = error.message;
      task.nextRetryAt = new Date(Date.now() + 
        parseInt(process.env.WALLET_CREATION_RETRY_DELAY_MS || '5000'));
      
      logger.info('钱包创建任务将重试', {
        taskId: task.id,
        userId: task.userId,
        retryCount: task.retryCount,
        maxRetries: task.maxRetries
      });
      
      // 重新加入队列
      setTimeout(() => {
        walletCreationQueue.push(task);
      }, parseInt(process.env.WALLET_CREATION_RETRY_DELAY_MS || '5000'));
    } else {
      // 重试次数用尽，标记为失败
      task.status = 'failed';
      task.completedAt = new Date().toISOString();
      task.error = error.message;
      
      // 更新用户钱包状态为failed
      authService.updateUserWallet(task.userId, null, 'failed');
      
      logger.error('钱包创建任务最终失败', {
        taskId: task.id,
        userId: task.userId,
        error: error.message
      });
    }
    
    throw error;
  }
};

/**
 * 获取待处理的任务
 */
const getPendingTasks = () => {
  return walletCreationQueue.filter(task => 
    task.status === 'pending' || 
    (task.status === 'retrying' && new Date(task.nextRetryAt) <= new Date())
  );
};

/**
 * 根据用户ID获取钱包状态
 */
const getWalletStatusByUserId = (userId) => {
  const user = authService.getUserById(userId);
  if (!user) {
    return null;
  }
  
  // 查找相关任务
  const tasks = walletCreationQueue.filter(task => task.userId === userId);
  const latestTask = tasks.length > 0 ? tasks[tasks.length - 1] : null;
  
  return {
    wallet_address: user.wallet_address,
    status: user.wallet_status,
    created_at: user.created_at,
    updated_at: user.updated_at,
    error_message: latestTask?.status === 'failed' ? latestTask.error : null
  };
};

module.exports = {
  createWallet,
  addWalletCreationTask,
  processWalletCreationTask,
  getPendingTasks,
  getWalletStatusByUserId
};
