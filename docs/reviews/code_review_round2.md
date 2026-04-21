# H Wallet 项目 QA 评审报告

## 评审结论：需修改

## 前端修订要点

### 1. API 合约一致性
- **问题**：`authService.ts` 中注册后自动登录逻辑与 OpenAPI 合约不一致
  - **合约要求**：注册接口 `/users` 应返回 `UserResponse`（包含用户信息，不含 token）
  - **当前实现**：注册后调用登录接口获取 token，但注册接口响应处理逻辑混乱
  - **修复建议**：
    ```typescript
    // 修改 authService.ts 中的 register 方法
    async register(...): Promise<UserResponse> {
      const response = await userApi.register(requestData);
      const data = response.data;
      
      // 注册成功，但不自动登录
      // 前端应提示用户"注册成功，请登录"
      return data;
    }
    ```

### 2. 路由路径错误
- **问题**：API 服务配置中路由路径与合约不匹配
  - **合约路径**：`/verification-codes`、`/users`、`/auth/login`、`/me`、`/wallets/status`
  - **当前实现**：`api.ts` 中使用了正确路径，但 `authService.ts` 中注册后自动登录逻辑错误
  - **修复建议**：确保所有 API 调用路径与 OpenAPI 合约完全一致

### 3. 组件实现不完整
- **问题**：`StatusCard.tsx` 文件不完整，缺少组件实现
  - **修复建议**：补充完整的 StatusCard 组件实现，支持不同状态显示

### 4. 错误处理不完善
- **问题**：前端错误处理未完全遵循合约错误码体系
  - **修复建议**：在错误拦截器中根据合约错误码进行统一处理

## 后端修订要点

### 1. 路由结构错误
- **问题**：路由文件 `auth.js` 将所有路由挂载在 `/auth` 下，与合约路径不匹配
  - **合约路径**：
    - `POST /verification-codes`（独立路径）
    - `POST /users`（独立路径）
    - `POST /auth/login`（在 auth 下）
    - `GET /me`（独立路径）
    - `GET /wallets/status`（独立路径）
  - **当前实现**：所有路由都在 `/auth` 下
  - **修复建议**：
    ```javascript
    // 修改 server/src/index.js
    app.use(`${BASE_PATH}/verification-codes`, verificationRoutes);
    app.use(`${BASE_PATH}/users`, userRoutes);
    app.use(`${BASE_PATH}/auth`, authRoutes);
    app.use(`${BASE_PATH}/me`, userRoutes); // 需要认证中间件
    app.use(`${BASE_PATH}/wallets`, walletRoutes);
    ```

### 2. 注册接口响应与合约不一致
- **问题**：`authController.js` 中注册接口返回了 token，但合约要求只返回用户信息
  - **合约要求**：`UserResponse`（用户信息 + message 字段）
  - **当前实现**：返回了包含 token 的完整登录响应
  - **修复建议**：
    ```javascript
    // 修改 registerUser 方法
    res.status(201).json({
      id: result.user.id,
      email: result.user.email,
      wallet_address: result.user.wallet_address,
      wallet_status: result.user.wallet_status,
      created_at: result.user.created_at,
      updated_at: result.user.updated_at,
      message: '注册成功，钱包创建中...'
      // 不返回 token
    });
    ```

### 3. 缺少验证码服务实现
- **问题**：引用了 `verificationService` 但未提供实现文件
  - **修复建议**：创建 `server/src/services/verificationService.js` 实现验证码生成、存储、验证逻辑

### 4. 缺少中间件实现
- **问题**：引用了 `authMiddleware` 但未提供实现文件
  - **修复建议**：创建 `server/src/middleware/authMiddleware.js` 实现 token 验证逻辑

### 5. 缺少日志工具实现
- **问题**：引用了 `logger` 但未提供实现文件
  - **修复建议**：创建 `server/src/utils/logger.js` 实现结构化日志记录

### 6. 缺少错误处理器实现
- **问题**：引用了 `errorHandler` 但未提供实现文件
  - **修复建议**：创建 `server/src/middleware/errorHandler.js` 实现统一错误处理

### 7. 中文注释要求
- **问题**：部分代码缺少中文注释
  - **修复建议**：确保所有关键函数、复杂逻辑都有中文注释说明

## NEGOTIATION

### 1. 注册后是否自动登录
- **现状**：PRD 要求"注册成功后自动登录"，但 OpenAPI 合约中注册接口不返回 token
- **矛盾点**：
  - PRD 6.1 流程：注册成功后返回 token
  - OpenAPI 合约：`UserResponse` 不包含 token 字段
- **协商建议**：
  1. **方案A**：修改 OpenAPI 合约，注册接口返回 token（与 PRD 一致）
  2. **方案B**：修改 PRD，注册后需要手动登录（与合约一致）
  3. **方案C**：注册接口返回用户信息，前端自动调用登录接口（当前前端实现方式）

### 2. 钱包状态查询接口路径
- **现状**：合约中为 `/wallets/status`，但实现中可能涉及用户隔离
- **协商建议**：确认是否需要用户ID参数，或完全依赖 token 认证

## 流程完整性评估

### 邮箱注册 → 自动创建钱包 → 登录 流程
1. ✅ 发送验证码：前端组件 + 后端接口基本完整
2. ⚠️ 用户注册：前后端实现存在路径和响应不一致问题
3. ✅ 自动创建钱包：后端异步任务机制已设计
4. ✅ 用户登录：前后端实现基本完整
5. ✅ 获取用户信息：接口设计完整

### 幂等性要求检查
1. ✅ 验证码发送：60秒冷却时间机制
2. ✅ 用户注册：邮箱唯一性检查
3. ✅ 钱包创建：基于用户ID的幂等控制

### 错误处理检查
1. ✅ 错误码体系：已定义完整错误码
2. ⚠️ 错误响应格式：前后端需要统一实现
3. ⚠️ 异常分支：部分错误处理逻辑缺失

## 总结

项目整体架构设计合理，核心业务流程完整，但存在以下关键问题需要修复：

1. **路由路径不一致**：后端路由结构需要重构以匹配 OpenAPI 合约
2. **接口响应不一致**：注册接口的响应格式需要与合约对齐
3. **缺失关键文件**：多个引用的服务、中间件、工具文件未实现
4. **前后端协调**：注册后登录流程需要前后端统一方案

建议优先修复路由结构和接口响应问题，确保合约一致性，然后补充缺失的实现文件。
