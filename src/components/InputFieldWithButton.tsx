import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import InputField, { InputFieldProps } from './InputField';

interface InputFieldWithButtonProps extends Omit<InputFieldProps, 'label'> {
  onButtonPress: () => void;
  buttonTitle: string;
  buttonDisabled: boolean;
  buttonLoading?: boolean;
}

const InputFieldWithButton: React.FC<InputFieldWithButtonProps> = ({
  onButtonPress,
  buttonTitle,
  buttonDisabled,
  buttonLoading = false,
  ...inputFieldProps
}) => {
  return (
    <View>
      <InputField
        label="验证码"
        {...inputFieldProps}
        style={styles.inputWithButton}
      />
      <TouchableOpacity
        style={[
          styles.button,
          (buttonDisabled || buttonLoading) && styles.buttonDisabled,
        ]}
        onPress={onButtonPress}
        disabled={buttonDisabled || buttonLoading}
      >
        {buttonLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>{buttonTitle}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWithButton: {
    paddingRight: 100, // 为按钮留出空间
  },
  button: {
    position: 'absolute',
    right: 12,
    top: 40, // 对齐输入框内部
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default InputFieldWithButton;