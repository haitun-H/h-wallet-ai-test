import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../theme';
import FormInput from '../components/FormInput';
import CountdownButton from '../components/CountdownButton';
import PrimaryButton from '../components/PrimaryButton';
import { authService } from '../services/authService';
import { RootStackParamList } from '../navigation/AppNavigator';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isLoadingSend, setIsLoadingSend] = useState(false);
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateEmail = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('请输入邮箱地址');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('邮箱格式不正确');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSendCode = async () => {
    if (!validateEmail()) return;

    setIsLoadingSend(true);
    try {
      const response = await authService.sendVerificationCode(email);
      if (response.success) {
        Alert.alert('成功', '验证码已发送至您的邮箱，请查收。');
        setCountdown(60); // 开始60秒倒计时
      } else {
        Alert.alert('发送失败', response.message || '请稍后重试');
      }
    } catch (error: any) {
      console.error('Send code error:', error);
      Alert.alert('错误', error.message || '网络请求失败，请检查网络连接');
    } finally {
      setIsLoadingSend(false);
    }
  };

  const handleRegister = async () => {
    // 前端基础验证
    if (!validateEmail()) return;
    if (!code) {
      setCodeError('请输入验证码');
      return;
    }
    if (code.length !== 6) {
      setCodeError('验证码为6位数字');
      return;
    }
    setCodeError('');

    setIsLoadingRegister(true);
    try {
      const response = await authService.register(email, code);
      if (response.success) {
        // 注册成功，跳转到成功页面并传递钱包地址
        navigation.replace('RegisterSuccess', {
          walletAddress: response.data.walletAddress,
        });
      } else {
        Alert.alert('注册失败', response.message || '验证码错误或已过期');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      Alert.alert('错误', error.message || '注册失败，请稍后重试');
    } finally {
      setIsLoadingRegister(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Logo/AppName 占位 */}
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>H Wallet</Text>
            </View>

            <Text style={styles.title}>创建您的钱包</Text>

            <FormInput
              label="邮箱地址"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              placeholder="请输入您的邮箱"
              error={emailError}
              keyboardType="email-address"
              editable={!isLoadingRegister}
            />

            <View style={styles.codeRow}>
              <View style={styles.codeInputContainer}>
                <FormInput
                  label="验证码"
                  value={code}
                  onChangeText={(text) => {
                    setCode(text);
                    if (codeError) setCodeError('');
                  }}
                  placeholder="6位数字"
                  error={codeError}
                  keyboardType="numeric"
                  editable={!isLoadingRegister}
                />
              </View>
              <CountdownButton
                onPress={handleSendCode}
                disabled={countdown > 0 || isLoadingSend || isLoadingRegister}
                countdown={countdown}
                style={styles.countdownButton}
              />
            </View>

            <PrimaryButton
              title="注册"
              onPress={handleRegister}
              disabled={isLoadingRegister || !email || !code}
              loading={isLoadingRegister}
              style={styles.registerButton}
            />
          </View>
          {/* 底部填充，用于键盘弹起时 */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xxl,
  },
  logoPlaceholder: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    ...typography.h1,
    color: colors.primary,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  codeInputContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  countdownButton: {
    marginTop: spacing.md + spacing.sm, // 对齐输入框标签高度
  },
  registerButton: {
    marginTop: spacing.lg,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default RegisterScreen;