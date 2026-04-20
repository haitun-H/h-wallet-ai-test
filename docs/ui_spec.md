好的，收到PRD。作为H Wallet的UI/UX设计师，我将基于PRD设计注册页面的视觉方案。

---

### **H Wallet 注册页面 UI/UX 设计方案**

**设计目标**：打造一个清晰、安全、符合Web3产品气质的注册流程，通过明确的视觉层次和即时反馈，引导用户顺畅完成注册。

---

#### **1. 注册页面组件树结构**

```
RegisterScreen (页面容器)
├── SafeAreaView (安全区域)
│   ├── ScrollView (可滚动内容区域，适配小屏)
│   │   ├── LogoHeader (Logo与标题区域)
│   │   │   ├── LogoImage
│   │   │   └── TitleText
│   │   ├── FormContainer (表单容器)
│   │   │   ├── EmailInput (邮箱输入框)
│   │   │   ├── PasswordInput (密码输入框)
│   │   │   ├── ConfirmPasswordInput (确认密码输入框)
│   │   │   ├── VerificationCodeInput (验证码输入框)
│   │   │   │   ├── TextInput
│   │   │   │   └── GetCodeButton (获取验证码按钮)
│   │   │   ├── AgreementCheckbox (协议勾选框)
│   │   │   └── RegisterButton (注册按钮)
│   │   └── LoginPrompt (登录提示)
│   │       ├── PromptText
│   │       └── LoginLinkText
│   └── KeyboardAvoidingView (键盘避让，iOS)
```

#### **2. 核心组件 Props 定义**

*   **EmailInput / PasswordInput / ConfirmPasswordInput / VerificationCodeInput**
    ```typescript
    interface InputFieldProps {
      value: string;
      onChangeText: (text: string) => void;
      placeholder: string;
      error?: string; // 错误提示信息，为空则不显示
      secureTextEntry?: boolean; // 是否隐藏输入（用于密码）
      editable?: boolean; // 是否可编辑
      leftIcon?: React.ReactNode; // 左侧图标（可选）
    }
    ```

*   **GetCodeButton**
    ```typescript
    interface GetCodeButtonProps {
      onPress: () => void;
      disabled: boolean; // 根据倒计时或邮箱格式禁用
      countdown?: number; // 倒计时秒数，0或undefined时显示“获取验证码”
    }
    ```

*   **AgreementCheckbox**
    ```typescript
    interface AgreementCheckboxProps {
      isChecked: boolean;
      onToggle: () => void;
      onLinkPress: () => void; // 点击协议链接的回调
    }
    ```

*   **RegisterButton**
    ```typescript
    interface RegisterButtonProps {
      onPress: () => void;
      disabled: boolean; // 根据表单验证状态禁用
      isLoading: boolean; // 注册请求中的加载状态
    }
    ```

#### **3. 颜色规范 (Color Palette)**

*   **主色 (Primary)**: `#3B82F6` (蓝色，代表信任与科技)
*   **成功色 (Success)**: `#10B981` (绿色)
*   **警告/错误色 (Error/Warning)**: `#EF4444` (红色)
*   **背景色 (Background)**:
    *   页面背景: `#FFFFFF` (纯白)
    *   输入框背景: `#F9FAFB` (浅灰)
    *   禁用状态背景: `#E5E7EB` (中灰)
*   **文字色 (Text)**:
    *   主要文字: `#111827` (深灰黑)
    *   次要文字/占位符: `#6B7280` (中灰)
    *   链接/按钮文字: `#3B82F6` (主色蓝)
    *   输入框边框 (默认): `#D1D5DB` (浅灰)
    *   输入框边框 (聚焦): `#3B82F6` (主色蓝)
    *   输入框边框 (错误): `#EF4444` (红色)

#### **4. 间距规范 (Spacing)**

使用 **8px** 作为基础单位 (单位: `unit = 8px`)。

*   **屏幕边距 (Screen Padding)**: `4 * unit = 32px`
*   **组件间垂直间距 (Vertical Gutter)**:
    *   大间距 (区块之间): `3 * unit = 24px`
    *   中间距 (表单项之间): `2 * unit = 16px`
    *   小间距 (元素内部): `1 * unit = 8px`
*   **组件内边距 (Inner Padding)**:
    *   输入框内边距: 水平 `3 * unit = 24px`， 垂直 `2 * unit = 16px`
    *   按钮内边距: 水平 `6 * unit = 48px`， 垂直 `2.5 * unit = 20px`
*   **圆角 (Border Radius)**:
    *   输入框/按钮: `2 * unit = 16px`
    *   小元素: `1 * unit = 8px`

#### **5. 字体规范 (Typography)**

*   **字族 (Font Family)**: 使用系统默认 `Inter` 或 `SF Pro Text` (iOS) / `Roboto` (Android)，确保清晰。
*   **字号与粗细 (Size & Weight)**:
    *   **H1 / 大标题**: `32px` / `FontWeight.Bold` (700) - 用于页面主标题
    *   **H2 / 标题**: `24px` / `FontWeight.SemiBold` (600) - 用于区块标题
    *   **Body / 正文**: `16px` / `FontWeight.Normal` (400) - 主要阅读文字
    *   **Caption / 说明文字**: `14px` / `FontWeight.Normal` (400) - 提示、错误信息
    *   **Button / 按钮文字**: `16px` / `FontWeight.SemiBold` (600)
    *   **Link / 链接文字**: `14px` / `FontWeight.Normal` (400) / 颜色 `#3B82F6`

---

### **下一步建议与待确认项**

1.  **待确认**：是否需要为“获取验证码”的加载状态设计一个微交互（如按钮宽度不变，文字变为“发送中...”）？
2.  **待确认**：协议详情模态框的设计，是使用全屏模态、底部弹窗还是内嵌WebView？需要单独设计。
3.  **建议**：在用户点击注册后，除了按钮变为加载状态，建议将整个表单设置为 `disabled` 以防止误操作。
4.  **建议**：欢迎引导页 (`/welcome`) 的UI方案需要根据PRD单独进行设计，其核心是展示钱包地址和提供昵称编辑入口。

此设计方案已包含所有视觉规范，前端工程师可据此直接编写 `StyleSheet`。
