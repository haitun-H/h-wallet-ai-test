好的，收到PRD。作为H Wallet的UI/UX设计师，我将基于PRD设计注册流程的界面方案。

---

### **H Wallet 注册流程 UI/UX 设计方案**

**设计目标**：打造一个简洁、清晰、符合Web3产品调性的注册流程，确保用户能顺畅完成邮箱注册并获取钱包地址。

---

#### **1. 颜色规范 (Color Palette)**

*   **主色 (Primary)**: `#3B82F6` (用于主要按钮、激活状态)
*   **辅色 (Secondary)**: `#10B981` (用于成功状态、完成提示)
*   **背景色 (Background)**:
    *   页面背景: `#FFFFFF`
    *   输入框背景: `#F9FAFB`
    *   卡片/容器背景: `#FFFFFF`
*   **文字色 (Text)**:
    *   主要文字: `#111827`
    *   次要文字/提示文字: `#6B7280`
    *   占位符文字: `#9CA3AF`
    *   错误提示: `#EF4444`
*   **边框色 (Border)**:
    *   默认边框: `#E5E7EB`
    *   焦点/激活边框: `#3B82F6`
    *   错误边框: `#EF4444`

---

#### **2. 间距规范 (Spacing)**

基于 `8px` 基准单位。
*   **XS**: `4px`
*   **S**: `8px`
*   **M**: `16px`
*   **L**: `24px`
*   **XL**: `32px`
*   **XXL**: `48px`
*   **页面边距 (Screen Padding)**: `24px`

---

#### **3. 字体规范 (Typography)**

*   **字族**: 使用系统默认 `Inter` 或 `SF Pro Text` (iOS) / `Roboto` (Android)，在 `StyleSheet` 中定义为 `fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'`。
*   **标题 (H1)**: `fontSize: 32px`, `fontWeight: '700'`
*   **标题 (H2)**: `fontSize: 24px`, `fontWeight: '600'`
*   **正文 (Body)**: `fontSize: 16px`, `fontWeight: '400'`
*   **标签/按钮文字 (Label/Button)**: `fontSize: 16px`, `fontWeight: '500'`
*   **提示文字 (Caption)**: `fontSize: 14px`, `fontWeight: '400'`
*   **小标签 (Micro)**: `fontSize: 12px`, `fontWeight: '400'`

---

#### **4. 页面一：注册页面 (`/register`) 组件树与 Props**

**组件树**:
```
RegisterScreen (View)
├── SafeAreaView (确保内容在安全区内)
├── ScrollView (可滚动容器)
│   ├── View (内容容器)
│   │   ├── Logo/AppName (Text) - 可选
│   │   ├── Title (Text) - “创建 H Wallet 账户”
│   │   ├── EmailInput (自定义组件)
│   │   │   ├── InputLabel (Text) - “邮箱地址”
│   │   │   ├── TextInput
│   │   │   └── ErrorText (Text) - 邮箱验证错误信息
│   │   ├── PasswordInput (自定义组件)
│   │   │   ├── InputLabel (Text) - “密码”
│   │   │   ├── TextInput (secureTextEntry)
│   │   │   ├── ToggleVisibilityIcon (TouchableOpacity + Icon)
│   │   │   └── ErrorText (Text) - 密码验证错误信息
│   │   ├── ConfirmPasswordInput (自定义组件) - 结构与PasswordInput相同
│   │   ├── TermsCheckbox (自定义组件)
│   │   │   ├── TouchableOpacity
│   │   │   │   ├── CheckboxIcon (View/自定义图标)
│   │   │   │   └── TermsText (Text) - 包含可点击的“服务条款”
│   │   │   └── ErrorText (Text) - 未勾选错误信息
│   │   ├── RegisterButton (自定义组件)
│   │   │   └── TouchableOpacity
│   │   │       ├── ActivityIndicator (加载时显示)
│   │   │       └── ButtonText (Text) - “注册” / “注册中...”
│   │   └── LoginLink (TouchableOpacity)
│   │       └── LinkText (Text) - “已有账户？去登录”
│   └── KeyboardAvoidingView (可选，用于处理键盘遮挡)
```

**关键自定义组件 Props**:
*   `EmailInput`:
    *   `value: string`
    *   `onChangeText: (text: string) => void`
    *   `error: string | null`
    *   `editable: boolean` (用于加载状态)
*   `PasswordInput` / `ConfirmPasswordInput` (继承自 `BaseTextInput`):
    *   `value: string`
    *   `onChangeText: (text: string) => void`
    *   `error: string | null`
    *   `editable: boolean`
    *   `label: string`
    *   `isPassword: boolean` (内部使用)
    *   `showPassword: boolean` (内部状态)
    *   `onToggleVisibility: () => void` (内部方法)
*   `TermsCheckbox`:
    *   `isChecked: boolean`
    *   `onToggle: () => void`
    *   `error: string | null`
*   `RegisterButton`:
    *   `onPress: () => void`
    *   `isLoading: boolean`
    *   `disabled: boolean` (通常由 `isLoading` 或表单验证状态控制)

---

#### **5. 页面二：注册成功页 (`/register/success`) 组件树与 Props**

**组件树**:
```
RegistrationSuccessScreen (View)
├── SafeAreaView
├── ScrollView
│   └── View (内容容器，使用 `alignItems: 'center', justifyContent: 'center', flex: 1`)
│       ├── SuccessLottie (LottieView) - 播放成功动画
│       ├── Title (Text) - “欢迎加入 H Wallet！”
│       ├── Message (Text) - “您的专属钱包已创建成功”
│       ├── WalletAddressCard (View)
│       │   ├── AddressLabel (Text) - “您的钱包地址”
│       │   ├── AddressText (Text) - 显示 `walletAddress`
│       │   └── CopyButton (TouchableOpacity)
│       │       ├── CopyIcon (Icon)
│       │       └── CopyButtonText (Text) - “复制”
│       └── GoToWalletButton (TouchableOpacity)
│           └── ButtonText (Text) - “进入钱包”
```

**关键自定义组件 Props**:
*   `WalletAddressCard`:
    *   `walletAddress: string`
    *   `onCopyPress: () => void` (复制地址到剪贴板)
*   `GoToWalletButton`:
    *   `onPress: () => void` (导航到 `/home`)

---

#### **6. 交互与状态说明**

1.  **表单验证**:
    *   **实时验证**: 每个字段 `onChangeText` 时触发验证，错误信息显示在对应输入框下方 (`ErrorText`)，输入框边框变红。
    *   **提交验证**: 点击注册按钮时，再次验证全部字段。如有错误，滚动到第一个错误字段位置并显示提示。
2.  **加载状态**:
    *   注册 API 调用期间，`RegisterButton` 显示 `ActivityIndicator`，文字变为“注册中...”，且按钮和所有输入框 `editable` 为 `false`。
3.  **成功跳转**:
    *   注册成功后，导航到成功页，并可通过 `route.params` 传递 `walletAddress` 进行展示。
4.  **错误提示**:
    *   网络或API错误，使用全局 `Toast` 或页面顶部的 `Banner` 组件进行提示（例如，一个红色的 `View` 从顶部滑入），提示文案使用后端返回的 `error` 字段。

---

**下一步建议**：
1.  **待确认**：成功页的 Lottie 动画资源文件。
2.  **待确认**：图标资源（眼睛开/闭、复制、勾选）是使用图标库（如 `@expo/vector-icons`）还是自定义 SVG。
3.  **建议**：为输入框添加 `onFocus` / `onBlur` 样式变化（边框颜色），提升交互反馈。
