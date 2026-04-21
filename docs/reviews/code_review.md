# H Wallet 项目 QA 评审报告

## 评审结论：需修改

经过对 PRD、OpenAPI 合约、RTM、UI 规范以及前后端代码的详细评审，发现存在以下关键问题需要修复：

## 前端修订要点

### 1. 注册接口响应处理不一致
**问题**：前端 `authService.ts` 中注册成功后尝试自动登录，但注册接口 `POST /users` 的响应类型为 `RegisterUserResponse`，不包含 `access_token` 字段。根据 OpenAPI 合约，注册成功后应返回用户信息，但 **不包含 token**。

**修复建议**：
```typescript
// authService.ts 中的 register 方法修改
register: async (
  email: string,
  verificationCode: string,
  password: string,
  confirmPassword: string
) => {
  try {
    const response = await userApi.register({
      email,
      verification_code: verificationCode,
      password,
      confirm_password: confirmPassword,
    });
    
    const data = response.data;
    
    // 注册成功后，前端应提示用户钱包创建中，并引导到登录页面
    // 或者调用登录接口获取token（根据PRD，注册成功后应自动登录）
    // 需要确认后端实现：注册接口是否返回token？
    
    return data;
  } catch (error: any) {
    console.error('注册失败:', error);
    throw error;
  }
},
```

### 2. 注册页面实现不完整
**问题**：`RegisterScreen.tsx` 文件被截断，缺少完整的实现代码。需要补充：
- 完整的表单状态管理
- 验证码发送逻辑
- 注册提交逻辑
- 步骤切换逻辑

### 3. Token 自动刷新逻辑需要优化
**问题**：`authService.ts` 中的 `setupTokenRefresh` 函数在 token 过期前5分钟刷新，但未考虑用户在此期间可能不活跃的情况。

**修复建议**：
```typescript
// 增加页面可见性检查
const setupTokenRefresh = (expiresIn: number): void => {
  // 清除现有的定时器
  if ((window as any).tokenRefreshTimer) {
    clearTimeout((window as any).tokenRefreshTimer);
  }
  
  // 在 token 过期前5分钟刷新
  const refreshTime = (expiresIn - 300) * 1000;
  
  if (refreshTime > 0) {
    (window as any).tokenRefreshTimer = setTimeout(() => {
      // 检查页面是否可见
      if (document.visibilityState === 'visible') {
        tokenRefreshService.checkAndRefreshToken().catch(console.error);
      } else {
        // 页面不可见，延迟到页面可见时再刷新
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            tokenRefreshService.checkAndRefreshToken().catch(console.error);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
      }
    }, refreshTime);
  }
};
```

### 4. 钱包状态轮询逻辑缺失
**问题**：根据 UI 规范，主页需要轮询钱包状态，但前端代码中未实现轮询逻辑。

**修复建议**：在主页组件中实现轮询逻辑：
```typescript
// 使用 useEffect 实现轮询
useEffect(() => {
  let intervalId: NodeJS.Timeout;
  
  if (walletStatus === 'pending') {
    intervalId = setInterval(() => {
      fetchWalletStatus();
    }, 5000); // 每5秒轮询一次
  }
  
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}, [walletStatus]);
```

## 后端修订要点

### 1. 注册接口未返回 Token（与 PRD 不一致）
**问题**：PRD 第6.1节明确说明"注册成功后自动登录（返回access_token）"，但后端 `userService.js` 中的 `registerUser` 方法虽然生成了 token，但未在响应中返回。

**修复建议**：
```javascript
// userService.js 中的 registerUser 方法修改
registerUser: async (email, verificationCode, password) => {
  try {
    logger.info('开始用户注册流程', { email });
    
    // 1. 验证验证码
    await verificationService.verifyCode(email, verificationCode);
    
    // 2. 创建用户
    const user = await authService.createUser(email, password);
    
    // 3. 生成JWT令牌（自动登录）
    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);
    
    // 4. 存储refresh token
    // 需要在authService中添加存储逻辑
    
    // 5. 异步触发钱包创建任务
    const walletTask = okxWalletService.addWalletCreationTask(user.id);
    
    logger.info('钱包创建任务已触发', {
      userId: user.id,
      taskId: walletTask.id
    });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        wallet_address: user.wallet_address,
        wallet_status: user.wallet_status,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      access_token: accessToken, // 返回token
      refresh_token: refreshToken, // 返回refresh token
      expires_in: 7 * 24 * 60 * 60, // 7天
      token_type: 'Bearer'
    };
  } catch (error) {
    logger.error('用户注册失败', {
      email,
      error: error.message
    });
    throw error;
  }
}
```

### 2. 验证码存储缺少清理机制
**问题**：`verificationService.js` 中的 `cleanupExpiredCodes` 函数只在发送验证码时调用，可能导致内存泄漏。

