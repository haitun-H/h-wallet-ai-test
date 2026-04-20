interface InputFieldProps {
      value: string;
      onChangeText: (text: string) => void;
      placeholder: string;
      error?: string; // 错误提示信息，为空则不显示
      secureTextEntry?: boolean; // 是否隐藏输入（用于密码）
      editable?: boolean; // 是否可编辑
      leftIcon?: React.ReactNode; // 左侧图标（可选）
    }