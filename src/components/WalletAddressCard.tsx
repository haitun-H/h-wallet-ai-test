import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Copy } from 'lucide-react-native';

interface WalletAddressCardProps {
  address: string;
  onCopyPress: () => void;
}

const WalletAddressCard: React.FC<WalletAddressCardProps> = ({ address, onCopyPress }) => {
  // 格式化地址显示：前6位...后4位
  const formattedAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>您的钱包地址</Text>
      <View style={styles.addressRow}>
        <Text style={styles.addressText}>{formattedAddress}</Text>
        <TouchableOpacity onPress={onCopyPress} style={styles.copyButton} activeOpacity={0.7}>
          <Copy size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.hintText}>点击复制完整地址</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addressText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
  },
  copyButton: {
    padding: spacing.xs,
  },
  hintText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default WalletAddressCard;