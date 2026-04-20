import React from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIconName?: keyof typeof Ionicons.glyphMap;
  rightIconName?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  leftIconName,
  rightIconName,
  onRightIconPress,
  style,
  ...textInputProps
}) => {
  const borderColor = error ? '#EF4444' : textInputProps.editable === false ? '#E5E7EB' : '#D1D5DB';
  const backgroundColor = textInputProps.editable === false ? '#F9FAFB' : '#FFFFFF';

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, { borderColor, backgroundColor }]}>
        {leftIconName && (
          <Ionicons name={leftIconName} size={20} color="#6B7280" style={styles.leftIcon} />
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#6B7280"
          {...textInputProps}
        />
        {rightIconName && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Ionicons name={rightIconName} size={20} color="#3B82F6" style={styles.rightIcon} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16, // 2 units
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8, // 1 unit
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16, // 2 units
    paddingHorizontal: 16, // 2 units
    height: 56,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});

export default InputField;