/**
 * 倒计时按钮组件
 * 用于验证码发送按钮，发送后显示倒计时
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';

// 倒计时按钮属性接口
interface CountdownButtonProps extends TouchableOpacityProps {
  initialText?: string;
  countdownText?: string;
  countdownSeconds?: number;
  onPress: () => Promise<boolean> | boolean | void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  activeStyle?: ViewStyle;
  activeTextStyle?: TextStyle;
  disabledStyle?: ViewStyle;
  disabledTextStyle?: TextStyle;
}

/**
 * 倒计时按钮组件
 */
const CountdownButton: React.FC<CountdownButtonProps> = ({
  initialText = '发送验证码',
  countdownText = '重新发送({s})',
  countdownSeconds = 60,
  onPress,
  disabled = false,
  style,
  textStyle,
  activeStyle,
  activeTextStyle,
  disabledStyle,
  disabledTextStyle,
  ...restProps
}) => {
  const [isCounting, setIsCounting] = useState(false);
  const [countdown, setCountdown] = useState(countdownSeconds);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // 清理倒计时
  const clearCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  // 开始倒计时
  const startCountdown = () => {
    setIsCounting(true);
    setCountdown(countdownSeconds);
    
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearCountdown();
          setIsCounting(false);
          return countdownSeconds;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 处理按钮点击
  const handlePress = async () => {
    if (isCounting || disabled) {
      return;
    }

    try {
      const result = await onPress();
      
      // 如果 onPress 返回 true 或没有返回 false，则开始倒计时
      if (result !== false) {
        startCountdown();
      }
    } catch (error) {
      console.error('按钮点击处理失败:', error);
      // 发生错误时不开始倒计时
    }
  };

  // 组件卸载时清理倒计时
  useEffect(() => {
    return () => {
      clearCountdown();
    };
  }, []);

  // 获取按钮文本
  const getButtonText = () => {
    if (isCounting) {
      return countdownText.replace('{s}', countdown.toString());
    }
    return initialText;
  };

  // 获取按钮样式
  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 100,
    };

    if (disabled) {
      return {
        ...baseStyle,
        backgroundColor: '#F3F4F6',
        ...disabledStyle,
        ...style,
      };
    }

    if (isCounting) {
      return {
        ...baseStyle,
        backgroundColor: '#F3F4F6',
        ...activeStyle,
        ...style,
      };
    }

    return {
      ...baseStyle,
      backgroundColor: '#3B82F6',
      ...style,
    };
  };

  // 获取文本样式
  const getTextStyle = () => {
    const baseStyle: TextStyle = {
      fontSize: 14,
      fontWeight: '500',
    };

    if (disabled) {
      return {
        ...baseStyle,
        color: '#9CA3AF',
        ...disabledTextStyle,
        ...textStyle,
      };
    }

    if (isCounting) {
      return {
        ...baseStyle,
        color: '#6B7280',
        ...activeTextStyle,
        ...textStyle,
      };
    }

    return {
      ...baseStyle,
      color: '#FFFFFF',
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={disabled || isCounting}
      activeOpacity={0.8}
      {...restProps}
    >
      <Text style={getTextStyle()}>{getButtonText()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  buttonActive: {
    backgroundColor: '#3B82F6',
  },
  buttonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  buttonCounting: {
    backgroundColor: '#F3F4F6',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  textActive: {
    color: '#FFFFFF',
  },
  textDisabled: {
    color: '#9CA3AF',
  },
  textCounting: {
    color: '#6B7280',
  },
});

export default CountdownButton;
