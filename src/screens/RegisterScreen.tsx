import React, { useState, useReducer, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../components/common/InputField';
import PrimaryButton from '../components/common/PrimaryButton';
import { authService, RegisterRequest } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 表单状态类型
interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
  verificationCode: string;
  isAgreed: boolean;
}

// 表单动作类型
type FormAction =
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_PASSWORD'; payload: string }
  | { type: 'SET_CONFIRM_PASSWORD'; payload: string }
  | { type: 'SET_VERIFICATION_CODE'; payload: string }
  | { type: 'TOGGLE_AGREEMENT' }
  | { type: 'RESET' };

// 表单Reducer
const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_EMAIL':
      return { ...state, email: action.payload };
    case 'SET_PASSWORD':
      return { ...state, password: action.payload };
    case 'SET_CONFIRM_PASSWORD':
      return { ...state, confirmPassword: action.payload };
    case 'SET_VERIFICATION_CODE':
      return { ...state, verificationCode: action.payload };
    case 'TOGGLE_AGREEMENT':
      return { ...state, isAgreed: !state.isAgreed };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const initialState: FormState = {
  email: '',
  password: '',
  confirmPassword: '',
  verificationCode: '',
  isAgreed: false,
};

// 验证函数
const validateEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return '邮箱不能为空';
  if (!emailRegex.test(email)) return '邮箱格式不正确';
  return '';
};

const validatePassword = (password: string): string => {
  if (!password) return '密码不能为空';
  if (password.length < 8) return '密码至少8位';
  if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
    return '密码需包含字母和数字';
  }
  return '';
};

const validateConfirmPassword = (password: string, confirmPassword: string): string => {
  if (!confirmPassword) return '请确认密码';
  if (password !== confirmPassword) return '两次输入的密码不一致';
  return '';
};

