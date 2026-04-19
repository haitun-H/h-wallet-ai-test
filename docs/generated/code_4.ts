interface StatusCardProps {
  type: ‘loading’ | ‘success’ | ‘error’; // 卡片类型
  message?: string; // 主要信息，如“注册成功！”
  detail?: string; // 详细信息，如钱包地址或具体错误描述
  onCopyPress?: () => void; // 复制按钮点击事件，仅在type=‘success’时存在
}