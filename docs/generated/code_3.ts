interface PrimaryButtonProps {
  title: string; // 按钮文字
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean; // 注册请求时的加载状态
}