**修复建议**：添加定时清理任务
```javascript
// 在 verificationService.js 中添加
const scheduleCleanup = () => {
  // 每小时清理一次过期验证码
  setInterval(() => {
    cleanupExpiredCodes();
    logger.debug('已清理过期验证码');
  }, 60 * 60 * 1000);
};

// 在模块初始化时启动
scheduleCleanup();
```

### 3. 钱包创建任务处理器未正确实现
**问题**：`walletCreationService.js` 文件被截断，缺少完整的任务处理逻辑。

**修复建议**：补充完整实现：
```javascript
// walletCreationService.js 补充
processPendingTasks: async () => {
  if (this.isProcessing) {
    return;
  }
  
  this.isProcessing = true;
  
  try {
    const pendingTasks = okxWalletService.getPendingTasks();
    
    for (const task of pendingTasks) {
      try {
        await okxWalletService.processWalletCreationTask(task);
      } catch (error) {
        logger.error('处理钱包创建任务失败', {
          taskId: task.id,
          error: error.message
        });
      }
    }
  } finally {
    this.isProcessing = false;
  }
}
```

### 4. 缺少 refresh token 存储逻辑
**问题**：`authService.js` 中生成 refresh token 后需要存储，但当前实现中 `refreshTokens` Map 只在登录时更新，注册时未更新。

**修复建议**：
```javascript
// 在 authService.js 的 createUser 方法后添加
// 或者在 registerUser 服务中调用存储逻辑
const storeRefreshToken = (refreshToken, userId) => {
  refreshTokens.set(refreshToken, {
    userId: userId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
};
```

### 5. 错误码一致性检查
**问题**：部分错误码与 OpenAPI 合约不一致，例如验证码错误应该返回 `VERIFY_001` 而不是通用错误码。

**修复建议**：确保所有错误响应都使用合约中定义的标准错误码。

## NEGOTIATION

需要与产品经理协商的问题：

1. **注册接口响应格式不一致**
   - **问题**：PRD 要求注册成功后自动登录并返回 token，但 OpenAPI 合约中的 `UserResponse` schema 不包含 token 字段。
   - **建议**：统一注册接口的响应格式，要么修改合约包含 token，要么修改 PRD 要求前端在注册后调用登录接口。

2. **钱包创建失败的重试机制**
   - **问题**：PRD 提到"用户可手动触发重试（后续版本）"，但当前实现中重试是自动的。
   - **建议**：明确 MVP 阶段的重试策略，是自动重试还是需要用户手动操作。

3. **验证码发送的模拟程度**
   - **问题**：PRD 提到"模拟发送，日志记录"，但未明确前端如何获取验证码进行测试。
   - **建议**：在开发环境中提供一种方式让前端能够获取到验证码（如特殊的测试端点）。

## 合约一致性检查结果

1. ✅ 接口路径和方法与 OpenAPI 合约一致
2. ✅ 请求/响应模型基本匹配
3. ❌ 注册接口响应缺少 token 字段（与 PRD 冲突）
4. ✅ 错误响应格式符合合约要求
5. ✅ 安全方案（Bearer Auth）正确实现

## 需求追踪检查结果

| requirement_id | 状态 | 备注 |
|----------------|------|------|
| FR-01 | ✅ 已实现 | 验证码发送功能完整 |
| FR-02 | ⚠️ 部分实现 | 注册功能存在，但 token 返回逻辑不一致 |
| FR-03 | ✅ 已实现 | 登录功能完整 |
| FR-04 | ⚠️ 部分实现 | 钱包创建异步逻辑存在，但任务处理器不完整 |
| FR-05 | ✅ 已实现 | 获取用户信息功能完整 |
| FR-06 | ✅ 已实现 | Token 刷新机制完整 |
| FR-07 | ✅ 已实现 | 查询钱包状态功能完整 |

## 流程完整性检查

1. ✅ 邮箱注册流程基本完整
2. ⚠️ 自动创建钱包流程：后端逻辑存在但需要完善任务处理
3. ✅ 登录流程完整
4. ⚠️ 注册→自动登录→查看钱包状态流程：需要解决 token 返回问题

## 幂等与错误处理检查

1. ✅ 验证码发送接口有60秒冷却时间，支持幂等
2. ✅ 注册接口基于邮箱检查，支持幂等
3. ✅ 错误码体系基本建立
4. ✅ 统一错误处理中间件已实现

## 中文日志与注释检查

1. ✅ 后端日志全部使用中文
2. ✅ 代码注释基本使用中文
3. ✅ 错误消息使用中文

## 总结

项目整体架构合理，核心功能基本实现，但存在一些关键的不一致性和实现不完整的问题。主要需要解决注册接口的 token 返回问题、完善钱包创建任务处理器、补充前端缺失的实现部分。
