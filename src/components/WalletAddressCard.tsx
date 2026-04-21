/**
 * 钱包地址卡片组件
 * 专门用于显示钱包地址和复制功能
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Clipboard,
  Alert,
} from 'react-native';

interface WalletAddressCardProps {
  walletAddress: string | null;
  title?: string;
  showCopyButton?: boolean;
  onCopySuccess?: () => void;
}

const WalletAddressCard: React.FC<WalletAddressCardProps> = ({
  walletAddress,
  title = '钱包地址',
  showCopyButton = true,
  onCopySuccess,
}) => {
  // 复制地址到剪贴板
  const handleCopyAddress = async () => {
    if (!walletAddress) {
      Alert.alert('提示', '钱包地址为空');
      return;
    }
    
    try {
      await Clipboard.setString(walletAddress);
      
      if (onCopySuccess) {
        onCopySuccess();
      } else {
        Alert.alert('成功', '钱包地址已复制到剪贴板');
      }
    } catch (error) {
      console.error('复制失败:', error);
      Alert.alert('错误', '复制失败，请重试');
    }
  };
  
  // 格式化地址显示（中间用...省略）
  const formatAddress = (address: string) => {
    if (address.length <= 16) {
      return address;
    }
    
    const start = address.substring(0, 8);
    const end = address.substring(address.length - 8);
    return `${start}...${end}`;
  };
  
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.addressContainer}>
        <View style={styles.addressTextContainer}>
          <Text style={styles.addressLabel}>地址:</Text>
          <Text style={styles.addressValue} numberOfLines={1}>
            {walletAddress ? formatAddress(walletAddress) : '-'}
          </Text>
        </View>
        
        {showCopyButton && walletAddress && (
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyAddress}>
            <Text style={styles.copyButtonText}>复制</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* 完整地址（小字显示） */}
      {walletAddress && (
        <Text style={styles.fullAddress} numberOfLines={1}>
          {walletAddress}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addressTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  addressValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    fontFamily: 'monospace',
  },
  copyButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  copyButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  fullAddress: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
});

export default WalletAddressCard;
