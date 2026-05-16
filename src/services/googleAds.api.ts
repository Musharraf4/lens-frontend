import { useAuth } from "@/store/AuthContext";
import { useQueries, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { fmt } from "./activity.api";
import api from "./api.service";

// Interface for ad data
export interface IAd {
  id: number;
  name: string;
  type: string;
  headline: string;
  description: string;
  status: string;
  clicks: number;
  impressions: number;
  conversions: number;
}

export interface IAdsCustomer {
  customer_id: string;
  ads: IAd[];
}

export interface IAdsResponse {
  ads: IAdsCustomer[];
}

// Interface for dashboard overview response

export interface IDashboardOverviewValues {
  change_pct: number;
  series10: number[];
  value: number;
}

export interface IDashboardOverview {
  revenue: IDashboardOverviewValues;
  ad_spend: IDashboardOverviewValues;
  deals: IDashboardOverviewValues;
  leads: IDashboardOverviewValues;
  roas: IDashboardOverviewValues;
  avg_cpc: IDashboardOverviewValues;
  ctr: IDashboardOverviewValues;
  cpc: IDashboardOverviewValues;
  cpa: IDashboardOverviewValues;
  clicks: IDashboardOverviewValues;
  impressions: IDashboardOverviewValues;
  conversion_rate: IDashboardOverviewValues;
  conversion_rate_deal: IDashboardOverviewValues;
  conversion_rate_deals: IDashboardOverviewValues;
  conversion_rate_lead: IDashboardOverviewValues;
  cpa_deal: IDashboardOverviewValues;
  cpa_deals: IDashboardOverviewValues;
  cpa_lead: IDashboardOverviewValues;
  cpa_leads: IDashboardOverviewValues;
}

export interface IDashboardOverviewCustomer {
  customer_id: string;
  overview: IDashboardOverview;
}

export interface IDashboardOverviewResponse {
  results: IDashboardOverviewCustomer[];
}

export interface IDashboardChangesResponse {
  customer_id: string;
  analytics: IDashboardOverview;
}

// Interface for campaign data
export interface ICampaign {
  id: number;
  name: string;
  status: string;
  channel: string;
  start_date: string;
  end_date: string;
  impressions: number;
  clicks: number;
  leads: number;
  ad_spend: number;
  revenue: number;
  cpl: number | null;
  cpc: number | null;
  roas: number | null;
  roi: number | null;
}

export interface ICampaignsCustomer {
  customer_id: string;
  campaigns: ICampaign[];
}

export interface ICampaignsResponse {
  campaigns: ICampaignsCustomer[];
}

// Interface for customer IDs response
export interface ICustomerIdsResponse {
  [managerId: string]: {
    name: string;
    customer_id: string;
  }[];
}

// Interface for lowest campaigns response
export interface ILowestCampaign {
  id: number;
  name: string;
  leads: number;
  revenue: number;
  roi: number | null;
}

export interface ILowestCampaignsCustomer {
  customer_id: string;
  campaigns: ILowestCampaign[];
}

export interface ILowestCampaignsResponse {
  results: ILowestCampaignsCustomer[];
}

// Interface for zip code data
export interface IZipCode {
  zip_code: string;
  country: string;
  revenue: number;
  leads: number;
  roi: number;
}

export interface IZipCodesCustomer {
  customer_id: string;
  zip_codes: IZipCode[];
}

export interface IZipCodesResponse {
  results: IZipCodesCustomer[];
}

// Interface for keyword data
export interface IKeyword {
  keyword: string;
  revenue: number;
  leads: number;
  roi: number | null;
}

export interface IKeywordsCustomer {
  customer_id: string;
  keywords: IKeyword[];
}

export interface ITopKeywordsResponse {
  results: IKeywordsCustomer[];
}

export interface ILowestKeywordsResponse {
  results: IKeywordsCustomer[];
}

// Interface for campaign performance data
export interface ICampaignPerformance {
  id: number;
  name: string;
  revenue: number;
  ad_spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  cpl: number | null;
  roi: number | null;
  cpc: number | null;
}

export interface ICampaignPerformanceCustomer {
  customer_id: string;
  performance: ICampaignPerformance[];
}

export interface ICampaignPerformanceResponse {
  results: ICampaignPerformanceCustomer[];
}

// Interface for day of week performance data
export interface IDayPerformance {
  day: string;
  impr: number;
  clicks: number;
  leads: number;
  cost: number;
  revenue: number;
  roas: number;
  cpl: number;
  roi: number;
}

export interface IDayOfWeekCustomer {
  customer_id: string;
  days: IDayPerformance[];
}

export interface IDayOfWeekResponse {
  results: IDayOfWeekCustomer[];
}

// Interface for hour performance data
export interface IHourPerformance {
  day: string;
  hours: {
    hour: number;
    impr: number;
    clicks: number;
    leads: number;
    cost: number;
    revenue: number;
    roas: number;
    cpl: number;
  }[];
}

export interface IDayHourPerformance {
  day: string;
  hours: IHourPerformance[];
}

export interface IHourOfDayCustomer {
  customer_id: string;
  hours: IHourPerformance[];
}

export interface IHourOfDayResponse {
  results: IHourOfDayCustomer[];
}

// Interface for device performance data
export interface IDevicePerformance {
  device: string;
  impr: number;
  clicks: number;
  leads: number;
  cost: number;
  revenue: number;
  roas: number;
  cpl: number;
  roi: number | null;
}

export interface IDevicePerformanceCustomer {
  customer_id: string;
  performance: IDevicePerformance[];
}

export interface IDevicePerformanceResponse {
  results: IDevicePerformanceCustomer[];
}

// Interface for network performance data
export interface INetworkPerformance {
  network: string;
  impr: number;
  clicks: number;
  leads: number;
  cost: number;
  revenue: number;
  roas: number;
  cpl: number;
  roi: number;
}

export interface INetworkPerformanceCustomer {
  customer_id: string;
  performance: INetworkPerformance[];
}

export interface INetworkPerformanceResponse {
  results: INetworkPerformanceCustomer[];
}

// Interface for match type performance data
export interface IMatchTypePerformance {
  match_type: string;
  keyword: string;
  impr: number;
  clicks: number;
  leads: number;
  revenue: number;
  roi: number | null;
  cpl: number;
  roas: number;
}

export interface IMatchTypePerformanceCustomer {
  customer_id: string;
  match_types: IMatchTypePerformance[];
}

export interface IMatchTypePerformanceResponse {
  results: IMatchTypePerformanceCustomer[];
}

// Interface for extension performance data
export interface IExtensionPerformance {
  extension: string;
  impr: number;
  clicks: number;
  leads: number;
  cost: number;
  revenue: number;
  roas: number;
  cpl: number;
  roi: number | null;
}

export interface IExtensionPerformanceCustomer {
  customer_id: string;
  extensions: IExtensionPerformance[];
}

export interface IExtensionPerformanceResponse {
  results: IExtensionPerformanceCustomer[];
}

// Interface for zip code performance data
export interface IZipCodePerformance {
  zip_code: string;
  country: string;
  impr: number;
  clicks: number;
  cost: number;
  leads: number;
  revenue: number;
  roas: number | null;
}

export interface IZipCodePerformanceCustomer {
  customer_id: string;
  zip_codes: IZipCodePerformance[];
}

export interface IZipCodePerformanceResponse {
  results: IZipCodePerformanceCustomer[];
}

// Interface for region performance data
export interface IRegionPerformance {
  region: string;
  country: string;
  impr: number;
  clicks: number;
  cost: number;
  leads: number;
  revenue: number;
  roas: number;
  cpl: number;
}

export interface IRegionPerformanceCustomer {
  customer_id: string;
  performance: IRegionPerformance[];
}

export interface IRegionPerformanceResponse {
  results: IRegionPerformanceCustomer[];
}

// Interface for callout performance data
export interface ICalloutPerformance {
  callout: string;
  country: string;
  impr: number;
  clicks: number;
  cost: number;
  leads: number;
  revenue: number;
  roas: number;
  cpl: number;
}

export interface ICalloutPerformanceCustomer {
  customer_id: string;
  extensions: ICalloutPerformance[];
}

export interface ICalloutPerformanceResponse {
  results: ICalloutPerformanceCustomer[];
}

// Interface for negative keywords insights data
export interface INegativeKeywordInsight {
  search_term: string;
  impressions: number;
  clicks: number;
  cost: number;
  leads: number;
  deals: number;
  revenue: number;
  roas: number;
}

export interface INegativeKeywordsCustomer {
  customer_id: string;
  insights: INegativeKeywordInsight[];
}

export interface INegativeKeywordsResponse {
  results: INegativeKeywordsCustomer[];
}
export interface GAdsSingleImage {
  asset: string;
  clicks: number;
  cost: number;
  cpl: number;
  impr: number;
  leads: number;
  revenue: number;
  roas: number;
  url: string;
}
export interface GAdsImages {
  campaign_id: number;
  campaign_name: string;
  images: GAdsSingleImage[];
}

export interface IGAdsImagesCustomer {
  customer_id: string;
  performance: GAdsImages[];
}

export interface IGAdsImagesResponse {
  results: IGAdsImagesCustomer[];
}

// Competitors Types
export interface ICompetitorsInsights {
  change_pct: number;
  series10: number[];
  value: number;
}

export interface ICompetitors {
  customer_id: string;
  insights: {
    abs_top_of_page_rate: ICompetitorsInsights;
    impression_share: ICompetitorsInsights;
    top_of_page_rate: ICompetitorsInsights;
  };
}

export interface ICompetitorsResponse {
  results: ICompetitors[];
}

// Competitors table Types
export interface ICompetitorsTableRow {
  abs_top_of_page_rate: number;
  abs_top_of_page_rate_change_pct: number;
  domain: string;
  impression_share: number;
  impression_share_change_pct: number;
  outranking_share: number | null;
  outranking_share_change_pct: number;
  overlap_rate: number | null;
  overlap_rate_change_pct: number;
  position_above_rate: number | null;
  position_above_rate_change_pct: number;
  top_of_page_rate: number;
  top_of_page_rate_change_pct: number;
}

export interface ICompetitorsTable {
  customer_id: string;
  insights: {
    available: boolean;
    level: string;
    rows: ICompetitorsTableRow[];
  };
}

export interface ICompetitorsTableResponse {
  results: ICompetitorsTable[];
}
// --- API Functions ---

// Get Customer IDs
export const getCustomerIds = async (
  configId: string
): Promise<ICustomerIdsResponse> => {
  try {
    const response = await api.get(`/v1/google-ads/${configId}/customer_ids`);
    return response.data;
  } catch (error) {
    console.error("Customer IDs fetch failed:", error);
    throw error;
  }
};

// Get Ads
export const getAds = async (
  configId: string,
  dateRange?: string
): Promise<IAdsResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(`/v1/google-ads/${configId}/adds`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Ads fetch failed:", error);
    throw error;
  }
};

