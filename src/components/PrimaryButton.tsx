/**
 * 主要按钮组件
 * 支持默认、加载、禁用状态，包含防重复点击处理
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  loading = false,
  disabled = false,
  variant = 'primary',
  fullWidth = false,
  style,
  textStyle,
  onPress,
  ...props
}) => {
  // 防重复点击处理
  const handlePress = (event: any) => {
    if (loading || disabled) {
      return;
    }
    
    if (onPress) {
      onPress(event);
    }
  };
  
  // 根据变体获取颜色
  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      case 'primary':
      default:
        return '#3B82F6';
    }
  };
  
  const backgroundColor = getVariantColor();
  const isDisabled = loading || disabled;
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor },
        fullWidth && styles.fullWidth,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PrimaryButton;
