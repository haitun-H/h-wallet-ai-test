import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 从环境变量读取，开发时可在 app.json 或 .env 中配置
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：可在此处添加token等
api.interceptors.request.use(async (config) => {
  // 示例：从AsyncStorage获取token
  // const token = await AsyncStorage.getItem('userToken');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

// 响应拦截器：处理通用错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 统一处理网络错误或服务器错误
    const message = error.response?.data?.message || '网络请求失败，请稍后重试';
    return Promise.reject(new Error(message));
  }
);

export interface SendCodeResponse {
  code: number;
  message: string;
  data: {
    sid: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  verificationCode: string;
  sid: string;
}

export interface RegisterResponse {
  code: number;
  message: string;
  data: {
    userId: string;
    token: string;
    walletAddress: string;
    nickname: string;
  };
}

export const authService = {
  // 发送验证码
  sendVerificationCode: (email: string): Promise<SendCodeResponse> => {
    return api.post('/api/v1/auth/send-verification-code', { email });
  },

  // 提交注册
  register: (data: RegisterRequest): Promise<RegisterResponse> => {
    return api.post('/api/v1/auth/register', data);
  },
};