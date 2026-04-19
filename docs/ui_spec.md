好的，收到PRD。作为H Wallet的UI/UX设计师，我将基于PRD设计注册页面的视觉方案。

---

### **H Wallet MVP 注册页面 UI/UX 设计方案**

**设计目标**：打造一个简洁、清晰、引导性强的注册流程，突出核心信息（钱包地址），并确保良好的错误反馈体验。

---

### **1. 页面组件树结构**

```
RegisterScreen (页面容器)
├── SafeAreaView (安全区域)
│   ├── ScrollView (可滚动区域，适配键盘弹出)
│   │   ├── View (内容容器)
│   │   │   ├── Logo (应用Logo)
│   │   │   ├── Text (标题：“创建你的链上钱包”)
│   │   │   ├── Text (副标题：“仅需邮箱，快速开始”)
│   │   │   ├── FormSection (表单区域)
│   │   │   │   ├── InputField (邮箱输入框)
│   │   │   │   │   ├── TextInput
│   │   │   │   │   └── Text (错误提示，条件渲染)
│   │   │   │   ├── InputFieldWithButton (验证码输入框+发送按钮)
│   │   │   │   │   ├── TextInput
│   │   │   │   │   ├── Button (发送验证码/倒计时)
│   │   │   │   │   └── Text (错误提示，条件渲染)
│   │   │   │   └── PrimaryButton (主按钮：“发送验证码”/“注册”/“处理中...”)
│   │   │   ├── StatusCard (状态卡片，条件渲染)
│   │   │   │   ├── ActivityIndicator (加载动画)
│   │   │   │   ├── Text (成功/错误信息)
│   │   │   │   ├── Text (钱包地址)
│   │   │   │   └── Button (复制地址按钮)
│   │   │   └── Text (服务条款提示)
```

---

### **2. 核心组件 Props 定义**

**1. InputField**
```typescript
interface InputFieldProps {
  label: string; // 输入框标签，如“邮箱地址”
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions; // 如 ‘email-address’
  autoCapitalize?: ‘none’ | ‘sentences’ | ‘words’ | ‘characters’;
  error?: string | null; // 错误信息，无错误时为null
  editable?: boolean;
}
```

**2. InputFieldWithButton** (继承自 `InputFieldProps`)
```typescript
interface InputFieldWithButtonProps extends Omit<InputFieldProps, ‘label’> {
  onButtonPress: () => void; // 发送验证码按钮点击事件
  buttonTitle: string; // 按钮文字，如“发送”或“60s”
  buttonDisabled: boolean; // 按钮是否禁用（用于倒计时）
  loading?: boolean; // 发送请求时的加载状态
}
```

**3. PrimaryButton**
```typescript
interface PrimaryButtonProps {
  title: string; // 按钮文字
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean; // 注册请求时的加载状态
}
```

**4. StatusCard**
```typescript
interface StatusCardProps {
  type: ‘loading’ | ‘success’ | ‘error’; // 卡片类型
  message?: string; // 主要信息，如“注册成功！”
  detail?: string; // 详细信息，如钱包地址或具体错误描述
  onCopyPress?: () => void; // 复制按钮点击事件，仅在type=‘success’时存在
}
```

---

### **3. 设计规范**

#### **颜色规范 (Color Palette)**
- **主色 (Primary)**: `#3B82F6` (蓝色，代表信任与科技)
- **成功色 (Success)**: `#10B981` (绿色)
- **错误色 (Error)**: `#EF4444` (红色)
- **背景色 (Background)**: `#FFFFFF` (白色) / `#F9FAFB` (浅灰，用于次要背景)
- **文字主色 (Text Primary)**: `#111827` (深灰，用于标题、主要文字)
- **文字副色 (Text Secondary)**: `#6B7280` (中灰，用于副标题、提示文字)
- **边框色 (Border)**: `#D1D5DB` (浅灰)
- **按钮禁用色 (Button Disabled)**: `#9CA3AF` (灰色)

#### **间距规范 (Spacing)**
基于 `8px` 基准单位。
- **页面边距 (Screen Padding)**: `24px`
- **组件间垂直间距 (Vertical Gutter)**:
    - 大间距: `32px` (如标题与表单之间)
    - 中间距: `24px` (如表单内区块之间)
    - 小间距: `16px` (如输入框与错误提示之间)
    - 微小间距: `8px` (如标签与输入框之间)
- **组件内边距 (Inner Padding)**:
    - 输入框: 水平 `16px`，垂直 `14px`
    - 按钮: 垂直 `16px`，水平 `24px`
    - 状态卡片: `20px`

#### **字体规范 (Typography)**
- **字族**: 系统默认 (San Francisco on iOS, Roboto on Android)
- **标题 (H1)**: `24px` / `Semibold (600)` / `#111827`
- **副标题 (Subtitle)**: `16px` / `Normal (400)` / `#6B7280`
- **正文/输入文字 (Body)**: `16px` / `Normal (400)` / `#111827`
- **标签/按钮文字 (Label/Button)**: `16px` / `Medium (500)` / `#FFFFFF` (按钮上)
- **提示/错误文字 (Caption/Error)**: `14px` / `Normal (400)` / `#6B7280` 或 `#EF4444`
- **钱包地址文字**: `14px` / `Normal (400)` / `#10B981`，使用 `fontFamily: ‘monospace’` 以便清晰显示。

---

### **4. 页面状态与交互说明**

1.  **初始状态**：仅显示邮箱输入框和主按钮（标题为“发送验证码”）。验证码输入框和发送按钮隐藏。
2.  **邮箱验证后**：
    - 用户点击“发送验证码”，按钮变为禁用并开始60秒倒计时（显示“60s”、“59s”...）。
    - 显示验证码输入框和发送按钮（初始为“发送”，倒计时期间为“60s”并禁用）。
    - 主按钮标题变为“注册”。
3.  **加载状态**：任何网络请求（发送验证码、注册）触发时，对应按钮显示 `loading` 状态（旋转指示器），并禁用。
4.  **成功状态**：注册成功后，隐藏表单，显示 `StatusCard`，类型为 `success`，展示钱包地址和“复制地址”按钮。
5.  **错误状态**：任何步骤出错（网络、验证码错误等），在对应输入框下方显示红色错误提示文本，或通过 `StatusCard`（类型为 `error`）显示全局错误。

---

**下一步建议/待确认项**：
1.  请前端工程师确认 React Native 项目中是否已引入合适的图标库（如 `@expo/vector-icons`）用于加载指示器和复制图标。
2.  关于“服务条款提示”的具体文案和链接，需要产品经理提供。
3.  设计稿中的具体图标（如Logo）需要提供资源文件。
