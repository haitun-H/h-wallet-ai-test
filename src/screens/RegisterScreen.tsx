import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';

const API_BASE_URL = 'http://your-backend-url'; // 替换为实际后端地址

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('错误', '请输入邮箱');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('成功', '验证码已发送到邮箱');
      } else {
        Alert.alert('错误', data.message || '发送失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndCreate = async () => {
    if (!email || !code) {
      Alert.alert('错误', '请输入邮箱和验证码');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/verify-and-create-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (data.success) {
        setWalletAddress(data.walletAddress);
        Alert.alert('成功', `钱包创建成功！地址：${data.walletAddress}`);
      } else {
        Alert.alert('错误', data.message || '创建失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>H Wallet 注册</Text>
      <TextInput
        style={styles.input}
        placeholder="输入邮箱"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title="发送验证码" onPress={handleSendCode} disabled={isLoading} />
      <TextInput
        style={styles.input}
        placeholder="输入验证码"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
      />
      <Button title="注册并创建钱包" onPress={handleVerifyAndCreate} disabled={isLoading} />
      {isLoading && <ActivityIndicator style={styles.loader} />}
      {walletAddress ? <Text style={styles.address}>钱包地址：{walletAddress}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 },
  loader: { marginTop: 20 },
  address: { marginTop: 20, fontSize: 12, color: '#666', textAlign: 'center' },
});