/**
 * 认证服务
 * 处理用户注册、登录、Token管理等认证相关逻辑
 */

import { 
  userApi, 
  authApi, 
  verificationApi,
  LoginResponse,
  UserResponse,
  SuccessResponse,
  ErrorResponse,
  RegisterUserRequest,
  LoginRequest,
  SendVerificationCodeRequest
} from './api';

// Token 存储键名
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

// 用户信息存储键名
const USER_INFO_KEY = 'user_info';

// 定义 Token 信息接口
interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// 定义用户信息接口
export interface AuthUserInfo {
  id: string;
  email: string;
  wallet_address: string | null;
  wallet_status: 'pending' | 'active' | 'failed';
}

/**
 * 认证服务类
 */
class AuthService {
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  /**
   * 发送邮箱验证码
   * @param email 邮箱地址
   * @returns 发送结果
   */
  async sendVerificationCode(email: string): Promise<SuccessResponse> {
    try {
      console.log('发送验证码到邮箱:', email);
      
      const requestData: SendVerificationCodeRequest = { email };
      const response = await verificationApi.sendVerificationCode(requestData);
      
      console.log('验证码发送成功:', response.data.message);
      return response.data;
    } catch (error: any) {
      console.error('发送验证码失败:', error);
      
      // 提取错误信息
      const errorData = error.response?.data as ErrorResponse;
      if (errorData) {
        throw new Error(errorData.message || '发送验证码失败');
      }
      
      throw new Error('网络错误，请检查网络连接');
    }
  }

  /**
   * 用户注册
   * @param email 邮箱
   * @param verificationCode 验证码
   * @param password 密码
   * @param confirmPassword 确认密码
   * @returns 注册结果
   */
  async register(
    email: string,
    verificationCode: string,
    password: string,
    confirmPassword: string
  ): Promise<UserResponse> {
    try {
      console.log('开始用户注册:', email);
      
      const requestData: RegisterUserRequest = {
        email,
        verification_code: verificationCode,
        password,
        confirm_password: confirmPassword,
      };
      
      const response = await userApi.register(requestData);
      const data = response.data;
      
      console.log('用户注册成功:', data.message || '注册成功');
      
      // 根据 PRD，注册成功后应自动登录
      // 但根据 OpenAPI 合约，注册接口不返回 token
      // 这里我们调用登录接口获取 token
      try {
        const loginResponse = await this.login(email, password);
        console.log('注册后自动登录成功');
        
        // 存储用户信息
        this.storeUserInfo(data);
        
        return data;
      } catch (loginError) {
        console.warn('注册后自动登录失败，用户需要手动登录:', loginError);
        // 注册成功但登录失败，仍然返回注册成功的数据
        return data;
      }
    } catch (error: any) {
      console.error('用户注册失败:', error);
      
      // 提取错误信息
      const errorData = error.response?.data as ErrorResponse;
      if (errorData) {
        throw new Error(errorData.message || '注册失败');
      }
      
      throw new Error('网络错误，请检查网络连接');
    }
  }

