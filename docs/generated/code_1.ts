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