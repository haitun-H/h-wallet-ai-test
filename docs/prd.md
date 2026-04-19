# H Wallet MVP 版本PRD

## 1. 功能需求列表

| 编号 | 描述 | 优先级 |
|------|------|---------|
| FR-001 | 用户输入邮箱地址进行注册 | P0 |
| FR-002 | 系统向用户邮箱发送6位数字验证码 | P0 |
| FR-003 | 用户输入收到的验证码进行验证 | P0 |
| FR-004 | 验证通过后，后端调用OKX OnchainOS API创建Agent Wallet | P0 |
| FR-005 | 创建成功后，前端显示新创建的钱包地址 | P0 |
| FR-006 | 注册失败时显示明确的错误信息 | P1 |
| FR-007 | 验证码60秒内有效，过期需重新获取 | P1 |
| FR-008 | 验证码发送频率限制：同一邮箱60秒内只能发送一次 | P1 |

## 2. API接口定义

### 2.1 后端API接口

#### 2.1.1 发送验证码
```
路径：/api/auth/send-verification
方法：POST
参数：
{
  "email": "string" // 必填，用户邮箱
}
返回值：
{
  "success": boolean,
  "message": "string",
  "data": {
    "expiresAt": "timestamp" // 验证码过期时间
  }
}
```

#### 2.1.2 验证并创建钱包
```
路径：/api/auth/register
方法：POST
参数：
{
  "email": "string", // 必填，用户邮箱
  "code": "string"   // 必填，6位验证码
}
返回值：
{
  "success": boolean,
  "message": "string",
  "data": {
    "walletAddress": "string", // 创建的钱包地址
    "userId": "string",        // 用户ID
    "createdAt": "timestamp"   // 创建时间
  }
}
```

### 2.2 外部API（OKX OnchainOS）

#### 2.2.1 创建Agent Wallet
```
路径：https://api.okx.com/onchainos/v1/agent-wallets
方法：POST
Headers：
{
  "Authorization": "Bearer {api_key}",
  "Content-Type": "application/json"
}
参数：
{
  "label": "string" // 钱包标签，使用用户邮箱
}
返回值：
{
  "id": "string",           // 钱包ID
  "address": "string",      // 钱包地址
  "label": "string",        // 钱包标签
  "created_at": "timestamp" // 创建时间
}
```

## 3. 数据模型定义

### 3.1 用户表 (users)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string (UUID) | 用户唯一标识 |
| email | string | 用户邮箱，唯一索引 |
| wallet_address | string | 钱包地址 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

### 3.2 验证码表 (verification_codes)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string (UUID) | 验证码ID |
| email | string | 邮箱地址 |
| code | string(6) | 6位数字验证码 |
| expires_at | timestamp | 过期时间 |
| used | boolean | 是否已使用 |
| created_at | timestamp | 创建时间 |

## 4. 页面列表

### 4.1 注册页面
- **页面名**: 注册页面
- **路由**: /register
- **核心组件**:
  1. Email输入框
  2. 发送验证码按钮
  3. 验证码输入框
  4. 注册按钮
  5. 加载状态指示器
  6. 错误信息提示框

### 4.2 注册成功页面
- **页面名**: 注册成功页面
- **路由**: /register/success
- **核心组件**:
  1. 成功图标
  2. 钱包地址显示区域
  3. 复制地址按钮
  4. 返回首页按钮

## 5. 注册流程时序图（文字描述）

1. **用户端操作**:
   - 用户在注册页面输入邮箱地址
   - 点击"发送验证码"按钮

2. **前端处理**:
   - 验证邮箱格式
   - 调用后端API `/api/auth/send-verification`
   - 显示"验证码已发送"提示
   - 启动60秒倒计时

3. **后端处理（发送验证码）**:
   - 检查邮箱是否已注册
   - 检查发送频率限制（60秒内只能发送一次）
   - 生成6位随机验证码
   - 将验证码存入数据库（设置60秒过期）
   - 调用邮件服务发送验证码
   - 返回发送成功响应

4. **用户端操作**:
   - 用户查看邮箱获取验证码
   - 在App中输入验证码
   - 点击"注册"按钮

5. **前端处理**:
   - 调用后端API `/api/auth/register`
   - 显示加载状态

6. **后端处理（注册）**:
   - 验证邮箱和验证码是否匹配
   - 检查验证码是否过期
   - 标记验证码为已使用
   - 调用OKX OnchainOS API创建Agent Wallet
   - 将用户信息和钱包地址存入数据库
   - 返回注册成功响应（包含钱包地址）

7. **前端处理**:
   - 接收成功响应
   - 跳转到注册成功页面
   - 显示钱包地址

8. **用户端操作**:
   - 查看钱包地址
   - 可复制钱包地址
   - 完成注册流程

---

**下一步建议**:
1. 需要申请OKX OnchainOS的API Key
2. 需要配置邮件服务（如SendGrid、Mailgun等）
3. 需要设置数据库（建议使用PostgreSQL）

**待确认项**:
1. OKX API的具体认证方式（文档中提到的API Key格式）
2. 邮件服务提供商的选择
3. 生产环境数据库配置
