import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import api from "./api.service";
import { useAuth } from "@/store/AuthContext";
import { ChartData, CompanyDetails, Plan } from "@/types";
import { IChannelStat } from "@/components/home/ChannelTable";
import { showToast } from "@/components/Toast";
import { CompanyInfoForm } from "@/components/accounts/CreateClientModal";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export interface IChannelListResponse {
  items: IChannelStat[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface IGetChannelParams {
  page?: number;
  size?: number;
  date_range: string;
}

export interface IConversionRate {
  months: string[];
  rates: number[];
}

export interface IMonthlyReportResponse {
  months: string[];
  traffic: number[];
  leads: number[];
  deals: number[];
  revenue: number[];
}

export interface IReportOverviewResponseValues {
  value: string;
  change: string | null;
}
export interface IReportOverviewResponse {
  deals: IReportOverviewResponseValues;
  traffic: IReportOverviewResponseValues;
  cpa: {
    cpa_deals: IReportOverviewResponseValues;
    cpa_leads: IReportOverviewResponseValues;
  };
  revenue: IReportOverviewResponseValues;
  spend: IReportOverviewResponseValues;
  roas: IReportOverviewResponseValues;
  currency: string | null;
}

export interface ChannelReportResponse {
  items: {
    channel: string;
    sales: number;
    revenue: number;
  }[];
}
export type ChangeData = {
  change_percentage: number;
};
export type DashboardChangeData = {
  traffic: ChangeData;
  deals: ChangeData;
  revenue: ChangeData;
  spend: ChangeData;
  roas: ChangeData;
  cpa_leads: ChangeData;
  cpa_deals: ChangeData;
};

const BASE = "/v1/analytics";
export const fmt = (range: string) => range.toLowerCase().replace(/\s+/g, "_");

// ---------------------------------------API Functions-----------------------
export const getChannelReports = async (
  params?: IGetChannelParams
): Promise<IChannelListResponse> => {
  try {
    const response = await api.get(`${BASE}/channel-report`, { params });
    return response.data;
  } catch (error) {
    console.error("Channels fetch failed:", error);
    throw error;
  }
};

export const getLeadConversionRate = async (
  date_range: string,
  company_id: string,
  google_ads_config_id: string,
  lsa_config_id: string
): Promise<IConversionRate> => {
  try {
    const response = await api.get(`${BASE}/leads/conversion-rate`, {
      params: { date_range, company_id, google_ads_config_id, lsa_config_id },
    });
    return response.data;
  } catch (error) {
    console.error("conversion fetch failed:", error);
    throw error;
  }
};

export const getSaleConversionRate = async (
  date_range: string,
  company_id: string
): Promise<IConversionRate> => {
  try {
    const response = await api.get(`${BASE}/deals/conversion-rate`, {
      params: { date_range, company_id },
    });
    return response.data;
  } catch (error) {
    console.error("conversion fetch failed:", error);
    throw error;
  }
};

export const getReportOverview = async (
  date_range: string,
  company_id: string,
  google_ads_config_id: string,
  lsa_config_id: string
): Promise<IReportOverviewResponse> => {
  try {
    const response = await api.get(`${BASE}/performance-overview`, {
      params: { date_range, company_id, google_ads_config_id, lsa_config_id },
    });
    return response.data;
  } catch (error) {
    console.error("performance fetch failed:", error);
    throw error;
  }
};

export const getChannelRevenue = async (
  date_range: string,
  company_id: string
): Promise<ChannelReportResponse> => {
  try {
    const response = await api.get(`${BASE}/channel-revenue`, {
      params: { date_range, company_id },
    });
    return response.data;
  } catch (error) {
    console.error("performance fetch failed:", error);
    throw error;
  }
};

export const getChannelSales = async (
  date_range: string,
  company_id: string
): Promise<ChannelReportResponse> => {
  try {
    const response = await api.get(`${BASE}/channel-sales`, {
      params: { date_range, company_id },
    });
    return response.data;
  } catch (error) {
    console.error("performance fetch failed:", error);
    throw error;
  }
};

export const getMonthlyPerformance = async (
  date_range: string,
  company_id: string,
  selectedChartType: string
): Promise<ChartData[]> => {
  try {
    const response = await api.get(`${BASE}/${company_id}/monthly-stats`, {
      params: { date_range, group_by: selectedChartType },
    });
    return response.data.items;
  } catch (error) {
    console.error("monthly performance fetch failed:", error);
    throw error;
  }
};

//-------------------------------------Hooks----------------------------------
export const useChannelsList = (
  params?: IGetChannelParams,
  enabled: boolean = true
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["channels", params],
    queryFn: () => getChannelReports(params),
    enabled: isAuthenticated && enabled,
    onSuccess: (data: IChannelListResponse) => {
      console.log("Contacts Interaction data:", data);
    },
    onError: (error: Error) => {
      console.error("Contacts Interaction fetch failed:", error);
    },
  } as UseQueryOptions<IChannelListResponse, Error>);
};