  /**
   * 用户登录
   * @param email 邮箱
   * @param password 密码
   * @returns 登录响应
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('用户登录:', email);
      
      const requestData: LoginRequest = { email, password };
      const response = await authApi.login(requestData);
      const data = response.data;
      
      console.log('用户登录成功');
      
      // 存储 Token
      this.storeTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      });
      
      // 存储用户信息
      this.storeUserInfo(data.user);
      
      // 设置 Token 自动刷新
      this.setupTokenRefresh(data.expires_in);
      
      return data;
    } catch (error: any) {
      console.error('用户登录失败:', error);
      
      // 提取错误信息
      const errorData = error.response?.data as ErrorResponse;
      if (errorData) {
        throw new Error(errorData.message || '登录失败');
      }
      
      throw new Error('网络错误，请检查网络连接');
    }
  }

  /**
   * 刷新 Token
   * @returns 刷新后的 Token 信息
   */
  async refreshToken(): Promise<TokenInfo> {
    try {
      console.log('刷新 Token');
      
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('未找到刷新令牌');
      }
      
      const response = await authApi.refreshToken({ refresh_token: refreshToken });
      const data = response.data;
      
      console.log('Token 刷新成功');
      
      // 存储新的 Token
      const tokenInfo: TokenInfo = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
      
      this.storeTokens(tokenInfo);
      
      // 重新设置 Token 自动刷新
      this.setupTokenRefresh(data.expires_in);
      
      return tokenInfo;
    } catch (error: any) {
      console.error('Token 刷新失败:', error);
      
      // 清除 Token，需要重新登录
      this.clearTokens();
      this.clearUserInfo();
      
      throw new Error('Token 已过期，请重新登录');
    }
  }

  /**
   * 检查并刷新 Token（如果即将过期）
   */
  async checkAndRefreshToken(): Promise<void> {
    try {
      const expiryTime = this.getTokenExpiryTime();
      if (!expiryTime) {
        return;
      }
      
      // 如果 Token 将在5分钟内过期，则刷新
      const fiveMinutes = 5 * 60 * 1000;
      if (expiryTime - Date.now() < fiveMinutes) {
        console.log('Token 即将过期，自动刷新');
        await this.refreshToken();
      }
    } catch (error) {
      console.error('自动刷新 Token 失败:', error);
    }
  }

  /**
   * 设置 Token 自动刷新
   * @param expiresIn Token 有效期（秒）
   */
  private setupTokenRefresh(expiresIn: number): void {
    // 清除现有的定时器
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
    
    // 在 Token 过期前5分钟刷新
    const refreshTime = (expiresIn - 300) * 1000; // 转换为毫秒
    
    if (refreshTime > 0) {
      this.tokenRefreshTimer = setTimeout(() => {
        this.checkAndRefreshToken().catch(console.error);
      }, refreshTime);
      
      console.log(`已设置 Token 自动刷新，将在 ${Math.floor(refreshTime / 1000 / 60)} 分钟后刷新`);
    }
  }

  /**
   * 存储 Token
   * @param tokenInfo Token 信息
   */
  private storeTokens(tokenInfo: TokenInfo): void {
    try {
      // 存储到 localStorage
      localStorage.setItem(ACCESS_TOKEN_KEY, tokenInfo.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokenInfo.refreshToken);
      
      // 计算过期时间并存储
      const expiryTime = Date.now() + (tokenInfo.expiresIn * 1000);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      
      console.log('Token 已存储');
    } catch (error) {
      console.error('存储 Token 失败:', error);
    }
  }

  /**
   * 获取访问令牌
   * @returns 访问令牌
   */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * 获取刷新令牌
   * @returns 刷新令牌
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * 获取 Token 过期时间
   * @returns 过期时间戳
   */
  getTokenExpiryTime(): number | null {
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    return expiryTime ? parseInt(expiryTime, 10) : null;
  }

  /**
   * 存储用户信息
   * @param userInfo 用户信息
   */
  private storeUserInfo(userInfo: AuthUserInfo): void {
    try {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
      console.log('用户信息已存储');
    } catch (error) {
      console.error('存储用户信息失败:', error);
    }
  }

  /**
   * 获取用户信息
   * @returns 用户信息
   */
  getUserInfo(): AuthUserInfo | null {
    try {
      const userInfoStr = localStorage.getItem(USER_INFO_KEY);
      if (userInfoStr) {
        return JSON.parse(userInfoStr) as AuthUserInfo;
      }
      return null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 清除 Token
   */
  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    
    // 清除定时器
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
    
    console.log('Token 已清除');
  }

  /**
   * 清除用户信息
   */
  clearUserInfo(): void {
    localStorage.removeItem(USER_INFO_KEY);
    console.log('用户信息已清除');
  }

  /**
   * 用户登出
   */
  logout(): void {
    console.log('用户登出');
    this.clearTokens();
    this.clearUserInfo();
  }

  /**
   * 检查用户是否已登录
   * @returns 是否已登录
   */
  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    const expiryTime = this.getTokenExpiryTime();
    
    if (!token || !expiryTime) {
      return false;
    }
    
    // 检查 Token 是否已过期
    return expiryTime > Date.now();
  }

  /**
   * 获取当前用户信息（从 API）
   * @returns 用户信息
   */
  async getCurrentUser(): Promise<AuthUserInfo> {
    try {
      const response = await userApi.getCurrentUser();
      const userInfo = response.data;
      
      // 更新本地存储的用户信息
      this.storeUserInfo(userInfo);
      
      return userInfo;
    } catch (error: any) {
      console.error('获取当前用户信息失败:', error);
      
      // 提取错误信息
      const errorData = error.response?.data as ErrorResponse;
      if (errorData) {
        throw new Error(errorData.message || '获取用户信息失败');
      }
      
      throw new Error('网络错误，请检查网络连接');
    }
  }

  /**
   * 初始化认证状态
   */
  initialize(): void {
    console.log('初始化认证服务');
    
    // 检查 Token 是否即将过期
    if (this.isLoggedIn()) {
      const expiryTime = this.getTokenExpiryTime();
      if (expiryTime) {
        const expiresIn = Math.floor((expiryTime - Date.now()) / 1000);
        if (expiresIn > 0) {
          this.setupTokenRefresh(expiresIn);
        }
      }
    }
  }
}

// 创建单例实例
const authService = new AuthService();

export default authService;
