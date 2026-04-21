/**
 * 主要按钮组件
 * 用于注册、登录等主要操作
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';

// 按钮类型
type ButtonVariant = 'primary' | 'success' | 'warning' | 'error';

// 按钮大小
type ButtonSize = 'small' | 'medium' | 'large';

// 按钮属性接口
interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * 主要按钮组件
 */
const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  ...restProps
}) => {
  // 处理按钮点击
  const handlePress = () => {
    if (!loading && !disabled) {
      onPress();
    }
  };

  // 获取按钮样式
  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    };

    // 根据变体设置背景色
    let backgroundColor = '#3B82F6'; // 主色 - 蓝色
    if (variant === 'success') backgroundColor = '#10B981'; // 成功色 - 绿色
    if (variant === 'warning') backgroundColor = '#F59E0B'; // 警告色 - 琥珀色
    if (variant === 'error') backgroundColor = '#EF4444'; // 错误色 - 红色

    // 根据大小设置内边距和高度
    let paddingHorizontal = 24;
    let paddingVertical = 12;
    let height = 48;
    
    if (size === 'small') {
      paddingHorizontal = 16;
      paddingVertical = 8;
      height = 36;
    } else if (size === 'large') {
      paddingHorizontal = 32;
      paddingVertical = 16;
      height = 56;
    }

    // 禁用状态
    if (disabled || loading) {
      backgroundColor = '#D1D5DB'; // 灰色
    }

    // 宽度设置
    const widthStyle = fullWidth ? { width: '100%' } : {};

    return {
      ...baseStyle,
      backgroundColor,
      paddingHorizontal,
      paddingVertical,
      height,
      ...widthStyle,
      ...style,
    };
  };

  // 获取文本样式
  const getTextStyle = () => {
    const baseStyle: TextStyle = {
      fontSize: 16,
      fontWeight: '500',
      color: '#FFFFFF',
    };

    // 根据大小调整字体大小
    if (size === 'small') {
      baseStyle.fontSize = 14;
    } else if (size === 'large') {
      baseStyle.fontSize = 18;
    }

    // 禁用状态
    if (disabled || loading) {
      baseStyle.color = '#9CA3AF'; // 浅灰色
    }

    return {
      ...baseStyle,
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...restProps}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" style={styles.loader} />
      ) : null}
      <Text style={getTextStyle()}>
        {loading ? '处理中...' : title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loader: {
    marginRight: 8,
  },
});

export default PrimaryButton;
