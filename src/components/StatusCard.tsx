import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatusCardProps {
  type: 'loading' | 'success' | 'error';
  message?: string;
  detail?: string;
  onCopyPress?: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({
  type,
  message,
  detail,
  onCopyPress,
}) => {
  const getConfig = () => {
    switch (type) {
      case 'loading':
        return {
          bgColor: '#F3F4F6',
          icon: <ActivityIndicator size="large" color="#3B82F6" />,
          title: '正在创建钱包...',
          titleColor: '#111827',
        };
      case 'success':
        return {
          bgColor: '#ECFDF5',
          icon: (
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
          ),
          title: message || '注册成功！',
          titleColor: '#10B981',
        };
      case 'error':
        return {
          bgColor: '#FEF2F2',
          icon: <Ionicons name="close-circle" size={48} color="#EF4444" />,
          title: message || '出错了',
          titleColor: '#EF4444',
        };
    }
  };

  const config = getConfig();

  return (
    <View style={[styles.card, { backgroundColor: config.bgColor }]}>
      {config.icon}
      <Text style={[styles.title, { color: config.titleColor }]}>
        {config.title}
      </Text>
      {detail ? (
        <View style={styles.detailContainer}>
          <Text style={styles.detailText}>{detail}</Text>
          {type === 'success' && onCopyPress && (
            <TouchableOpacity onPress={onCopyPress} style={styles.copyButton}>
              <Ionicons name="copy-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      ) : null}
      {type === 'error' && detail ? (
        <Text style={styles.errorDetail}>{detail}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    width: '100%',
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#10B981',
    flex: 1,
  },
  copyButton: {
    padding: 4,
  },
  errorDetail: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default StatusCard;