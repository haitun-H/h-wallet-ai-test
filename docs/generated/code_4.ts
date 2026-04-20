interface RegisterButtonProps {
      onPress: () => void;
      disabled: boolean; // 根据表单验证状态禁用
      isLoading: boolean; // 注册请求中的加载状态
    }