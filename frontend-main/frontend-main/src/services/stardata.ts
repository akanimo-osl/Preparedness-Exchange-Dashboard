import { apiPost, apiGet } from "@/lib/api";
import type { StardataChartResponse, StardataListResponse, StardataSummaryResponse, StarDataType } from "@/types/stardata_type";

export const stardata = {
    summary: async (hazard: any, hazard_type: any, severity: any, status: any): Promise<StardataSummaryResponse> => {
        return await apiGet<StardataSummaryResponse>(`/stardata/summary?hazard=${hazard}&hazard_type=${hazard_type}&severity=${severity}&status=${status}`);
    },
    charts: async (country: any): Promise<StardataChartResponse> => {
        return await apiGet<StardataChartResponse>(`/stardata/charts?country=${country}`);
    },
    list: async(page: any, page_size: any): Promise<StardataListResponse>=>{
        return await apiGet<StardataListResponse>(`/stardata/?page=${page}&page_size=${page_size}`)
    }
};