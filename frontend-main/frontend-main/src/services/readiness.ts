import { apiPost, apiGet } from "@/lib/api";
import type { RegionScore, ReadinessListResponse } from "@/types/readiness_type";
import { normalizeText } from "@/utils";

export const readiness = {
    summary: async (page: any, page_size: any, tab: any, country: any): Promise<ReadinessListResponse> => {
        return await apiGet<ReadinessListResponse>(`/readiness/summary/${normalizeText(tab)}?page=${page}&page_size=${page_size}&readiness=${tab}&country=${country}`);
    },
    heatmap: async (readiness_type: string): Promise<RegionScore[]> => {
        return await apiGet<RegionScore[]>(`/readiness/heatmap?readiness=${readiness_type}`)
    }
};