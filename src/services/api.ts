import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SendCodeResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface VerifyAndRegisterResponse {
  success: boolean;
  data?: {
    walletAddress: string;
    message: string;
  };
  error?: string;
}

export const authApi = {
  sendCode: (email: string): Promise<SendCodeResponse> =>
    api.post('/api/auth/send-code', { email }).then((res) => res.data),

  verifyAndRegister: (
    email: string,
    code: string
  ): Promise<VerifyAndRegisterResponse> =>
    api
      .post('/api/auth/verify-and-register', { email, code })
      .then((res) => res.data),
};

export default api;