export const useLeadsConversions = (
  date_range: string,
  company_id: string,
  google_ads_config_id: string,
  lsa_config_id: string
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [
      "conversions",
      date_range,
      company_id,
      google_ads_config_id,
      lsa_config_id,
    ],
    queryFn: () =>
      getLeadConversionRate(
        date_range,
        company_id,
        google_ads_config_id,
        lsa_config_id
      ),
    enabled: isAuthenticated,
    onSuccess: (data: IConversionRate) => {
      console.log("leads conversion data:", data);
    },
    onError: (error: Error) => {
      console.error("lead conversion fetch failed:", error);
    },
  } as UseQueryOptions<IConversionRate, Error>);
};

export const useDealsConversions = (date_range: string, company_id: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["conversionsDeals", date_range, company_id],
    queryFn: () => getSaleConversionRate(date_range, company_id),
    enabled: isAuthenticated,
    onSuccess: (data: IConversionRate) => {
      console.log("sales conversion data:", data);
    },
    onError: (error: Error) => {
      console.error("sales conversion fetch failed:", error);
    },
  } as UseQueryOptions<IConversionRate, Error>);
};

export const useChannelRevenue = (date_range: string, company_id: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["ChannelRevenue", date_range, company_id],
    queryFn: () => getChannelRevenue(date_range, company_id),
    enabled: isAuthenticated,
    onSuccess: (data: ChannelReportResponse) => {
      console.log("channel revenue data:", data);
    },
    onError: (error: Error) => {
      console.error("channel revenue fetch failed:", error);
    },
  } as UseQueryOptions<ChannelReportResponse, Error>);
};

export const useChannelSales = (date_range: string, company_id: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["ChannelSales", date_range, company_id],
    queryFn: () => getChannelSales(date_range, company_id),
    enabled: isAuthenticated,
    onSuccess: (data: ChannelReportResponse) => {
      console.log("channel sales data:", data);
    },
    onError: (error: Error) => {
      console.error("channel sales fetch failed:", error);
    },
  } as UseQueryOptions<ChannelReportResponse, Error>);
};

export const useMonthlyPerformance = (
  date_range: string,
  company_id: string,
  selectedChartType: string
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [
      "monthly performance",
      date_range,
      company_id,
      selectedChartType,
    ],
    queryFn: () =>
      getMonthlyPerformance(date_range, company_id, selectedChartType),
    enabled: isAuthenticated,
    onSuccess: (data: any) => {
      console.log("monthly performance data:", data);
    },
    onError: (error: Error) => {
      console.error("monthly performance fetch failed:", error);
    },
  } as UseQueryOptions<any, Error>);
};

