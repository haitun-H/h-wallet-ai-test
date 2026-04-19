import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface CountdownButtonProps {
  onPress: () => void;
  disabled: boolean;
  countdown: number;
  style?: ViewStyle;
}

const CountdownButton: React.FC<CountdownButtonProps> = ({ onPress, disabled, countdown, style }) => {
  const buttonText = countdown > 0 ? `重新发送(${countdown}s)` : '发送验证码';
  const backgroundColor = disabled ? colors.border : colors.primary;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{buttonText}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  text: {
    ...typography.label,
    color: colors.background,
  },
});

export default CountdownButton;