import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { TextInput, Button, Card, IconButton } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';

// API配置 - 实际部署时需要替换
const API_BASE_URL = 'http://your-backend-url'; // TODO: 替换为实际后端地址

export default function RegisterScreen() {
  // 表单状态
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  
  // 交互状态
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  
  // Refs
  const codeInputRef = useRef(null);
  const countdownRef = useRef(null);

  // 邮箱格式验证
  const validateEmail = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(text));
  };

  // 发送验证码
  const handleSendVerificationCode = async () => {
    if (!isEmailValid) {
      Toast.show({
        type: 'error',
        text1: '邮箱格式不正确',
        position: 'bottom',
      });
      return;
    }

    setIsSendingCode(true);
    try {
      const response = await fetch(`${API_BASE_URL}/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 开始倒计时
        setCountdown(59);
        Toast.show({
          type: 'success',
          text1: '验证码已发送',
          text2: '请查看您的邮箱',
          position: 'bottom',
        });
        
        // 自动聚焦到验证码输入框
        if (codeInputRef.current) {
          codeInputRef.current.focus();
        }
      } else {
        Toast.show({
          type: 'error',
          text1: '发送失败',
          text2: data.message || '请稍后重试',
          position: 'bottom',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '网络错误',
        text2: '请检查网络连接',
        position: 'bottom',
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  // 倒计时处理
  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    
    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [countdown]);

  // 注册并创建钱包
  const handleRegister = async () => {
    if (!isEmailValid) {
      Toast.show({
        type: 'error',
        text1: '请输入有效的邮箱地址',
        position: 'bottom',
      });
      return;
    }
    
    if (verificationCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: '验证码错误',
        text2: '请输入6位验证码',
        position: 'bottom',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/verify-and-create-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          code: verificationCode 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setWalletAddress(data.walletAddress);
        Toast.show({
          type: 'success',
          text1: '钱包创建成功！',
          position: 'bottom',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: '注册失败',
          text2: data.message || '请检查验证码',
          position: 'bottom',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '网络错误',
        text2: '请稍后重试',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 复制钱包地址
  const handleCopyAddress = async () => {
    if (walletAddress) {
      await Clipboard.setStringAsync(walletAddress);
      Toast.show({
        type: 'success',
        text1: '地址已复制',
        position: 'bottom',
      });
    }
  };

  // 重置流程
  const handleReset = () => {
    setEmail('');
    setVerificationCode('');
    setWalletAddress('');
    setIsAddressExpanded(false);
    setCountdown(0);
  };

  // 渲染成功状态
  const renderSuccessState = () => (
    <View style={styles.successContainer}>
      <IconButton
        icon="check-circle"
        iconColor="#00C853"
        size={80}
        style={styles.successIcon}
      />
      <Text style={styles.successTitle}>钱包创建成功！</Text>
      
      <Card style={styles.addressCard}>
        <Card.Content>
          <View style={styles.addressHeader}>
            <Text style={styles.addressLabel}>您的钱包地址</Text>
            <IconButton
              icon="content-copy"
              size={20}
              onPress={handleCopyAddress}
            />
          </View>
          <TouchableOpacity onPress={() => setIsAddressExpanded(!isAddressExpanded)}>
            <Text style={styles.addressText}>
              {isAddressExpanded || walletAddress.length <= 16 
                ? walletAddress 
                : `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 8)}`}
            </Text>
            <Text style={styles.expandHint}>
              {isAddressExpanded ? '点击收起' : '点击展开完整地址'}
            </Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
      
      <Button
        mode="contained"
        onPress={handleReset}
        style={styles.doneButton}
        labelStyle={styles.doneButtonLabel}
      >
        完成
      </Button>
    </View>
  );

  // 渲染表单状态
  const renderFormState = () => (
    <ScrollView contentContainerStyle={styles.formContainer}>
      {/* 品牌头区 */}
      <View style={styles.header}>
        <Text style={styles.appName}>H Wallet</Text>
        <Text style={styles.tagline}>轻松创建链上钱包</Text>
      </View>
      
      {/* 表单区 */}
      <View style={styles.form}>
        {/* 邮箱输入 */}
        <TextInput
          label="邮箱"
          value={email}
          onChangeText={validateEmail}
          mode="outlined"
          style={styles.input}
          placeholder="请输入邮箱"
          keyboardType="email-address"
          autoCapitalize="none"
          left={<TextInput.Icon icon="email" />}
          outlineColor={email && !isEmailValid ? '#FF5252' : '#DDD'}
          activeOutlineColor={email && !isEmailValid ? '#FF5252' : '#3D7FFF'}
        />
        
        {/* 验证码模块 */}
        <View style={styles.codeContainer}>
          <TextInput
            ref={codeInputRef}
            label="验证码"
            value={verificationCode}
            onChangeText={setVerificationCode}
            mode="outlined"
            style={styles.codeInput}
            placeholder="6位验证码"
            keyboardType="number-pad"
            maxLength={6}
            left={<TextInput.Icon icon="lock" />}
            outlineColor="#DDD"
            activeOutlineColor="#3D7FFF"
          />
          <Button
            mode="outlined"
            onPress={handleSendVerificationCode}
            disabled={!isEmailValid || countdown > 0 || isSendingCode}
            style={styles.sendButton}
            labelStyle={styles.sendButtonLabel}
          >
            {countdown > 0 ? `${countdown}s后重发` : '发送验证码'}
          </Button>
        </View>
        
        {/* 提交按钮 */}
        <Button
          mode="contained"
          onPress={handleRegister}
          disabled={!isEmailValid || verificationCode.length !== 6 || isLoading}
          style={styles.submitButton}
          labelStyle={styles.submitButtonLabel}
          loading={isLoading}
        >
          注册并创建钱包
        </Button>
      </View>
      
      {/* 安全提示 */}
      <View style={styles.footer}>
        <Text style={styles.securityText}>
          钱包由 OKX Agent Wallet 安全托管，无需管理私钥
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {walletAddress ? renderSuccessState() : renderFormState()}
        
        {/* 加载遮罩 */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3D7FFF" />
            <Text style={styles.loadingText}>正在创建钱包...</Text>
          </View>
        )}
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  // 表单状态样式
  formContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  codeInput: {
    flex: 1,
    marginRight: 12,
    backgroundColor: '#FFF',
  },
  sendButton: {
    height: 56,
    justifyContent: 'center',
  },
  sendButtonLabel: {
    fontSize: 14,
  },
  submitButton: {
    height: 56,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#3D7FFF',
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  securityText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  // 成功状态样式
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 32,
  },
  addressCard: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 32,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  addressText: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  expandHint: {
    fontSize: 12,
    color: '#3D7FFF',
    textAlign: 'center',
  },
  doneButton: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#3D7FFF',
  },
  doneButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  // 加载遮罩
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});