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

// ============ WHO Signal Intelligence Types ============

export interface WHOSignalEvent {
  id: string;
  source: 'WHO' | 'EXISTING';
  dataType: 'signal' | 'readiness_summary' | 'readiness_category' | 'existing';
  country: string;
  district?: string;
  disease: string;
  eventType: string;
  status: string;
  grade: string;
  lat?: number;
  lon?: number;
  cases?: number;
  deaths?: number;
  description?: string;
  reportDate: string;
  year: number;
  sourceFile?: string;
  source_priority?: number;
  
  // Readiness Summary specific fields
  avgCategoryScore?: number;
  avgQuestionScore?: number;
  readinessGrade?: string;
  totalQuestions?: number;
  yesResponses?: number;
  noResponses?: number;
  responseRate?: number;
  categoriesCount?: number;
  categories?: string[];
  adminLevel?: string;
  isSubnational?: boolean;
  dataPeriod?: string;
  
  // Readiness Category specific fields
  category?: string;
  categoryCode?: string;
  categoryScore?: number;
  categoryWeight?: number;
  categoryGrade?: string;
  questionsInCategory?: number;
  completionRate?: number;
}

export interface WHODataMetadata {
  total_events: number;
  by_data_type: {
    signal_events: number;
    readiness_summaries: number;
    readiness_categories: number;
  };
  existing_events: number;
  last_updated: string;
  files_summary: {
    total_csv_files: number;
    total_excel_files: number;
    signal_files: { count: number; files: string[] };
    readiness_national_files: { count: number; files: string[] };
    readiness_subnational_files: { count: number; files: string[] };
    excel_files: { count: number; files: string[] };
  };
  filters: {
    countries: string[];
    diseases: string[];
    categories: string[];
  };
  event_types: {
    phe: number;
    signal: number;
    rra: number;
    eis: number;
    readiness: number;
    readiness_category: number;
  };
}

export interface WHODataResponse extends BaseResponse<{
  events: WHOSignalEvent[];
  metadata: WHODataMetadata;
}> {}

export interface WHOHealthCheckResponse extends BaseResponse<{
  status: 'healthy' | 'degraded';
  summary: {
    total_csv_files: number;
    total_excel_files: number;
    signal_files: { count: number; files: string[] };
    readiness_national_files: { count: number; files: string[] };
    readiness_subnational_files: { count: number; files: string[] };
    excel_files: { count: number; files: string[] };
  };
  csv_files: Record<string, boolean>;
  who_data_dir: string;
}> {}