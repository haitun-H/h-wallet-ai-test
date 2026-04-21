/**
 * API 服务配置
 * 基于 OpenAPI 3.1 合约定义
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 从环境变量获取 API 基础 URL，默认为本地开发服务器
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080/v1';

// 定义 API 响应类型
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: AxiosRequestConfig;
}

// 定义错误响应类型
export interface ErrorResponse {
  code: string;
  message: string;
  request_id: string;
  details?: any;
}

// 定义成功响应类型
export interface SuccessResponse {
  success: boolean;
  message: string;
  request_id: string;
}

// 定义发送验证码请求类型
export interface SendVerificationCodeRequest {
  email: string;
}

// 定义注册用户请求类型
export interface RegisterUserRequest {
  email: string;
  verification_code: string;
  password: string;
  confirm_password: string;
}

// 定义登录请求类型
export interface LoginRequest {
  email: string;
  password: string;
}

// 定义刷新令牌请求类型
export interface RefreshTokenRequest {
  refresh_token: string;
}

// 定义用户资料类型
export interface UserProfile {
  id: string;
  email: string;
  wallet_address: string | null;
  wallet_status: 'pending' | 'active' | 'failed';
  created_at: string;
  updated_at: string;
}

// 定义用户响应类型（注册成功返回）
export interface UserResponse extends UserProfile {
  message?: string;
}

// 定义登录响应类型
export interface LoginResponse {
  user: UserProfile;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

// 定义刷新令牌响应类型
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

// 定义钱包状态响应类型
export interface WalletStatusResponse {
  wallet_address: string | null;
  status: 'pending' | 'active' | 'failed';
  created_at: string;
  updated_at: string;
  error_message?: string | null;
}

// 创建 axios 实例
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10秒超时
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 从本地存储获取 token
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // 添加请求 ID 到 headers（可选，后端可能会生成）
      config.headers['X-Request-ID'] = `frontend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`发起请求: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('请求配置错误:', error);
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => {
      console.log(`请求成功: ${response.config.url}`, response.status);
      return response;
    },
    (error) => {
      if (error.response) {
        // 服务器返回了错误状态码
        const { status, data } = error.response;
        console.error(`请求失败: ${error.config.url}`, status, data);
        
        // 处理特定错误状态码
        if (status === 401) {
          console.warn('认证失败，可能需要重新登录');
          // 这里可以触发重新登录逻辑
        } else if (status === 429) {
          console.warn('请求过于频繁，请稍后再试');
        }
      } else if (error.request) {
        // 请求已发出但没有收到响应
        console.error('网络错误，请检查网络连接:', error.message);
      } else {
        // 请求配置错误
        console.error('请求配置错误:', error.message);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// 创建 API 实例
const api = createApiInstance();

// 验证码相关 API
export const verificationApi = {
  /**
   * 发送邮箱验证码
   * @param data 发送验证码请求数据
   * @returns 成功响应
   */
  sendVerificationCode: async (data: SendVerificationCodeRequest): Promise<ApiResponse<SuccessResponse>> => {
    return api.post('/verification-codes', data);
  },
};

// 用户相关 API
export const userApi = {
  /**
   * 用户注册
   * @param data 注册请求数据
   * @returns 用户响应
   */
  register: async (data: RegisterUserRequest): Promise<ApiResponse<UserResponse>> => {
    return api.post('/users', data);
  },

  /**
   * 获取当前用户信息
   * @returns 用户资料
   */
  getCurrentUser: async (): Promise<ApiResponse<UserProfile>> => {
    return api.get('/me');
  },
};

// 认证相关 API
export const authApi = {
  /**
   * 用户登录
   * @param data 登录请求数据
   * @returns 登录响应
   */
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return api.post('/auth/login', data);
  },

  /**
   * 刷新访问令牌
   * @param data 刷新令牌请求数据
   * @returns 刷新令牌响应
   */
  refreshToken: async (data: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> => {
    return api.post('/auth/refresh', data);
  },
};

// 钱包相关 API
export const walletApi = {
  /**
   * 查询钱包创建状态
   * @returns 钱包状态响应
   */
  getWalletStatus: async (): Promise<ApiResponse<WalletStatusResponse>> => {
    return api.get('/wallets/status');
  },
};

export default api;