const validateVerificationCode = (code: string): string => {
  if (!code) return '验证码不能为空';
  if (!/^\d{6}$/.test(code)) return '验证码为6位数字';
  return '';
};

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const [formState, dispatch] = useReducer(formReducer, initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sid, setSid] = useState<string>('');

  // 验证码倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 实时验证邮箱和密码
  useEffect(() => {
    const emailError = validateEmail(formState.email);
    const passwordError = validatePassword(formState.password);
    const confirmError = validateConfirmPassword(formState.password, formState.confirmPassword);
    setErrors((prev) => ({
      ...prev,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmError,
    }));
  }, [formState.email, formState.password, formState.confirmPassword]);

  // 处理获取验证码
  const handleSendCode = async () => {
    const emailError = validateEmail(formState.email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    setIsSendingCode(true);
    try {
      const response = await authService.sendVerificationCode(formState.email);
      setSid(response.data.sid);
      setCountdown(60); // 开始60秒倒计时
      Alert.alert('成功', '验证码已发送到您的邮箱，请查收。');
    } catch (error: any) {
      Alert.alert('发送失败', error.message || '请稍后重试');
    } finally {
      setIsSendingCode(false);
    }
  };

  // 处理注册提交
  const handleRegister = async () => {
    // 客户端验证
    const emailError = validateEmail(formState.email);
    const passwordError = validatePassword(formState.password);
    const confirmError = validateConfirmPassword(formState.password, formState.confirmPassword);
    const codeError = validateVerificationCode(formState.verificationCode);

    const newErrors = {
      email: emailError,
      password: passwordError,
      confirmPassword: confirmError,
      verificationCode: codeError,
    };
    setErrors(newErrors);

    // 检查是否有错误或未同意协议
    const hasError = Object.values(newErrors).some((error) => error !== '');
    if (hasError) {
      Alert.alert('提示', '请检查表单中的错误信息。');
      return;
    }
    if (!formState.isAgreed) {
      Alert.alert('提示', '请阅读并同意服务协议。');
      return;
    }
    if (!sid) {
      Alert.alert('提示', '请先获取验证码。');
      return;
    }

    setIsLoading(true);
    try {
      const registerData: RegisterRequest = {
        email: formState.email,
        password: formState.password, // 重要：实际项目中这里必须进行哈希处理！
        verificationCode: formState.verificationCode,
        sid,
      };

      const response = await authService.register(registerData);

      // 保存token和用户信息
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userInfo', JSON.stringify({
        userId: response.data.userId,
        email: formState.email,
        nickname: response.data.nickname,
        walletAddress: response.data.walletAddress,
      }));

      Alert.alert('注册成功', `您的钱包地址：${response.data.walletAddress}`, [
        {
          text: '进入钱包',
          onPress: () => {
            // 跳转到欢迎页或主页
            router.replace('/welcome');
          },
        },
      ]);
      dispatch({ type: 'RESET' });
    } catch (error: any) {
      Alert.alert('注册失败', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 计算注册按钮是否禁用
  const isRegisterDisabled =
    !formState.email ||
    !formState.password ||
    !formState.confirmPassword ||
    !formState.verificationCode ||
    !formState.isAgreed ||
    Object.values(errors).some((error) => error !== '') ||
    isLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo与标题区域 */}
          <View style={styles.header}>
            <Ionicons name="wallet" size={64} color="#3B82F6" />
            <Text style={styles.title}>创建 H Wallet 账户</Text>
            <Text style={styles.subtitle}>开启您的数字资产管理之旅</Text>
          </View>

          {/* 表单区域 */}
          <View style={styles.form}>
            <InputField
              label="邮箱"
              placeholder="请输入您的邮箱"
              value={formState.email}
              onChangeText={(text) => dispatch({ type: 'SET_EMAIL', payload: text })}
              error={errors.email}
              leftIconName="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            <InputField
              label="密码"
              placeholder="至少8位，包含字母和数字"
              value={formState.password}
              onChangeText={(text) => dispatch({ type: 'SET_PASSWORD', payload: text })}
              error={errors.password}
              leftIconName="lock-closed-outline"
              secureTextEntry
              editable={!isLoading}
            />

            <InputField
              label="确认密码"
              placeholder="请再次输入密码"
              value={formState.confirmPassword}
              onChangeText={(text) => dispatch({ type: 'SET_CONFIRM_PASSWORD', payload: text })}
              error={errors.confirmPassword}
              leftIconName="lock-closed-outline"
              secureTextEntry
              editable={!isLoading}
            />

            <View style={styles.codeRow}>
              <View style={styles.codeInput}>
                <InputField
                  label="验证码"
                  placeholder="6位数字验证码"
                  value={formState.verificationCode}
                  onChangeText={(text) => dispatch({ type: 'SET_VERIFICATION_CODE', payload: text })}
                  error={errors.verificationCode}
                  leftIconName="key-outline"
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isLoading}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.codeButton,
                  (countdown > 0 || isSendingCode || !formState.email || errors.email) &&
                    styles.codeButtonDisabled,
                ]}
                onPress={handleSendCode}
                disabled={countdown > 0 || isSendingCode || !formState.email || !!errors.email}
              >
                {isSendingCode ? (
                  <Text style={styles.codeButtonText}>发送中...</Text>
                ) : countdown > 0 ? (
                  <Text style={styles.codeButtonText}>{countdown}秒后重试</Text>
                ) : (
                  <Text style={styles.codeButtonText}>获取验证码</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* 协议勾选 */}
            <TouchableOpacity
              style={styles.agreementRow}
              onPress={() => dispatch({ type: 'TOGGLE_AGREEMENT' })}
              disabled={isLoading}
            >
              <Ionicons
                name={formState.isAgreed ? 'checkbox' : 'square-outline'}
                size={24}
                color={formState.isAgreed ? '#3B82F6' : '#6B7280'}
              />
              <Text style={styles.agreementText}>
                我已阅读并同意
                <Text style={styles.linkText} onPress={() => Alert.alert('协议', '协议详情页待实现')}>
                  《H Wallet服务协议》
                </Text>
              </Text>
            </TouchableOpacity>

            {/* 注册按钮 */}
            <PrimaryButton
              title="注册"
              onPress={handleRegister}
              disabled={isRegisterDisabled}
              loading={isLoading}
              style={styles.registerButton}
            />
          </View>

          {/* 登录提示 */}
          <View style={styles.loginPrompt}>
            <Text style={styles.promptText}>已有账户？</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>立即登录</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32, // 4 units
    paddingVertical: 24, // 3 units
  },
  header: {
    alignItems: 'center',
    marginBottom: 48, // 6 units
  },
  title: {
    fontSize: 32, // H1
    fontWeight: '700',
    color: '#111827',
    marginTop: 16, // 2 units
  },
  subtitle: {
    fontSize: 16, // Body
    color: '#6B7280',
    marginTop: 8, // 1 unit
  },
  form: {
    marginBottom: 32, // 4 units
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 24, // 3 units
  },
  codeInput: {
    flex: 1,
    marginRight: 12,
  },
  codeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  codeButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  codeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32, // 4 units
  },
  agreementText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
    flex: 1,
  },
  linkText: {
    color: '#3B82F6',
  },
  registerButton: {
    width: '100%',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24, // 3 units
  },
  promptText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default RegisterScreen;