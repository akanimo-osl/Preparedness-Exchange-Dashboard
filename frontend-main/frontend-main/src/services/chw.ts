import { apiPost, apiGet, TokenManager } from "@/lib/api";
import type { ChwListResponse, ChwPipelineResponse, District } from "@/types/chw";

export const chw = {
    list: async (page:any, page_size:any,): Promise<ChwListResponse> => {
        return await apiGet<ChwListResponse>(`/chwfolder/?page=${page}&page_size=${page_size}`);
    },
    pipeline: async (country: string): Promise<ChwPipelineResponse> => {
        return await apiGet<ChwPipelineResponse>(`/chwfolder/pipeline?country=${country}`)
    },
    map: async (): Promise<District[]> => {
        return await apiGet<District[]>('/chwfolder/districts/map')
    }
};