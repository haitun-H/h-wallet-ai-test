/**
 * 输入框组件
 * 用于邮箱、密码、验证码等输入
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

// 输入框类型
type InputType = 'text' | 'email' | 'password' | 'number';

// 输入框属性接口
interface InputFieldProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  type?: InputType;
  error?: string;
  success?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  showPasswordToggle?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * 输入框组件
 */
const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  type = 'text',
  error,
  success = false,
  disabled = false,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  showPasswordToggle = type === 'password',
  leftIcon,
  rightIcon,
  value,
  onChangeText,
  onBlur,
  onFocus,
  ...restProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // 处理焦点状态
  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  // 切换密码可见性
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // 获取输入框类型
  const getInputType = () => {
    if (type === 'password') {
      return isPasswordVisible ? 'text' : 'password';
    }
    return type;
  };

  // 获取键盘类型
  const getKeyboardType = () => {
    if (type === 'email') return 'email-address';
    if (type === 'number') return 'numeric';
    return 'default';
  };

  // 获取自动完成类型
  const getAutoCompleteType = () => {
    if (type === 'email') return 'email';
    if (type === 'password') return 'password';
    return 'off';
  };

  // 获取边框颜色
  const getBorderColor = () => {
    if (error) return '#EF4444'; // 错误色 - 红色
    if (success) return '#10B981'; // 成功色 - 绿色
    if (isFocused) return '#3B82F6'; // 主色 - 蓝色
    if (disabled) return '#D1D5DB'; // 边框色 - 浅灰色
    return '#D1D5DB'; // 默认边框色
  };

  // 获取背景颜色
  const getBackgroundColor = () => {
    if (disabled) return '#F9FAFB'; // 卡片背景色 - 极浅灰
    return '#FFFFFF'; // 背景色 - 白色
  };

  // 获取文本颜色
  const getTextColor = () => {
    if (disabled) return '#9CA3AF'; // 禁用文本色
    return '#111827'; // 文本主色 - 灰黑色
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, labelStyle, disabled && styles.disabledLabel]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          },
        ]}
      >
        {leftIcon ? (
          <View style={styles.leftIconContainer}>{leftIcon}</View>
        ) : null}

        <TextInput
          style={[
            styles.input,
            {
              color: getTextColor(),
              paddingLeft: leftIcon ? 40 : 16,
              paddingRight: showPasswordToggle || rightIcon ? 40 : 16,
            },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          secureTextEntry={type === 'password' && !isPasswordVisible}
          keyboardType={getKeyboardType()}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={getAutoCompleteType() as any}
          textContentType={type === 'password' ? 'password' : 'none'}
          {...restProps}
        />

        {showPasswordToggle ? (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={togglePasswordVisibility}
            disabled={disabled}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <Text style={[styles.errorText, errorStyle]}>{error}</Text>
      ) : null}

      {type === 'password' && !error ? (
        <Text style={styles.hintText}>至少8位，包含字母和数字</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  disabledLabel: {
    color: '#9CA3AF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    position: 'relative',
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  leftIconContainer: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  rightIconContainer: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default InputField;