// Get Campaigns
export const getCampaigns = async (
  configId: string,
  dateRange?: string
): Promise<ICampaignsResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/revenue-by-campaigns`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Campaigns fetch failed:", error);
    throw error;
  }
};

// Dashboard overview endpoint
export const getDashboardOverview = async (
  configId: string,
  dateRange?: string
): Promise<IDashboardOverviewResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/dashboard/overview`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Dashboard overview fetch failed:", error);
    throw error;
  }
};

// Dashboard Change Overview endpoint
export const getDashboardChangeOverview = async (
  configId: string,
  dateRange?: string,
  paramString?: string
): Promise<IDashboardChangesResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/dashboard/overview/analytics?${paramString}`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Dashboard overview fetch failed:", error);
    throw error;
  }
};

// Lowest campaigns endpoint
export const getLowestCampaigns = async (
  configId: string,
  dateRange?: string,
  metric?: string,
  limit?: number
): Promise<ILowestCampaignsResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);
    if (metric) params.append("metric", metric);
    if (limit) params.append("limit", limit.toString());

    const response = await api.get(
      `/v1/google-ads/${configId}/dashboard/lowest-campaigns`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lowest campaigns fetch failed:", error);
    throw error;
  }
};

// Top zip codes endpoint
export const getTopZipCodes = async (
  configId: string,
  dateRange?: string,
  limit?: number
): Promise<IZipCodesResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);
    if (limit) params.append("limit", limit.toString());

    const response = await api.get(
      `/v1/google-ads/${configId}/dashboard/top-zip-codes`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Top zip codes fetch failed:", error);
    throw error;
  }
};

// Top keywords endpoint
export const getTopKeywords = async (
  configId: string,
  dateRange?: string,
  limit?: number
): Promise<ITopKeywordsResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);
    if (limit) params.append("limit", limit.toString());

    const response = await api.get(
      `/v1/google-ads/${configId}/dashboard/top-keywords`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Top keywords fetch failed:", error);
    throw error;
  }
};

// Lowest keywords endpoint
export const getLowestKeywords = async (
  configId: string,
  dateRange?: string,
  limit?: number
): Promise<ILowestKeywordsResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);
    if (limit) params.append("limit", limit.toString());

    const response = await api.get(
      `/v1/google-ads/${configId}/dashboard/lowest-keywords`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lowest keywords fetch failed:", error);
    throw error;
  }
};

// Campaign performance endpoint
export const getCampaignPerformance = async (
  configId: string,
  dateRange?: string
): Promise<ICampaignPerformanceResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/dashboard/campaign-performance`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Campaign performance fetch failed:", error);
    throw error;
  }
};

