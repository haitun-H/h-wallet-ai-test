好的，收到。作为H Wallet的产品经理，我将首先输出MVP版本的详细PRD，作为后续所有设计和开发工作的唯一依据。

---

### **H Wallet MVP 版本产品需求文档 (PRD)**

**项目概述**：H Wallet MVP 的核心目标是实现用户通过邮箱快速注册，并自动为其创建一个由OKX OnchainOS托管的Agent Wallet链上钱包。此版本聚焦于注册和钱包创建流程，不包含任何资产管理、交易或DApp交互功能。

---

### **1. 功能需求列表**

| 编号 | 描述 | 优先级 |
| :--- | :--- | :--- |
| FR-01 | **用户注册**：用户在前端App输入邮箱地址，请求发送验证码。 | P0 (必须) |
| FR-02 | **验证码服务**：后端接收邮箱，生成并发送6位数字验证码至该邮箱，并设置5分钟有效期。 | P0 (必须) |
| FR-03 | **验证码校验**：用户输入收到的验证码，后端校验验证码的正确性及有效性。 | P0 (必须) |
| FR-04 | **创建Agent Wallet**：验证码通过后，后端调用OKX OnchainOS API，为该用户创建一个新的Agent Wallet。 | P0 (必须) |
| FR-05 | **数据存储**：后端将用户邮箱、加密后的钱包地址（由OKX返回）关联存储。 | P0 (必须) |
| FR-06 | **注册成功反馈**：前端在注册成功后，清晰展示创建成功的钱包地址。 | P0 (必须) |
| FR-07 | **基础错误处理**：对网络错误、验证码错误、邮箱已注册、OKX API调用失败等情况，前端需有明确的错误提示。 | P0 (必须) |

---

### **2. API接口定义**

#### **后端服务API (Node.js)**

**2.1 发送验证码**
- **路径**: `/api/auth/send-code`
- **方法**: `POST`
- **请求参数 (Body, JSON)**:
    ```json
    {
      "email": "user@example.com"
    }
    ```
- **成功响应 (200)**:
    ```json
    {
      "success": true,
      "message": "验证码已发送"
    }
    ```
- **错误响应 (4xx/5xx)**:
    ```json
    {
      "success": false,
      "error": "错误描述，如：邮箱格式错误、发送频率过高"
    }
    ```

**2.2 验证并注册**
- **路径**: `/api/auth/verify-and-register`
- **方法**: `POST`
- **请求参数 (Body, JSON)**:
    ```json
    {
      "email": "user@example.com",
      "code": "123456"
    }
    ```
- **成功响应 (200)**:
    ```json
    {
      "success": true,
      "data": {
        "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e...",
        "message": "钱包创建成功"
      }
    }
    ```
- **错误响应 (4xx)**:
    ```json
    {
      "success": false,
      "error": "错误描述，如：验证码错误或过期、邮箱已注册"
    }
    ```

#### **外部依赖API (OKX OnchainOS)**
根据文档，创建Agent Wallet的核心调用如下：
- **路径**: `POST /api/v5/waas/wallet/create-wallet`
- **认证**: 使用OKX提供的API Key/Secret进行签名认证。
- **请求体**: 根据文档，可能需要包含`subAccount`（我们可以用邮箱的哈希值）和`walletName`（可固定为`H_Wallet`）等参数。
- **响应**: 将包含`walletAddr`（钱包地址）等关键信息。

> **待确认项**：需要根据OKX提供的具体API文档和账户权限，最终确认请求/响应格式。

---

### **3. 数据模型定义**

#### **用户表 (users)**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | `INT (PK, Auto-Increment)` | 主键 |
| `email` | `VARCHAR(255), UNIQUE` | 用户邮箱，唯一标识 |
| `walletAddress` | `VARCHAR(255)` | OKX返回的钱包地址，建议加密存储 |
| `createdAt` | `TIMESTAMP` | 记录创建时间 |
| `updatedAt` | `TIMESTAMP` | 记录更新时间 |

#### **验证码表 (verification_codes)**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | `INT (PK, Auto-Increment)` | 主键 |
| `email` | `VARCHAR(255)` | 接收验证码的邮箱 |
| `code` | `VARCHAR(6)` | 6位数字验证码 |
| `expiresAt` | `TIMESTAMP` | 过期时间（当前时间+5分钟） |
| `createdAt` | `TIMESTAMP` | 记录创建时间 |

---

### **4. 页面列表**

整个MVP只有一个核心页面：**注册页面**。

| 页面名 | 路由/组件 | 核心组件与状态 |
| :--- | :--- | :--- |
| **注册页面** | `app/(auth)/register.tsx` (Expo Router) | 1. **邮箱输入框**：带格式校验。<br>2. **验证码输入框**：仅在邮箱验证后显示。<br>3. **发送验证码按钮**：点击后触发`/api/auth/send-code`，并开始60秒倒计时。<br>4. **注册按钮**：初始为“发送验证码”，邮箱验证后变为“注册”。点击后触发`/api/auth/verify-and-register`。<br>5. **状态显示区**：用于显示加载状态、成功信息（钱包地址）或错误提示。 |

---

### **5. 注册流程的完整时序图（文字描述）**

1.  **前端 (React Native App)**:
    - 用户打开App，进入注册页面。
    - 用户输入邮箱，点击“发送验证码”按钮。

2.  **后端 (Node.js API)**:
    - 接收`/api/auth/send-code`请求。
    - 校验邮箱格式。
    - 生成6位随机数字验证码。
    - 将`邮箱、验证码、过期时间`存入`verification_codes`表。
    - 调用邮件服务（如SendGrid, SMTP）发送验证码邮件。
    - 返回成功响应给前端。

3.  **前端**:
    - 收到成功响应，禁用“发送验证码”按钮并开始60秒倒计时。
    - 显示验证码输入框。
    - 用户输入收到的验证码，点击“注册”按钮。

4.  **后端**:
    - 接收`/api/auth/verify-and-register`请求。
    - 在`verification_codes`表中查找该邮箱最新的有效验证码（未过期）。
    - 比对用户输入的验证码。**如果失败，返回错误**。
    - **如果成功**：
        a. 检查`users`表中该邮箱是否已存在。**如果存在，返回错误**。
        b. 准备参数，调用 **OKX OnchainOS API** (`/api/v5/waas/wallet/create-wallet`)。
        c. 接收OKX返回的`walletAddr`（钱包地址）。
        d. 将`邮箱`和`钱包地址`作为一条新记录存入`users`表。
        e. 返回成功响应及`walletAddress`给前端。

5.  **前端**:
    - 收到成功响应。
    - 显示注册成功提示，并清晰展示创建的钱包地址（例如，可以提供一个“复制地址”按钮）。

---

**下一步建议**：
1.  后端工程师需根据此PRD搭建Node.js服务，并重点对接OKX API。
2.  前端工程师需根据此PRD搭建Expo项目，实现注册页面逻辑。
3.  需要申请和配置OKX WaaS服务、邮件发送服务以及数据库（如PostgreSQL）。
