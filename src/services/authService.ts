import axios from 'axios';

// Base URL should be configured in .env file
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 可以在这里添加请求/响应拦截器，例如统一错误处理

export interface SendVerificationResponse {
  success: boolean;
  message: string;
  data: {
    expiresAt: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    walletAddress: string;
    userId: string;
    createdAt: string;
  };
}

export const authService = {
  sendVerificationCode: async (email: string): Promise<SendVerificationResponse> => {
    const response = await apiClient.post<SendVerificationResponse>('/api/auth/send-verification', {
      email,
    });
    return response.data;
  },

  register: async (email: string, code: string): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/api/auth/register', {
      email,
      code,
    });
    return response.data;
  },
};