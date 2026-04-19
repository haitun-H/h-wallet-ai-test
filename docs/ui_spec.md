好的，同事。根据产品经理的PRD，我已完成H Wallet MVP版本的UI/UX设计方案。

## 🎨 设计方案总览

本方案包含两个页面：**注册页面** 和 **注册成功页面**。设计遵循简洁、清晰、易用的原则，确保用户能流畅完成注册流程。

---

### **1. 注册页面 (`/register`)**

**页面目标**：引导用户输入邮箱和验证码，完成注册。

#### **组件树结构**
```
SafeAreaView (容器)
├── KeyboardAvoidingView (处理键盘遮挡)
│   ├── ScrollView (确保内容可滚动)
│   │   ├── View (内容容器)
│   │   │   ├── Logo/AppName (品牌标识)
│   │   │   ├── Text (页面标题)
│   │   │   ├── FormInput (邮箱输入框)
│   │   │   │   ├── TextInput
│   │   │   │   └── Text (错误提示，条件渲染)
│   │   │   ├── View (验证码输入行)
│   │   │   │   ├── FormInput (验证码输入框)
│   │   │   │   │   ├── TextInput
│   │   │   │   │   └── Text (错误提示，条件渲染)
│   │   │   │   └── CountdownButton (发送验证码按钮)
│   │   │   ├── PrimaryButton (注册按钮)
│   │   │   └── ActivityIndicator (加载指示器，条件渲染)
│   │   └── View (底部填充，用于键盘弹起)
```

#### **组件Props定义**
*   **`FormInput`**:
    ```typescript
    interface FormInputProps {
      label: string;
      value: string;
      onChangeText: (text: string) => void;
      placeholder: string;
      error?: string; // 错误信息，为空则不显示错误状态
      keyboardType?: KeyboardTypeOptions; // 如 'email-address', 'numeric'
      editable?: boolean;
      secureTextEntry?: boolean;
    }
    ```
*   **`CountdownButton`**:
    ```typescript
    interface CountdownButtonProps {
      onPress: () => void;
      disabled: boolean; // 根据倒计时或加载状态禁用
      countdown: number; // 当前倒计时秒数，0表示可点击
    }
    ```
*   **`PrimaryButton`**:
    ```typescript
    interface PrimaryButtonProps {
      title: string;
      onPress: () => void;
      disabled?: boolean;
      loading?: boolean; // 显示加载指示器
    }
    ```

---

### **2. 注册成功页面 (`/register/success`)**

**页面目标**：清晰展示注册成功的结果和生成的钱包地址。

#### **组件树结构**
```
SafeAreaView (容器)
├── ScrollView (内容可滚动)
│   └── View (内容容器)
│       ├── SuccessIcon (成功图标，如勾选动画)
│       ├── Text (成功标题)
│       ├── Text (成功描述)
│       ├── WalletAddressCard (钱包地址卡片)
│       │   ├── Text (卡片标题，如“您的钱包地址”)
│       │   ├── View (地址显示行)
│       │   │   ├── Text (钱包地址字符串)
│       │   │   └── CopyButton (复制按钮)
│       │   └── Text (提示信息，如“点击复制”)
│       └── PrimaryButton (完成/返回首页按钮)
```

#### **组件Props定义**
*   **`WalletAddressCard`**:
    ```typescript
    interface WalletAddressCardProps {
      address: string; // 完整的钱包地址字符串
      onCopyPress: () => void; // 复制地址的回调
    }
    ```
*   **`CopyButton`**:
    ```typescript
    interface CopyButtonProps {
      onPress: () => void;
    }
    ```

---

### **3. 设计规范 (Design Tokens)**

#### **颜色规范 (Colors)**
*   **主色 (Primary)**: `#3B82F6` (蓝色，用于主要按钮、激活状态)
*   **成功色 (Success)**: `#10B981` (绿色，用于成功状态、图标)
*   **警告/错误色 (Error)**: `#EF4444` (红色，用于错误提示)
*   **文字主色 (Text Primary)**: `#111827` (深灰色，用于主要标题、正文)
*   **文字副色 (Text Secondary)**: `#6B7280` (中灰色，用于提示、标签)
*   **边框色 (Border)**: `#D1D5DB` (浅灰色，用于输入框边框)
*   **背景色 (Background)**: `#FFFFFF` (白色，页面背景)
*   **卡片背景色 (Card Background)**: `#F9FAFB` (极浅灰色，用于卡片背景)

#### **间距规范 (Spacing)**
基于 `8px` 基准单位。
*   **`xs`**: `4px`
*   **`sm`**: `8px`
*   **`md`**: `16px` **(最常用)**
*   **`lg`**: `24px`
*   **`xl`**: `32px`
*   **`xxl`**: `48px`
*   **页面边距 (Screen Padding)**: `md` (`16px`)
*   **组件内部间距 (Inner Padding)**: `sm` (`8px`) / `md` (`16px`)
*   **组件间间距 (Margin between components)**: `lg` (`24px`)

#### **字体规范 (Typography)**
*   **字族**: 使用系统默认 `Inter` 或 `SF Pro Text`，确保清晰。
*   **大小与粗细**:
    *   **大标题 (H1)**: `30px` / `FontWeight.Bold` (700)
    *   **标题 (H2)**: `24px` / `FontWeight.SemiBold` (600)
    *   **正文 (Body)**: `16px` / `FontWeight.Normal` (400)
    *   **标签/按钮文字 (Label/Button)**: `16px` / `FontWeight.Medium` (500)
    *   **提示文字 (Caption)**: `14px` / `FontWeight.Normal` (400)
    *   **输入框文字 (Input)**: `16px` / `FontWeight.Normal` (400)

---

### **下一步建议与待确认项**
1.  **动效确认**: 注册成功页面的“成功图标”是否需要特定的Lottie动画？还是使用静态图标？
2.  **键盘类型**: 验证码输入框是否应使用 `numeric` 键盘并自动聚焦下一个输入？PRD中未明确，建议采用以提升体验。
3.  **错误状态UI**: 除了文字提示，输入框边框是否应变为红色 (`Error` 色)？本方案已按此设计。
4.  **加载状态**: 注册按钮的加载指示器，是使用按钮内的 `ActivityIndicator` 还是全屏蒙层？本方案采用按钮内嵌式，体验更轻量。

**本设计方案已包含所有视觉与交互细节，可直接用于开发。**
