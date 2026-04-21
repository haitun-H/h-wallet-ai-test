/**
 * 认证服务模块
 * 处理用户认证、token 管理、自动刷新等逻辑
 */

import { authApi, userApi, LoginResponse, RefreshTokenResponse } from './api';

// Token 存储键名
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRY: 'token_expiry',
  USER_INFO: 'user_info',
};

/**
 * 登录服务
 */
export const loginService = {
  /**
   * 用户登录
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await authApi.login({ email, password });
      const data = response.data;
      
      // 存储 token 和用户信息
      storeTokens(data);
      storeUserInfo(data.user);
      
      // 设置自动刷新 token 的定时器
      setupTokenRefresh(data.expires_in);
      
      return data;
    } catch (error: any) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  /**
   * 用户注册
   */
  register: async (
    email: string,
    verificationCode: string,
    password: string,
    confirmPassword: string
  ) => {
    try {
      const response = await userApi.register({
        email,
        verification_code: verificationCode,
        password,
        confirm_password: confirmPassword,
      });
      
      const data = response.data;
      
      // 注册成功后自动登录（存储返回的 token）
      if (response.status === 201) {
        // 注意：注册接口返回的是 UserResponse，不是 LoginResponse
        // 实际 token 应该在响应头或响应体中，这里假设返回了 token
        // 根据合约，注册成功后应自动登录并返回 token
        // 这里简化处理，实际需要根据后端实现调整
        console.log('注册成功，用户信息:', data);
      }
      
      return data;
    } catch (error: any) {
      console.error('注册失败:', error);
      throw error;
    }
  },

  /**
   * 退出登录
   */
  logout: (): void => {
    // 清除所有存储的 token 和用户信息
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(TOKEN_KEYS.USER_INFO);
    
    // 清除自动刷新定时器
    if ((window as any).tokenRefreshTimer) {
      clearTimeout((window as any).tokenRefreshTimer);
    }
    
    console.log('用户已退出登录');
  },

  /**
   * 检查是否已登录
   */
  isLoggedIn: (): boolean => {
    const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    const expiry = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
    
    if (!accessToken || !expiry) {
      return false;
    }
    
    // 检查 token 是否过期
    const expiryTime = parseInt(expiry, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    
    return currentTime < expiryTime;
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: async () => {
    try {
      const response = await userApi.getCurrentUser();
      return response.data;
    } catch (error: any) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  },

  /**
   * 获取存储的 access token
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },

  /**
   * 获取存储的 refresh token
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },
};

/**
 * Token 刷新服务
 */
export const tokenRefreshService = {
  /**
   * 刷新 access token
   */
  refreshAccessToken: async (): Promise<RefreshTokenResponse> => {
    const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      throw new Error('未找到 refresh token');
    }
    
    try {
      const response = await authApi.refreshToken({
        refresh_token: refreshToken,
      });
      
      const data = response.data;
      
      // 存储新的 token
      storeTokens(data);
      
      // 重新设置自动刷新定时器
      setupTokenRefresh(data.expires_in);
      
      return data;
    } catch (error: any) {
      console.error('刷新 token 失败:', error);
      
      // 刷新失败，清除 token 强制重新登录
      loginService.logout();
      
      throw error;
    }
  },

  /**
   * 检查并刷新 token（如果需要）
   */
  checkAndRefreshToken: async (): Promise<boolean> => {
    if (!loginService.isLoggedIn()) {
      return false;
    }
    
    const expiry = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
    if (!expiry) {
      return false;
    }
    
    const expiryTime = parseInt(expiry, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiryTime - currentTime;
    
    // 如果 token 即将过期（剩余时间小于5分钟），则刷新
    if (timeUntilExpiry < 300) {
      try {
        await tokenRefreshService.refreshAccessToken();
        console.log('Token 自动刷新成功');
        return true;
      } catch (error) {
        console.error('Token 自动刷新失败:', error);
        return false;
      }
    }
    
    return true;
  },
};

/**
 * 存储 token 到 localStorage
 */
const storeTokens = (data: LoginResponse | RefreshTokenResponse): void => {
  const expiresIn = data.expires_in;
  const expiryTime = Math.floor(Date.now() / 1000) + expiresIn;
  
  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, data.access_token);
  localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, data.refresh_token);
  localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());
};

/**
 * 存储用户信息到 localStorage
 */
const storeUserInfo = (user: any): void => {
  localStorage.setItem(TOKEN_KEYS.USER_INFO, JSON.stringify(user));
};

/**
 * 设置自动刷新 token 的定时器
 */
const setupTokenRefresh = (expiresIn: number): void => {
  // 清除现有的定时器
  if ((window as any).tokenRefreshTimer) {
    clearTimeout((window as any).tokenRefreshTimer);
  }
  
  // 在 token 过期前5分钟刷新
  const refreshTime = (expiresIn - 300) * 1000;
  
  if (refreshTime > 0) {
    (window as any).tokenRefreshTimer = setTimeout(() => {
      tokenRefreshService.checkAndRefreshToken().catch(console.error);
    }, refreshTime);
    
    console.log(`已设置 token 自动刷新，将在 ${refreshTime / 1000} 秒后执行`);
  }
};

// 初始化时检查 token 状态
export const initializeAuth = async (): Promise<void> => {
  if (loginService.isLoggedIn()) {
    // 检查是否需要刷新 token
    await tokenRefreshService.checkAndRefreshToken();
  }
};

export default loginService;
