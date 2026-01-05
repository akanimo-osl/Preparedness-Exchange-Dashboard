import axios, { AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Types
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

interface ApiError {
  message: string;
  status: number;
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
class TokenManager {
  private static ACCESS_TOKEN_KEY = 'access_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => { 
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = TokenManager.getRefreshToken();

      if (!refreshToken) {
        // No refresh token, redirect to login
        redirectToLogin();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<RefreshResponse>(
          `${API_BASE_URL}/account/auth/token/refresh`,
          { refresh_token: refreshToken }
        );

        const { access_token, refresh_token } = response.data;
        
        TokenManager.setTokens({
          accessToken: access_token,
          refreshToken: refresh_token,
        });

        processQueue(null, access_token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        processQueue(refreshError, null);
        TokenManager.clearTokens();
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Redirect to login with current page as 'next' parameter
const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname + window.location.search;
    
    // Avoid redirect loop if already on login page
    if (window.location.pathname.startsWith("/login")) {
      return;
    }

    const loginUrl = `/login?next=${encodeURIComponent(currentPath)}`;
    window.location.href = loginUrl;
  }
};

// API Consumer Class
export class ApiConsumer {
  // GET request
  static async get<T = any>(url: string, config?: any): Promise<T> {
    try {
      const response = await api.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // POST request
  static async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // PUT request
  static async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // PATCH request
  static async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await api.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // DELETE request
  static async delete<T = any>(url: string, config?: any): Promise<T> {
    try {
      const response = await api.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // Upload file
  static async upload<T = any>(url: string, file: File | FormData, onProgress?: (progress: number) => void): Promise<T> {
    try {
      const formData = file instanceof FormData ? file : new FormData();
      if (file instanceof File) {
        formData.append('file', file);
      }

      const response = await api.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // Download file
  static async download(url: string, filename?: string): Promise<void> {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // Error handler
  private static handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        message: (error.response.data as any)?.message || error.message,
        status: error.response.status,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - no response received',
        status: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message,
        status: 0,
      };
    }
  }
}

// Export token manager for manual token management
export { TokenManager };

// Export the configured axios instance for advanced usage
export { api };

// Convenience functions for direct use
export const apiGet = ApiConsumer.get.bind(ApiConsumer);
export const apiPost = ApiConsumer.post.bind(ApiConsumer);
export const apiPut = ApiConsumer.put.bind(ApiConsumer);
export const apiPatch = ApiConsumer.patch.bind(ApiConsumer);
export const apiDelete = ApiConsumer.delete.bind(ApiConsumer);
export const apiUpload = ApiConsumer.upload.bind(ApiConsumer);
export const apiDownload = ApiConsumer.download.bind(ApiConsumer);