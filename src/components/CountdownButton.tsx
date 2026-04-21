/**
 * 倒计时按钮组件
 * 用于发送验证码等需要冷却时间的场景
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
} from 'react-native';

interface CountdownButtonProps extends TouchableOpacityProps {
  initialText: string;
  countdownText: string;
  countdownSeconds: number;
  onPress: () => Promise<void> | void;
  loading?: boolean;
  disabled?: boolean;
}

const CountdownButton: React.FC<CountdownButtonProps> = ({
  initialText,
  countdownText,
  countdownSeconds = 60,
  onPress,
  loading = false,
  disabled = false,
  style,
  ...props
}) => {
  const [countdown, setCountdown] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  
  // 清理定时器
  const clearCountdownTimer = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };
  
  // 开始倒计时
  const startCountdown = () => {
    if (isCounting) return;
    
    setIsCounting(true);
    setCountdown(countdownSeconds);
    
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearCountdownTimer();
          setIsCounting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // 处理按钮点击
  const handlePress = async () => {
    if (isCounting || loading || disabled) {
      return;
    }
    
    try {
      await onPress();
      startCountdown();
    } catch (error) {
      console.error('按钮操作失败:', error);
      // 操作失败时不开始倒计时
    }
  };
  
  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      clearCountdownTimer();
    };
  }, []);
  
  // 按钮文本
  const getButtonText = () => {
    if (loading) {
      return '发送中...';
    }
    
    if (isCounting) {
      return `${countdownText}(${countdown}s)`;
    }
    
    return initialText;
  };
  
  const isButtonDisabled = isCounting || loading || disabled;
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isButtonDisabled && styles.buttonDisabled,
        style,
      ]}
      onPress={handlePress}
      disabled={isButtonDisabled}
      activeOpacity={0.8}
      {...props}
    >
      <Text style={[
        styles.buttonText,
        isButtonDisabled && styles.buttonTextDisabled,
      ]}>
        {getButtonText()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#3B82F6',
    minWidth: 120,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: '#E5E7EB',
  },
});

export default CountdownButton;
