import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, typography } from '../theme';
import { CheckCircle } from 'lucide-react-native';
import WalletAddressCard from '../components/WalletAddressCard';
import PrimaryButton from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/AppNavigator';

type RegisterSuccessScreenRouteProp = RouteProp<RootStackParamList, 'RegisterSuccess'>;
type RegisterSuccessScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegisterSuccess'>;

const RegisterSuccessScreen: React.FC = () => {
  const route = useRoute<RegisterSuccessScreenRouteProp>();
  const navigation = useNavigation<RegisterSuccessScreenNavigationProp>();
  const { walletAddress } = route.params;

  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(walletAddress);
    Alert.alert('已复制', '钱包地址已复制到剪贴板');
  };

  const handleFinish = () => {
    // 这里可以导航到首页或其他页面
    Alert.alert('提示', '注册流程完成！');
    // navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <CheckCircle size={80} color={colors.success} style={styles.successIcon} />
        <Text style={styles.title}>注册成功！</Text>
        <Text style={styles.description}>
          您的链上钱包已创建完成。请妥善保管以下地址，它将用于接收资产。
        </Text>

        <WalletAddressCard address={walletAddress} onCopyPress={handleCopyAddress} />

        <PrimaryButton
          title="完成"
          onPress={handleFinish}
          style={styles.finishButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    lineHeight: 24,
  },
  finishButton: {
    marginTop: spacing.xl,
    width: '100%',
  },
});

export default RegisterSuccessScreen;