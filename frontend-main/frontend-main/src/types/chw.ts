import type { BaseResponse, PaginatedResponse } from ".";

export interface Country {
  country_id: number;
  country: string;
  population_2024: number;
  total_chws: number;
  chws_per_10000: number;
  total_regions: number;
  total_districts: number;
  data_year: number;
  last_updated: string; // DRF returns dates as ISO strings
}


export interface Region {
  region_id: number;
  country: number | Country; // depending on serializer: ID or nested object
  region_name: string;
  district_count: number;
  region_number: number;
  province: string | null;
}

export interface District {
  district_id: number;
  region?: Region; 
  country?: Country;
  district_name: string;
  chw_count: number;
  population_est: number;
  chws_per_10k: number;
}


export interface ChwListResponse extends PaginatedResponse<District[]> {
    total_countries: number
}

export interface ChwPipelineResponse extends BaseResponse<{
    top_region: {region: string; percentage: number}[];
    country_summary: {
        total_chws: number;
        chw_density: number;
        top_region: {
            name: string | null;
            avg_chws_per_10k: number | null;
            drop_pct: number;
        };
        total_regions: number;
        total_districts: number;
        population: number;
    };
    countries: string[];
}> {}