// Day of week performance endpoint
export const getDayOfWeekPerformance = async (
  configId: string,
  dateRange?: string
): Promise<IDayOfWeekResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/temporal/day-of-week`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Day of week performance fetch failed:", error);
    throw error;
  }
};

// Hour of day performance endpoint
export const getHourOfDayPerformance = async (
  configId: string,
  dateRange?: string
): Promise<IHourOfDayResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/temporal/hour-of-day`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Hour of day performance fetch failed:", error);
    throw error;
  }
};

// Device performance endpoint
export const getDevicePerformance = async (
  configId: string,
  dateRange?: string
): Promise<IDevicePerformanceResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/device/performance`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Device performance fetch failed:", error);
    throw error;
  }
};

// Network performance endpoint
export const getNetworkPerformance = async (
  configId: string,
  dateRange?: string
): Promise<INetworkPerformanceResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/network/performance`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Network performance fetch failed:", error);
    throw error;
  }
};

// Match type performance endpoint
export const getMatchTypePerformance = async (
  configId: string,
  dateRange?: string
): Promise<IMatchTypePerformanceResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/match-types/performance`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Match type performance fetch failed:", error);
    throw error;
  }
};

// Extensions performance endpoint
export const getExtensionsPerformance = async (
  configId: string,
  dateRange?: string
): Promise<IExtensionPerformanceResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/extensions/performance`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Extensions performance fetch failed:", error);
    throw error;
  }
};

