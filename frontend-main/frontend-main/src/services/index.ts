import { apiPost, apiGet, TokenManager } from "@/lib/api";
import type { AlertResponse, NewsResponse, NewsType, OverviewResponse } from "@/types";
import type { LoginData, LoginResponse, } from "@/types/auth_type";

export const service = {
    overview: async (): Promise<OverviewResponse> => {
        return await apiGet<OverviewResponse>('/account/overview');
    },
    news: async (): Promise<NewsResponse> => {
        return await apiGet<NewsResponse>('/account/news')
    },
    alert: {
        list: async(page:any, page_size:any, severity: string, status: string, category: string, search: string): Promise<AlertResponse> => {
            return await apiGet<AlertResponse>(`/account/alerts?page=${page}&page_size=${page_size}&severity=${severity}&status=${status}&category=${category}&search=${search}`)
        },
        create: async(data: any): Promise<void> =>{
            return await apiPost<void>('/account/alerts', data)
        },
        resolve: async(id: any): Promise<void>=>{
            return await apiPost<void>(`/account/alert/${id}/resolve`)
        },
        acknowledge: async(id: any): Promise<void>=>{
            return await apiPost<void>(`/account/alert/${id}/acknowledge`)
        }
    }
};