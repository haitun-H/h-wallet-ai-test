interface GetCodeButtonProps {
      onPress: () => void;
      disabled: boolean; // 根据倒计时或邮箱格式禁用
      countdown?: number; // 倒计时秒数，0或undefined时显示“获取验证码”
    }