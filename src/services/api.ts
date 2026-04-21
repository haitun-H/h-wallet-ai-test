/**
 * API 服务模块
 * 基于 OpenAPI 3.1 合约定义的所有接口调用
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 基础响应类型
export interface BaseResponse<T = any> {
  success?: boolean;
  message?: string;
  request_id?: string;
}

// 错误响应类型
export interface ErrorResponse {
  code: string;
  message: string;
  request_id: string;
  details?: any;
}

// 发送验证码请求
export interface SendVerificationCodeRequest {
  email: string;
}

// 发送验证码响应
export interface SendVerificationCodeResponse extends BaseResponse {
  success: boolean;
  message: string;
  request_id: string;
}

// 注册用户请求
export interface RegisterUserRequest {
  email: string;
  verification_code: string;
  password: string;
  confirm_password: string;
}

// 用户信息
export interface UserProfile {
  id: string;
  email: string;
  wallet_address: string | null;
  wallet_status: 'pending' | 'active' | 'failed';
  created_at: string;
  updated_at: string;
}

// 注册用户响应
export interface RegisterUserResponse extends UserProfile {
  message: string;
}

// 登录请求
export interface LoginRequest {
  email: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  user: UserProfile;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

// 刷新令牌请求
export interface RefreshTokenRequest {
  refresh_token: string;
}

// 刷新令牌响应
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

// 钱包状态响应
export interface WalletStatusResponse {
  wallet_address: string | null;
  status: 'pending' | 'active' | 'failed';
  created_at: string;
  updated_at: string;
  error_message: string | null;
}

// API 配置
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/v1', // 开发环境地址，可根据环境变量切换
  TIMEOUT: 10000, // 10秒超时
};

// 创建 axios 实例
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器 - 添加认证 token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      console.error('请求拦截器错误:', error);
      return Promise.reject(error);
    }
  );

  // 响应拦截器 - 统一错误处理
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        // 服务器返回错误状态码
        const errorData: ErrorResponse = error.response.data;
        console.error('API 错误响应:', {
          code: errorData.code,
          message: errorData.message,
          request_id: errorData.request_id,
          status: error.response.status,
        });
      } else if (error.request) {
        // 请求已发出但没有收到响应
        console.error('网络错误: 请求无响应', error.request);
      } else {
        // 请求配置错误
        console.error('请求配置错误:', error.message);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// API 实例
const api = createApiInstance();

/**
 * 验证码相关 API
 */
export const verificationApi = {
  /**
   * 发送邮箱验证码
   */
  sendVerificationCode: async (
    data: SendVerificationCodeRequest
  ): Promise<AxiosResponse<SendVerificationCodeResponse>> => {
    return api.post<SendVerificationCodeResponse>('/verification-codes', data);
  },
};

/**
 * 用户相关 API
 */
export const userApi = {
  /**
   * 用户注册
   */
  register: async (
    data: RegisterUserRequest
  ): Promise<AxiosResponse<RegisterUserResponse>> => {
    return api.post<RegisterUserResponse>('/users', data);
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: async (): Promise<AxiosResponse<UserProfile>> => {
    return api.get<UserProfile>('/me');
  },
};

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 用户登录
   */
  login: async (data: LoginRequest): Promise<AxiosResponse<LoginResponse>> => {
    return api.post<LoginResponse>('/auth/login', data);
  },

  /**
   * 刷新访问令牌
   */
  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<AxiosResponse<RefreshTokenResponse>> => {
    return api.post<RefreshTokenResponse>('/auth/refresh', data);
  },
};

/**
 * 钱包相关 API
 */
export const walletApi = {
  /**
   * 查询钱包创建状态
   */
  getWalletStatus: async (): Promise<AxiosResponse<WalletStatusResponse>> => {
    return api.get<WalletStatusResponse>('/wallets/status');
  },
};

export default api;
