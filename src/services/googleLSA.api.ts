import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from "./api.service";
import { useAuth } from "@/store/AuthContext";

export type ILSAHeatmapResponse = Record<string, number[]>;
export type LSAJobTypeResponse = {
  service_id: string;
  leads: number;
  revenue: number;
};
export type LSAStackChartResponse = {
  month: string;
  leads: number;
  deals: number;
};

type BusinessInfo = {
  business_name: string;
  location: string;
  currency_code: string;
  time_zone: string;
};

type KpiSummary = {
  leads: number;
  deals: number;
  revenue: number;
  ad_spend: number;
  roas: number;
  currency: string;
  date_range: string;
};

type CostSummary = {
  total_cost: number;
  formatted_cost: string;
  conversions: number;
  currency: string;
};

type LeadTypes = {
  [key: string]: number; // e.g., { "3": 273 }
};

type LeadsByCategory = {
  category_name: string;
  category_id: string;
  service_ids: string[];
  total_leads: number;
  charged_leads: number;
  booked_leads: number;
  lead_types: LeadTypes;
  business_name: string;
  location: string;
  currency_code: string;
  time_zone: string;
};

type Summary = {
  total_leads: number;
  total_charged_leads: number;
  categories_count: number;
};

export type LSALocationResponse = {
  business_info: BusinessInfo | {};
  kpi_summary: KpiSummary;
  cost_summary: CostSummary;
  leads_by_category: LeadsByCategory[];
  summary: Summary;
};

type MetricWithPct = {
  value: number | null;
  change_pct: number | null;
};
export type LSAKpiSummaryResponse = {
  leads: MetricWithPct;
  deals: MetricWithPct;
  ad_spend: MetricWithPct;
  revenue: MetricWithPct;
  roas: MetricWithPct;
};

// --- API Functions ---

const LSABaseUrl = "/v1/lsa";
const formatDateRange = (range: string) =>
  range.toLowerCase().replace(/\s+/g, "_");

export const getHeatMap = async (
  configId: string,
  date_range: string
): Promise<ILSAHeatmapResponse> => {
  try {
    const response = await api.get(`${LSABaseUrl}/${configId}/kpi/heatmap`, {
      params: { date_range: formatDateRange(date_range) },
    });
    return response.data;
  } catch (error) {
    console.error("LSA Heatmap fetch failed:", error);
    throw error;
  }
};

export const getJobType = async (
  configId: string,
  date_range: string
): Promise<LSAJobTypeResponse[]> => {
  try {
    const response = await api.get(`${LSABaseUrl}/${configId}/kpi/job-type`, {
      params: { date_range: formatDateRange(date_range) },
    });
    return response.data;
  } catch (error) {
    console.error("LSA Kpi Job type fetch failed:", error);
    throw error;
  }
};

export const getKpiSummary = async (
  configId: string,
  date_range: string
): Promise<LSAKpiSummaryResponse> => {
  try {
    const response = await api.get(`${LSABaseUrl}/${configId}/kpi/summary`, {
      params: { date_range: formatDateRange(date_range) },
    });
    return response.data;
  } catch (error) {
    console.error("LSA Kpi Summary fetch failed:", error);
    throw error;
  }
};

export const getMonthlyChart = async (
  configId: string
): Promise<LSAStackChartResponse[]> => {
  try {
    const response = await api.get(`${LSABaseUrl}/${configId}/kpi/monthly`);
    return response.data;
  } catch (error) {
    console.error("LSA monthly data fetch failed:", error);
    throw error;
  }
};

// Hooks
export const useHeatMap = (configId: string, date_range: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleLSAHeatmap", configId, date_range],
    queryFn: () => getHeatMap(configId, date_range),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: ILSAHeatmapResponse) => {
      console.log("Heatmap data:", data);
    },
    onError: (error: Error) => {
      console.error("Heatmap fetch failed:", error);
    },
  } as UseQueryOptions<ILSAHeatmapResponse, Error>);
};

export const useJobType = (configId: string, date_range: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleLSAJobType", configId, date_range],
    queryFn: () => getJobType(configId, date_range),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: LSAJobTypeResponse[]) => {
      console.log("JobType data:", data);
    },
    onError: (error: Error) => {
      console.error("JobType fetch failed:", error);
    },
  } as UseQueryOptions<LSAJobTypeResponse[], Error>);
};

export const useSummary = (configId: string, date_range: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleLSASummary", configId, date_range],
    queryFn: () => getKpiSummary(configId, date_range),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: LSAKpiSummaryResponse) => {
      console.log("summary data:", data);
    },
    onError: (error: Error) => {
      console.error("summary fetch failed:", error);
    },
  } as UseQueryOptions<LSAKpiSummaryResponse, Error>);
};

export const useMonthlyChart = (configId: string, company_id?: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleLSAMonthlyChart", configId, company_id],
    queryFn: () => getMonthlyChart(configId),
    enabled: !!configId && isAuthenticated,
  } as UseQueryOptions<LSAStackChartResponse[], Error>);
};

// TODO: add company ID
export const useLSALocationsQuery = ({
  config_id,
  timeRange,
}: {
  config_id: string | null;
  timeRange: string;
}) => {
  return useQuery({
    queryKey: ["lsa-locations", config_id, timeRange],
    enabled: !!config_id,
    queryFn: async () => {
      const response = await api.get(`${LSABaseUrl}/leads/location`, {
        params: { config_id, date_range: timeRange },
      });
      return response.data?.data;
    },
    onError: (error: Error) => {
      console.error("monthly data fetch failed:", error);
    },
  } as UseQueryOptions<LSALocationResponse, Error>);
};

export type SummaryChangesParams = {
  configId: string | null;
  date_range: string;
  leads: number;
  deals: number;
  ad_spend: number;
  revenue: number;
  roas: number;
  enabled: boolean;
};
export const useLSASummaryChangesQuery = (params: SummaryChangesParams) => {
  const { configId, date_range, enabled, ...restOfParams } = params || {};
  return useQuery({
    queryKey: ["lsa-summary-changes", configId, date_range],
    enabled,
    queryFn: async () => {
      const response = await api.get(
        `${LSABaseUrl}/${configId}/kpi/summary/change-pct`,
        {
          params: { date_range, ...restOfParams },
        }
      );
      return response.data;
    },
    onError: (error: Error) => {
      console.error("monthly data fetch failed:", error);
    },
  } as UseQueryOptions<LSAKpiSummaryResponse, Error>);
};
