export interface NewsItem {
  country: string;
  score: number;
  value: number;
}

export interface BaseResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface PlainBaseResponse extends BaseResponse <{

}>{}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T
}

export interface CHWOverview {
  total_chw: number;
  total_chw_per_10k: number;
  countries: string[];
  districts: number;
  regions: number;
  top_region: {region: string; percentage: number}[];
}

export interface EsparOverview {
  total_capacities: number;
  countries: string[];
  years: string[];
}

export interface ReadinessResult {
  total: number;
  answered: number;
  completion_pct: number;
}

export interface ReadinessSummary {
  arbovirus: ReadinessResult;
  cholera: ReadinessResult;
  cholera_subnational: ReadinessResult;
  cyclone: ReadinessResult;
  fvd: ReadinessResult;
  fvd_poe: ReadinessResult;
  lassa_fever: ReadinessResult;
  lassa_fever_district: ReadinessResult;
  marburg: ReadinessResult;
  meningitis: ReadinessResult;
  meningitise_elimination: ReadinessResult;
  mpox: ReadinessResult;
  mpox_district: ReadinessResult;
  natural_disaster: ReadinessResult;
  rift_valley_fever: ReadinessResult;
}

export interface ReadinessOverview {
  total_hazards: number;
  summary: ReadinessSummary;
}

export interface StardataOverview {
  countries: number;
  hazards: number;
  hazard_types: number;
  active: number;
  levels: string[];
  years: string[];
}

export interface OverviewResponse extends BaseResponse<{
    chart:{
        total_chw_and_population_2024: { year: string; country: string; chw: string; population: string; }[],
    }
    chw: CHWOverview;
    espar: EsparOverview;
    readiness: ReadinessOverview;
    stardata: StardataOverview;
}> {}

export interface NewsType {
  key: string;
  value_1: string;
  value_2: string;
}



export interface NewsResponse{
  chw: NewsType[]
  espar: NewsType[],
  stardata: NewsType[],
}

export interface AlertType {
  id: number;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: string;
  status: "active" | "acknowledged" | "resolved";
  title: string;
  description: string;
  country: string;
  region: string;
  date: string;
  acknowledged_by?: string;
}

export interface AlertResponse extends PaginatedResponse<AlertType[]> {
  high: number;
  medium: number;
  low: number;
  critical: number;
}