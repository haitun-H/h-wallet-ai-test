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