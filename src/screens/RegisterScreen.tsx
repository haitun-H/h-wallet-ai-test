const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 模拟验证码存储（生产环境需用Redis等）
const codeStore = {};

// 发送验证码端点
app.post('/send-code', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: '邮箱不能为空' });
  }
  // 模拟生成6位验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  codeStore[email] = { code, expires: Date.now() + 5 * 60 * 1000 }; // 5分钟有效期
  console.log(`验证码 ${code} 发送到 ${email}`); // 实际应调用邮件服务
  res.json({ success: true, message: '验证码已发送' });
});

// 验证并创建钱包端点
app.post('/verify-and-create-wallet', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ success: false, message: '参数缺失' });
  }

  // 验证码校验
  const record = codeStore[email];
  if (!record || record.code !== code || record.expires < Date.now()) {
    return res.status(400).json({ success: false, message: '验证码无效或已过期' });
  }

  try {
    // 调用OKX Agent Wallet API（需替换为实际API密钥和参数）
    const okxResponse = await axios.post(
      'https://www.okx.com/api/v5/waas/agent-wallet/create',
      {
        // 根据OKX文档填写参数，例如：
        // chainId: '1',
        // userId: email, // 可用邮箱作为用户标识
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'OK-ACCESS-KEY': process.env.OKX_API_KEY, // 从环境变量读取
          'OK-ACCESS-SIGN': '...', // 需按OKX要求生成签名
          'OK-ACCESS-TIMESTAMP': new Date().toISOString(),
        },
      }
    );

    if (okxResponse.data.code === '0') {
      const walletAddress = okxResponse.data.data.walletAddress; // 根据实际API响应调整
      delete codeStore[email]; // 清除已用验证码
      res.json({ success: true, walletAddress });
    } else {
      throw new Error(okxResponse.data.msg);
    }
  } catch (error) {
    console.error('OKX API调用失败:', error.message);
    res.status(500).json({ success: false, message: '钱包创建失败，请重试' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`后端服务运行在端口 ${PORT}`));