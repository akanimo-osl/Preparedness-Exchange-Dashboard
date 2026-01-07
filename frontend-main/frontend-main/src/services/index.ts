import { apiPost, apiGet, TokenManager } from "@/lib/api";
import type { AlertResponse, NewsResponse, NewsType, OverviewResponse, WHODataResponse, WHOHealthCheckResponse } from "@/types";
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
    },
    // WHO Signal Intelligence Data
    who: {
        getData: async (params?: {
            dataType?: 'signal' | 'readiness_summary' | 'readiness_category' | 'all';
            country?: string;
            disease?: string;
            eventType?: string;
            grade?: string;
            status?: string;
            source?: string;
            isSubnational?: boolean;
            category?: string;
        }): Promise<WHODataResponse> => {
            const queryParams = new URLSearchParams();
            if (params?.dataType) queryParams.append('dataType', params.dataType);
            if (params?.country) queryParams.append('country', params.country);
            if (params?.disease) queryParams.append('disease', params.disease);
            if (params?.eventType) queryParams.append('eventType', params.eventType);
            if (params?.grade) queryParams.append('grade', params.grade);
            if (params?.status) queryParams.append('status', params.status);
            if (params?.source) queryParams.append('source', params.source);
            if (params?.isSubnational !== undefined) queryParams.append('isSubnational', String(params.isSubnational));
            if (params?.category) queryParams.append('category', params.category);
            
            const queryString = queryParams.toString();
            return await apiGet<WHODataResponse>(`/readiness/who-data${queryString ? `?${queryString}` : ''}`);
        },
        getSignals: async (): Promise<WHODataResponse> => {
            return await apiGet<WHODataResponse>('/readiness/who-data?dataType=signal');
        },
        getReadinessSummary: async (): Promise<WHODataResponse> => {
            return await apiGet<WHODataResponse>('/readiness/who-data?dataType=readiness_summary');
        },
        getReadinessCategories: async (): Promise<WHODataResponse> => {
            return await apiGet<WHODataResponse>('/readiness/who-data?dataType=readiness_category');
        },
        healthCheck: async (): Promise<WHOHealthCheckResponse> => {
            return await apiGet<WHOHealthCheckResponse>('/readiness/who-data/health');
        }
    }
};