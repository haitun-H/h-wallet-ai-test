/**
 * 输入框组件
 * 支持文本、邮箱、密码等多种输入类型，包含标签、验证错误显示
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';

// 输入框类型
type InputType = 'text' | 'email' | 'password' | 'numeric';

interface InputFieldProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label: string;
  type?: InputType;
  error?: string;
  showPasswordToggle?: boolean;
  onTogglePasswordVisibility?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  error,
  showPasswordToggle = false,
  onTogglePasswordVisibility,
  value,
  onChangeText,
  placeholder,
  editable = true,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // 根据输入类型确定键盘类型和是否安全输入
  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'numeric':
        return 'numeric';
      default:
        return 'default';
    }
  };
  
  const isSecureTextEntry = type === 'password' && !isPasswordVisible;
  
  // 处理密码可见性切换
  const handleTogglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
    if (onTogglePasswordVisibility) {
      onTogglePasswordVisibility();
    }
  };
  
  return (
    <View style={styles.container}>
      {/* 标签 */}
      <Text style={styles.label}>{label}</Text>
      
      {/* 输入框容器 */}
      <View style={[
        styles.inputContainer,
        error ? styles.inputContainerError : null,
        !editable ? styles.inputContainerDisabled : null,
      ]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={getKeyboardType()}
          secureTextEntry={isSecureTextEntry}
          editable={editable}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />
        
        {/* 密码可见性切换按钮 */}
        {showPasswordToggle && type === 'password' && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={handleTogglePasswordVisibility}
            disabled={!editable}
          >
            <Text style={styles.toggleButtonText}>
              {isPasswordVisible ? '隐藏' : '显示'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* 错误提示 */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {/* 密码复杂度提示（仅对密码输入框） */}
      {type === 'password' && !error && (
        <Text style={styles.hintText}>
          至少8位，包含字母和数字
        </Text>
      )}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    height: 48,
    paddingHorizontal: 12,
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  inputContainerDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    height: '100%',
  },
  toggleButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
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
