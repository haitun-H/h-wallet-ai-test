interface CountdownButtonProps {
      onPress: () => void;
      disabled: boolean; // 根据倒计时或加载状态禁用
      countdown: number; // 当前倒计时秒数，0表示可点击
    }