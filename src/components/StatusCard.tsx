/**
 * 状态卡片组件
 * 用于显示钱包状态、用户信息等
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

// 状态类型
export type StatusType = 'pending' | 'active' | 'failed' | 'info';

interface StatusCardProps {
  title: string;
  status: StatusType;
  message: string;
  details?: string;
  walletAddress?: string | null;
  onCopyAddress?: () => void;
  onRetry?: () => void;
  onRefresh?: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  status,
  message,
  details,
  walletAddress,
  onCopyAddress,
  onRetry,
  onRefresh,
}) => {
  // 获取状态颜色
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return '#10B981'; // 绿色
      case 'failed':
        return '#EF4444'; // 红色
      case 'pending':
        return '#F59E0B'; // 琥珀色
      case 'info':
      default:
        return '#3B82F6'; // 蓝色
    }
  };
  
  // 获取状态图标
  const renderStatusIcon = () => {
    switch (status) {
      case 'active':
        return (
          <View style={[styles.statusIcon, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusIconText}>✓</Text>
          </View>
        );
      case 'failed':
        return (
          <View style={[styles.statusIcon, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusIconText}>✗</Text>
          </View>
        );
      case 'pending':
        return <ActivityIndicator size="small" color={getStatusColor()} />;
      case 'info':
      default:
        return (
          <View style={[styles.statusIcon, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusIconText}>i</Text>
          </View>
        );
    }
  };
  
  // 渲染操作按钮
  const renderActionButton = () => {
    switch (status) {
      case 'pending':
        return (
          <TouchableOpacity style={styles.actionButton} onPress={onRefresh}>
            <Text style={styles.actionButtonText}>刷新状态</Text>
          </TouchableOpacity>
        );
      case 'failed':
        return (
          <TouchableOpacity style={styles.actionButton} onPress={onRetry}>
            <Text style={styles.actionButtonText}>重试创建</Text>
          </TouchableOpacity>
        );
      case 'active':
        return (
          <TouchableOpacity style={styles.actionButton} onPress={() => {}} disabled>
            <Text style={styles.actionButtonText}>查看资产</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.card}>
      {/* 卡片标题 */}
      <Text style={styles.cardTitle}>{title}</Text>
      
      {/* 状态区域 */}
      <View style={styles.statusContainer}>
        {renderStatusIcon()}
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {message}
        </Text>
      </View>
      
      {/* 钱包地址区域 */}
      {walletAddress !== undefined && (
        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>钱包地址</Text>
          <View style={styles.addressValueContainer}>
            <Text style={styles.addressValue} numberOfLines={1} ellipsizeMode="middle">
              {walletAddress || '-'}
            </Text>
            {walletAddress && status === 'active' && onCopyAddress && (
              <TouchableOpacity style={styles.copyButton} onPress={onCopyAddress}>
                <Text style={styles.copyButtonText}>复制</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      
      {/* 详细信息 */}
      {details && (
        <Text style={styles.detailsText}>{details}</Text>
      )}
      
      {/* 提示信息 */}
      {status === 'pending' && (
        <Text style={styles.hintText}>
          通常需要几秒钟，请稍候...
        </Text>
      )}
      
      {status === 'failed' && (
        <Text style={styles.hintText}>
          请稍后重试或联系客服
        </Text>
      )}
      
      {/* 操作按钮 */}
      {renderActionButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statusIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  addressContainer: {
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  addressValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressValue: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
    fontFamily: 'monospace',
  },
  copyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    marginLeft: 8,
  },
  copyButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  detailsText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  hintText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default StatusCard;
