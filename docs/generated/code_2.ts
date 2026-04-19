interface InputFieldWithButtonProps extends Omit<InputFieldProps, ‘label’> {
  onButtonPress: () => void; // 发送验证码按钮点击事件
  buttonTitle: string; // 按钮文字，如“发送”或“60s”
  buttonDisabled: boolean; // 按钮是否禁用（用于倒计时）
  loading?: boolean; // 发送请求时的加载状态
}