// Zip codes performance endpoint
export const getZipCodesPerformance = async (
  configId: string,
  dateRange?: string
): Promise<IZipCodePerformanceResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/zip-codes/performance`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Zip codes performance fetch failed:", error);
    throw error;
  }
};

// Region performance endpoint
export const getRegionPerformance = async (
  configId: string,
  dateRange?: string
): Promise<IRegionPerformanceResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/region/performance`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Region performance fetch failed:", error);
    throw error;
  }
};

// Callouts performance endpoint
export const getCalloutsPerformance = async (
  configId: string,
  dateRange?: string
): Promise<ICalloutPerformanceResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/callouts/performance`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Callouts performance fetch failed:", error);
    throw error;
  }
};

// Negative keywords insights endpoint
export const getNegativeKeywordsInsights = async (
  configId: string,
  dateRange?: string
): Promise<INegativeKeywordsResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/insights/negative-keywords`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Negative keywords insights fetch failed:", error);
    throw error;
  }
};

// Negative keywords insights endpoint
export const getTopCompetitorsInsights = async (
  configId: string,
  dateRange?: string
): Promise<INegativeKeywordsResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/insights/top-competitors`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Top competitors insights fetch failed:", error);
    throw error;
  }
};

// Ads Images endpoint
export const getGAdsImages = async (
  configId: string,
  dateRange?: string
): Promise<IGAdsImagesResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/images/performance`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("GADS images fetch failed:", error);
    throw error;
  }
};

