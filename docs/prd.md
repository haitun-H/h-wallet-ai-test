好的，收到任务。作为 H Wallet 的产品经理，我将首先输出一份详细的PRD，作为UI设计师、前端和后端工程师的唯一依据。

---

### **H Wallet 注册功能产品需求文档 (PRD)**

**项目概述**：开发 H Wallet 的 MVP 注册页面，用户通过邮箱注册后，系统自动为其在 OKX OnchainOS 上创建一个 Agent Wallet。

---

#### **1. 功能需求列表**

| 编号 | 描述 | 优先级 |
| :--- | :--- | :--- |
| FR-01 | **邮箱注册页面**：提供一个简洁的界面，包含邮箱输入框、密码输入框、确认密码输入框、服务条款勾选框和注册按钮。 | P0 (必须) |
| FR-02 | **前端表单验证**：在用户输入时和提交前进行实时验证。验证规则：邮箱格式正确；密码长度至少8位，且包含字母和数字；确认密码与密码一致；必须勾选服务条款。 | P0 |
| FR-03 | **调用后端注册API**：前端通过 API 将邮箱、密码（加密后）发送至后端。 | P0 |
| FR-04 | **后端处理注册逻辑**：后端接收数据，验证邮箱唯一性，调用 OKX OnchainOS API 创建 Agent Wallet。 | P0 |
| FR-05 | **注册成功处理**：注册成功后，后端返回用户基础信息和钱包地址，前端跳转到“注册成功”欢迎页。 | P0 |
| FR-06 | **错误处理与用户提示**：对网络错误、邮箱已注册、密码不符合规则、API调用失败等情况，在前端给出明确的 toast 或弹窗提示。 | P0 |
| FR-07 | **加载状态**：在 API 调用期间，注册按钮应显示加载状态，防止重复提交。 | P1 (重要) |

---

#### **2. API接口定义**

**2.1 用户注册接口**

*   **路径**: `/api/v1/auth/register`
*   **方法**: `POST`
*   **请求头**: `Content-Type: application/json`
*   **请求体 (Request Body)**:
    ```json
    {
      "email": "string, 用户邮箱",
      "password": "string, 用户密码（前端需使用 HTTPS + 非对称加密传输，此处为加密后的密文）"
    }
    ```
*   **成功响应 (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "userId": "string, 系统生成的用户唯一ID",
        "email": "string, 用户邮箱",
        "walletAddress": "string, OKX OnchainOS 返回的 Agent Wallet 地址",
        "createdAt": "string, ISO 8601 格式的创建时间"
      },
      "message": "注册成功"
    }
    ```
*   **错误响应 (示例)**:
    *   `400 Bad Request`: 请求参数格式错误或验证失败。
        ```json
        { "success": false, "error": "邮箱格式不正确" }
        ```
    *   `409 Conflict`: 邮箱已被注册。
        ```json
        { "success": false, "error": "该邮箱已被注册" }
        ```
    *   `500 Internal Server Error`: 服务器内部错误或 OKX API 调用失败。
        ```json
        { "success": false, "error": "创建钱包失败，请稍后重试" }
        ```

---

#### **3. 数据模型定义**

**3.1 用户表 (`users`)**

| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `_id` | ObjectId | 主键，MongoDB 自动生成 |
| `userId` | String | 系统生成的用户唯一标识 (如: `usr_xxx`) |
| `email` | String | 用户邮箱，唯一索引 |
| `passwordHash` | String | 加盐后的密码哈希值 |
| `walletAddress` | String | 关联的 OKX Agent Wallet 地址 |
| `createdAt` | Date | 创建时间 |
| `updatedAt` | Date | 更新时间 |

---

#### **4. 页面列表**

| 页面名 | 路由 | 核心组件与说明 |
| :--- | :--- | :--- |
| **注册页面** | `/register` | 1. **邮箱输入框** (`TextInput`) <br> 2. **密码输入框** (`TextInput`, 安全文本输入) <br> 3. **确认密码输入框** (`TextInput`, 安全文本输入) <br> 4. **服务条款勾选框** (`CheckBox` + 可点击的文本链接) <br> 5. **注册按钮** (`Button`， 需支持加载状态) <br> 6. **底部导航**：已有账户？去登录（链接到 `/login`，MVP可先占位） |
| **注册成功页** | `/register/success` | 1. **成功图标** (Lottie 或 SVG) <br> 2. **欢迎标题** (`Text`) <br> 3. **钱包地址展示** (`Text`, 可复制) <br> 4. **进入钱包按钮** (`Button`， 点击后跳转到未来主页 `/home`，MVP可先占位) |

---

#### **5. 注册流程的完整时序图（文字描述）**

1.  **用户** 在 H Wallet App 中打开注册页面 (`/register`)。
2.  **用户** 填写邮箱、密码、确认密码，勾选服务条款。
3.  **前端** 实时进行表单验证（FR-02）。如验证不通过，在输入框下方显示错误提示。
4.  **用户** 点击“注册”按钮。
5.  **前端** 再次进行提交前验证。验证通过后，将密码进行非对称加密（使用后端提供的公钥），并禁用按钮、显示加载状态（FR-07）。
6.  **前端** 将 `{email, encryptedPassword}` 通过 `POST` 请求发送到后端 `/api/v1/auth/register`（FR-03）。
7.  **后端** 接收请求，解密密码（使用私钥），验证邮箱格式和唯一性（查询 `users` 集合）。
8.  **后端** 若邮箱已存在，返回 `409 Conflict` 错误。
9.  **后端** 若邮箱可用，对密码进行加盐哈希处理，生成 `userId`。
10. **后端** 构造请求，调用 **OKX OnchainOS API** 的 `创建 Agent Wallet` 接口（需根据 OKX 官方文档确定具体路径和参数），将 `userId` 或 `email` 作为关联标识传入。
11. **OKX OnchainOS** 创建成功，返回 `walletAddress`。
12. **后端** 将 `userId`, `email`, `passwordHash`, `walletAddress` 存入 `users` 表。
13. **后端** 返回 `200 OK` 响应，包含用户信息和 `walletAddress`（FR-05）。
14. **前端** 收到成功响应，跳转到注册成功页面 (`/register/success`)，并展示欢迎信息和钱包地址。
15. **前端** 如有任何错误（网络错误、4xx/5xx状态码），则根据错误信息，在页面顶部或通过弹窗向用户展示友好错误提示（FR-06），并恢复注册按钮为可点击状态。

---

**下一步建议与待确认项**：
1.  **待确认**：OKX OnchainOS API 创建 Agent Wallet 的具体接口文档（路径、请求头、认证方式、请求/响应格式）。
2.  **待确认**：前端密码非对称加密的具体方案（例如，使用 `jsencrypt` 库，后端需提供公钥端点 `/api/v1/auth/public-key`）。
3.  **建议**：为 `walletAddress` 在注册成功页增加“点击复制”功能，提升用户体验。
