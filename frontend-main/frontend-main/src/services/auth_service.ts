import { apiPost, apiGet, TokenManager } from "@/lib/api";
import type { LoginData, LoginResponse, } from "@/types/auth_type";

export const authService = {
    login: async (credentials: LoginData): Promise<LoginResponse> => {
        const response = await apiPost<LoginResponse>('/account/auth/login', credentials);
        // Store tokens
        TokenManager.setTokens({
            accessToken: response.data.access,
            refreshToken: response.data.refresh,
        });
        return response;
    },

    logout: async (): Promise<void> => {
        try {
            await apiPost('/account/auth/logout');
        } finally {
            TokenManager.clearTokens();
            // Redirect to login page
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
            }
        }
    },
};