// Competitors endpoint
export const getCompetitorsValues = async (
  configId: string,
  dateRange?: string
): Promise<ICompetitorsResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/competitors/position`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Competitors fetch failed:", error);
    throw error;
  }
};
export const getCompetitorsTable = async (
  configId: string,
  dateRange?: string
): Promise<ICompetitorsTableResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateRange) params.append("date_range", dateRange);

    const response = await api.get(
      `/v1/google-ads/${configId}/competitors/table`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Competitors fetch failed:", error);
    throw error;
  }
};

// --- TanStack Query Hooks ---

// Hook for customer IDs
export const useCustomerIdsForAll = (configIds: string[]) => {
  return useQueries({
    queries: configIds.map((configId) => ({
      queryKey: ["googleAdsCustomerIds", configId],
      queryFn: () => getCustomerIds(configId),
      retry: false,
      enabled: !!configId,
    })),
  });
};

// Hook for ads
export const useAds = (configId: string, dateRange?: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsAds", configId, dateRange],
    queryFn: () => getAds(configId, dateRange),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: IAdsResponse) => {
      console.log("Ads data:", data);
    },
    onError: (error: Error) => {
      console.error("Ads fetch failed:", error);
    },
  } as UseQueryOptions<IAdsResponse, Error>);
};

// Hook for campaigns
export const useCampaigns = (configId: string, dateRange: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsCampaigns", configId, dateRange],
    queryFn: () => getCampaigns(configId, fmt(dateRange)),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: ICampaignsResponse) => {
      console.log("Campaigns data:", data);
    },
    onError: (error: Error) => {
      console.error("Campaigns fetch failed:", error);
    },
  } as UseQueryOptions<ICampaignsResponse, Error>);
};

// Hook for dashboard overview
export const useDashboardOverview = (configId: string, dateRange: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsDashboardOverview", configId, dateRange],
    queryFn: () => getDashboardOverview(configId, fmt(dateRange)),
    enabled: !!configId && isAuthenticated,
    staleTime: 60000,
    onSuccess: (data: IDashboardOverviewResponse) => {
      console.log("Dashboard overview data:", data);
    },
    onError: (error: Error) => {
      console.error("Dashboard overview fetch failed:", error);
    },
  } as UseQueryOptions<IDashboardOverviewResponse, Error>);
};

export const useDashboardChangeOverview = (
  configId: string,
  dateRange: string,
  paramString?: string
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [
      "googleAdsDashboardChangeOverview",
      configId,
      dateRange,
      paramString,
    ],
    queryFn: () =>
      getDashboardChangeOverview(configId, fmt(dateRange), paramString),
    enabled: !!configId && isAuthenticated,
    staleTime: 60000,
    onSuccess: (data: IDashboardChangesResponse) => {
      console.log("Dashboard change overview data:", data);
    },
    onError: (error: Error) => {
      console.error("Dashboard change overview fetch failed:", error);
    },
  } as UseQueryOptions<IDashboardChangesResponse, Error>);
};

// Hook for lowest campaigns
export const useLowestCampaigns = (
  configId: string,
  dateRange: string,
  metric?: string,
  limit?: number
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsLowestCampaigns", configId, dateRange, metric, limit],
    queryFn: () => getLowestCampaigns(configId, fmt(dateRange), metric, limit),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: ILowestCampaignsResponse) => {
      console.log("Lowest campaigns data:", data);
    },
    onError: (error: Error) => {
      console.error("Lowest campaigns fetch failed:", error);
    },
  } as UseQueryOptions<ILowestCampaignsResponse, Error>);
};

// Hook for top zip codes
export const useTopZipCodes = (
  configId: string,
  dateRange: string,
  limit?: number
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsTopZipCodes", configId, dateRange, limit],
    queryFn: () => getTopZipCodes(configId, fmt(dateRange), limit),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: IZipCodesResponse) => {
      console.log("Top zip codes data:", data);
    },
    onError: (error: Error) => {
      console.error("Top zip codes fetch failed:", error);
    },
  } as UseQueryOptions<IZipCodesResponse, Error>);
};

// Hook for top keywords
export const useTopKeywords = (
  configId: string,
  dateRange: string,
  limit?: number
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsTopKeywords", configId, dateRange, limit],
    queryFn: () => getTopKeywords(configId, fmt(dateRange), limit),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: ITopKeywordsResponse) => {
      console.log("Top keywords data:", data);
    },
    onError: (error: Error) => {
      console.error("Top keywords fetch failed:", error);
    },
  } as UseQueryOptions<ITopKeywordsResponse, Error>);
};

// Hook for lowest keywords
export const useLowestKeywords = (
  configId: string,
  dateRange: string,
  limit?: number
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsLowestKeywords", configId, dateRange, limit],
    queryFn: () => getLowestKeywords(configId, fmt(dateRange), limit),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: ILowestKeywordsResponse) => {
      console.log("Lowest keywords data:", data);
    },
    onError: (error: Error) => {
      console.error("Lowest keywords fetch failed:", error);
    },
  } as UseQueryOptions<ILowestKeywordsResponse, Error>);
};

// Hook for campaign performance
export const useCampaignPerformance = (
  configId: string,
  dateRange?: string
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsCampaignPerformance", configId, dateRange],
    queryFn: () => getCampaignPerformance(configId, dateRange),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: ICampaignPerformanceResponse) => {
      console.log("Campaign performance data:", data);
    },
    onError: (error: Error) => {
      console.error("Campaign performance fetch failed:", error);
    },
  } as UseQueryOptions<ICampaignPerformanceResponse, Error>);
};

// Hook for day of week performance
export const useDayOfWeekPerformance = (
  configId: string,
  dateRange?: string
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsDayOfWeekPerformance", configId, dateRange],
    queryFn: () => getDayOfWeekPerformance(configId, dateRange),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: IDayOfWeekResponse) => {
      console.log("Day of week performance data:", data);
    },
    onError: (error: Error) => {
      console.error("Day of week performance fetch failed:", error);
    },
  } as UseQueryOptions<IDayOfWeekResponse, Error>);
};

// Hook for hour of day performance
export const useHourOfDayPerformance = (
  configId: string,
  dateRange?: string
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsHourOfDayPerformance", configId, dateRange],
    queryFn: () => getHourOfDayPerformance(configId, dateRange),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: IHourOfDayResponse) => {
      console.log("Hour of day performance data:", data);
    },
    onError: (error: Error) => {
      console.error("Hour of day performance fetch failed:", error);
    },
  } as UseQueryOptions<IHourOfDayResponse, Error>);
};

// Hook for device performance
export const useDevicePerformance = (configId: string, dateRange?: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsDevicePerformance", configId, dateRange],
    queryFn: () => getDevicePerformance(configId, dateRange),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: IDevicePerformanceResponse) => {
      console.log("Device performance data:", data);
    },
    onError: (error: Error) => {
      console.error("Device performance fetch failed:", error);
    },
  } as UseQueryOptions<IDevicePerformanceResponse, Error>);
};

// Hook for network performance
export const useNetworkPerformance = (configId: string, dateRange?: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsNetworkPerformance", configId, dateRange],
    queryFn: () => getNetworkPerformance(configId, dateRange),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: INetworkPerformanceResponse) => {
      console.log("Network performance data:", data);
    },
    onError: (error: Error) => {
      console.error("Network performance fetch failed:", error);
    },
  } as UseQueryOptions<INetworkPerformanceResponse, Error>);
};

// Hook for match type performance
export const useMatchTypePerformance = (
  configId: string,
  dateRange?: string
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsMatchTypePerformance", configId, dateRange],
    queryFn: () => getMatchTypePerformance(configId, dateRange),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: IMatchTypePerformanceResponse) => {
      console.log("Match type performance data:", data);
    },
    onError: (error: Error) => {
      console.error("Match type performance fetch failed:", error);
    },
  } as UseQueryOptions<IMatchTypePerformanceResponse, Error>);
};

// Hook for extensions performance
export const useExtensionsPerformance = (
  configId: string,
  dateRange: string
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsExtensionsPerformance", configId, dateRange],
    queryFn: () => getExtensionsPerformance(configId, fmt(dateRange)),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: IExtensionPerformanceResponse) => {
      console.log("Extensions performance data:", data);
    },
    onError: (error: Error) => {
      console.error("Extensions performance fetch failed:", error);
    },
  } as UseQueryOptions<IExtensionPerformanceResponse, Error>);
};

// Hook for Callout performance
export const useCalloutsPerformance = (configId: string, dateRange: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsCalloutsPerformance", configId, dateRange],
    queryFn: () => getCalloutsPerformance(configId, fmt(dateRange)),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: ICalloutPerformanceResponse) => {
      console.log("Callouts performance data:", data);
    },
    onError: (error: Error) => {
      console.error("Callouts performance fetch failed:", error);
    },
  } as UseQueryOptions<ICalloutPerformanceResponse, Error>);
};

// Hook for zip codes performance
export const useZipCodesPerformance = (configId: string, dateRange: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsZipCodesPerformance", configId, dateRange],
    queryFn: () => getZipCodesPerformance(configId, fmt(dateRange)),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: IZipCodePerformanceResponse) => {
      console.log("Zip codes performance data:", data);
    },
    onError: (error: Error) => {
      console.error("Zip codes performance fetch failed:", error);
    },
  } as UseQueryOptions<IZipCodePerformanceResponse, Error>);
};

// Hook for region performance
export const useRegionPerformance = (configId: string, dateRange?: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsRegionPerformance", configId, dateRange],
    queryFn: () =>
      getRegionPerformance(configId, dateRange ? fmt(dateRange) : undefined),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: IRegionPerformanceResponse) => {
      console.log("Region performance data:", data);
    },
    onError: (error: Error) => {
      console.error("Region performance fetch failed:", error);
    },
  } as UseQueryOptions<IRegionPerformanceResponse, Error>);
};

// Hook for negative keywords insights
export const useNegativeKeywordsInsights = (
  configId: string,
  dateRange?: string
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsNegativeKeywordsInsights", configId, dateRange],
    queryFn: () => getNegativeKeywordsInsights(configId, dateRange),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: INegativeKeywordsResponse) => {
      console.log("Negative keywords insights data:", data);
    },
    onError: (error: Error) => {
      console.error("Negative keywords insights fetch failed:", error);
    },
  } as UseQueryOptions<INegativeKeywordsResponse, Error>);
};

// Hook for top competitors insights
export const useTopCompetitorsInsights = (
  configId: string,
  dateRange?: string
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsTopCompetitorsInsights", configId, dateRange],
    queryFn: () => getTopCompetitorsInsights(configId, dateRange),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: INegativeKeywordsResponse) => {
      console.log("Top competitors insights data:", data);
    },
    onError: (error: Error) => {
      console.error("Top competitors insights fetch failed:", error);
    },
  } as UseQueryOptions<INegativeKeywordsResponse, Error>);
};

export const usegetGAdsImages = (configId: string, dateRange?: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsImages", configId, dateRange],
    queryFn: () => getGAdsImages(configId, dateRange),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: IGAdsImagesResponse) => {
      console.log("Google Ads images data:", data);
    },
    onError: (error: Error) => {
      console.error("Google Ads images fetch failed:", error);
    },
  } as UseQueryOptions<IGAdsImagesResponse, Error>);
};

export const usegetCompetitorsValues = (
  configId: string,
  dateRange?: string
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsCompetitors", configId, dateRange],
    queryFn: () => getCompetitorsValues(configId, dateRange),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: ICompetitorsResponse) => {
      console.log("Google Ads competitors data:", data);
    },
    onError: (error: Error) => {
      console.error("Google Ads competitors fetch failed:", error);
    },
  } as UseQueryOptions<ICompetitorsResponse, Error>);
};

export const usegetCompetitorsTable = (
  configId: string,
  dateRange?: string
) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["googleAdsCompetitorsTable", configId, dateRange],
    queryFn: () => getCompetitorsTable(configId, dateRange),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: ICompetitorsTableResponse) => {
      console.log("Google Ads competitors data:", data);
    },
    onError: (error: Error) => {
      console.error("Google Ads competitors fetch failed:", error);
    },
  } as UseQueryOptions<ICompetitorsTableResponse, Error>);
};