export const useReportOverview = (
  date_range: string,
  enabled: boolean,
  company_id: string,
  google_ads_config_id: string,
  lsa_config_id: string
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [
      "report overview",
      date_range,
      company_id,
      google_ads_config_id,
      lsa_config_id,
    ],
    queryFn: () =>
      getReportOverview(
        date_range,
        company_id,
        google_ads_config_id,
        lsa_config_id
      ),
    enabled: isAuthenticated && Boolean(company_id) && enabled,
    onSuccess: (data: IReportOverviewResponse) => {
      console.log("report overview data:", data);
    },
    onError: (error: Error) => {
      console.error("report overview fetch failed:", error);
    },
  } as UseQueryOptions<IReportOverviewResponse, Error>);
};

export const useGetBillingPlansQuery = () => {
  return useQuery({
    queryKey: ["billing-plans"],
    queryFn: () => api.get(`${API_BASE_URL}/api/v1/billing/plans`),

    onError: (error: Error) => {
      showToast({ title: "Failed to load plans", type: "error" });
      console.error("report overview fetch failed:", error);
    },
  } as UseQueryOptions<{ data: Plan[] }, Error>);
};

export const useGeAnalyticsChange = (
  date_range: string,
  companyId: string,
  enabled: boolean,
  google_ads_config_id: string,
  lsa_config_id: string,
  paramString: string
) => {
  return useQuery({
    queryKey: ["analayticsChange", date_range, companyId],
    queryFn: () =>
      api.get(
        `${API_BASE_URL}/api/v1/analytics/${companyId}/comparison?${paramString}`,
        {
          params: {
            date_range,
            google_ads_config_id,
            lsa_config_id,
          },
        }
      ),
    enabled,
    onError: (error: Error) => {
      showToast({ title: "Failed to load plans", type: "error" });
      console.error("report overview fetch failed:", error);
    },
  } as UseQueryOptions<{ data: DashboardChangeData }, Error>);
};

export const useGetSingleCompanyDetail = (companyId: string) => {
  return useQuery({
    queryKey: ["companyDetail", companyId],
    queryFn: () => api.get(`${API_BASE_URL}/api/v1/companies/${companyId}`),

    onError: (error: Error) => {
      showToast({ title: "Failed to load plans", type: "error" });
      console.error("report overview fetch failed:", error);
    },
  } as UseQueryOptions<{ data: CompanyDetails }, Error>);
};

export const useGetTopPerformer = (date_range: string, companyId: string) => {
  return useQuery({
    queryKey: ["topPerformer", date_range, companyId],
    queryFn: () =>
      api.get(
        `${API_BASE_URL}/api/v1/analytics/${companyId}/top-performing-channels?date_range=${date_range}`
      ),

    onError: (error: Error) => {
      showToast({ title: "Failed to load plans", type: "error" });
      console.error("report overview fetch failed:", error);
    },
  } as UseQueryOptions<{ data: { channel: string; revenue: number } }, Error>);
};

interface CompanyResponse {
  industry: string;
  company_size: string;
  website: string;
  id: string;
  name: string;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}
export const useCreateCompanyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CompanyResponse,
    Error,
    CompanyInfoForm & { selectedPlan: string }
  >({
    mutationFn: async ({
      companyName,
      companySize,
      industry,
      selectedPlan,
      websiteUrl,
      stripe_token,
      billing_cycle,
    }) => {
      const response = await api.post<CompanyResponse>(
        `${API_BASE_URL}/api/v1/companies/register`,
        {
          name: companyName,
          website: websiteUrl,
          subscription_plan_id: selectedPlan,
          industry,
          company_size: companySize,
          stripe_token,
          billing_cycle,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companyDetails"] });
    },
  });
};
export const useUpdateCompanyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CompanyResponse,
    Error,
    CompanyInfoForm & { selectedPlan?: string }
  >({
    mutationFn: async ({
      comapanyId,
      companyName,
      companySize,
      industry,
      selectedPlan,
      websiteUrl,
    }) => {
      const response = await api.put<CompanyResponse>(
        `${API_BASE_URL}/api/v1/companies/${comapanyId}/update`,
        {
          name: companyName,
          website: websiteUrl,
          industry,
          company_size: companySize,
          subscription_plan_id: selectedPlan,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companyDetails"] });
    },
  });
};
