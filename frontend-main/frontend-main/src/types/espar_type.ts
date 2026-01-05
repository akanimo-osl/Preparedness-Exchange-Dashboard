import type { BaseResponse } from ".";

interface CapacityAverage {
  [key: string]: number;
}

export interface EsparSummaryResponse extends BaseResponse<{
    filters: {
        country: string;
        year: string;
        countries: string[];
        years: string[];
    };
    capacity_summary: {category: string; value: string}[];
    capacity_average: CapacityAverage;
    overall: {
        value: number;
        change: number;
        prev_year: number;
    }
}> {}

export type CountryScoresType = Record<string, Record<string, number>>;

export interface EsparComparisonResponse extends BaseResponse<{
    categories: string[],
    country_scores: CountryScoresType;
}> {}