import { useAuth } from "@/store/AuthContext";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from "./api.service";
import { fmt } from "./activity.api";

// Interface for location action data
export interface ILocationAction {
  location_id: string;
  website_clicks: number;
  messages: number;
  directions: number;
  phone_calls: number;
  bookings: number;
  leads: number;
  deals: number;
  total_interactions: number;
  date_range: {
    start_date: string;
    end_date: string;
  };
}

// Interface for aggregated data
export interface IAggregatedData {
  total_actions: number;
  total_calls: number;
  total_website_clicks: number;
  total_direction_requests: number;
  total_messages: number;
  total_bookings: number;
  leads: number;
  deals: number;
}

// Interface for date range
export interface IDateRange {
  start_date: string;
  end_date: string;
}

// Interface for Google Business Profile locations actions response
export interface IGBPLocationsActionsResponse {
  locations: {
    [locationId: string]: ILocationAction;
  };
  aggregated: IAggregatedData;
  date_range: IDateRange;
  total_locations: number;
}

// Interface for request body
export interface IGBPLocationsActionsRequest {
  location_ids: string[];
  integration_config_id: string;
}
export interface IGBPMetricChange {
  change_pct: number;
  series10: number[];
}
export interface IGBPLocationsAnalyticsRequest {
  location_ids: string[];
  integration_config_id: string;
  website_clicks: number;
  messages: number;
  directions: number;
  phone_calls: number;
  bookings: number;
  total_interactions: number;
}
export interface IGBPAnalyticsAggregated {
  website_clicks: IGBPMetricChange;
  messages: IGBPMetricChange;
  directions: IGBPMetricChange;
  phone_calls: IGBPMetricChange;
  bookings: IGBPMetricChange;
  total_interactions: IGBPMetricChange;
  leads: IGBPMetricChange;
  deals: IGBPMetricChange;
}
export interface IGBPLocationsAnalyticsLocations {
  [locationId: string]: {
    website_clicks: IGBPMetricChange;
    messages: IGBPMetricChange;
    directions: IGBPMetricChange;
    phone_calls: IGBPMetricChange;
    bookings: IGBPMetricChange;
    leads: IGBPMetricChange;
    total_interactions: IGBPMetricChange;
  };
}
export interface IGBPAnalyticsMetaPeriod {
  start: string;
  end: string;
}

export interface IGBPAnalyticsMeta {
  current_period: IGBPAnalyticsMetaPeriod;
  previous_period: IGBPAnalyticsMetaPeriod;
}
export interface IGBPLocationsAnalyticsResponse {
  locations: IGBPLocationsAnalyticsLocations;
  aggregated: IGBPAnalyticsAggregated;
  date_range: IDateRange;
  total_locations: number;
  meta: IGBPAnalyticsMeta;
}

export interface IGBPAnalyticsMetricsResponse {
items: {
    month: string;
  traffic: number;
  leads: number;
  sales: number;
  deals: number;
  revenue: number;
}[]
}

export const getGBPLocationsActions = async (
  companyId: string,
  dateRange: string,
  requestBody: IGBPLocationsActionsRequest
): Promise<IGBPLocationsActionsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("date_range", fmt(dateRange));
    params.append("company_id", companyId);

    const response = await api.post<IGBPLocationsActionsResponse>(
      `/v1/gbp/locations/actions?${params.toString()}`,
      requestBody
    );
    return response.data;
  } catch (error) {
    console.error("GBP locations actions fetch failed:", error);
    throw error;
  }
};

export const getGBPLocationsAnalytics = async (
  companyId: string,
  dateRange: string,
  requestBody: IGBPLocationsAnalyticsRequest
): Promise<IGBPLocationsAnalyticsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("date_range", fmt(dateRange));
    params.append("company_id", companyId);

    const response = await api.post<IGBPLocationsActionsResponse>(
      `/v1/gbp/locations/actions/analytics?${params.toString()}`,
      requestBody
    );
    console.log("GBP locations analytics response:", response.data);
    return response.data as unknown as IGBPLocationsAnalyticsResponse;
  } catch (error) {
    console.error("GBP locations actions fetch failed:", error);
    throw error;
  }
};

export const getGBPAnalyticsMetrics = async (
  companyId: string,
  dateRange: string,
  requestBody: IGBPLocationsActionsRequest
): Promise<IGBPAnalyticsMetricsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("date_range", fmt(dateRange));
    params.append("company_id", companyId);

    const response = await api.post<IGBPAnalyticsMetricsResponse>(
      `/v1/gbp/locations/monthly-metrics?${params.toString()}`,
      requestBody
    );
    console.log("GBP metrics response:", response.data);
    return response.data as unknown as IGBPAnalyticsMetricsResponse;
  } catch (error) {
    console.error("GBP metrics fetch failed:", error);
    throw error;
  }
};

export const useGBPLocationsActions = (
  companyId: string | undefined,
  dateRange: string,
  integrationConfigId: string | null,
  locationIds: string[],
  enabled: boolean = true
) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [
      "gbpLocationsActions",
      companyId,
      dateRange,
      integrationConfigId,
      locationIds,
    ],
    queryFn: () => {
      if (!integrationConfigId || !locationIds.length) {
        throw new Error("Missing required parameters");
      }
      return getGBPLocationsActions(companyId!, dateRange, {
        location_ids: locationIds,
        integration_config_id: integrationConfigId,
      });
    },
    enabled:
      enabled &&
      !!companyId &&
      !!dateRange &&
      !!integrationConfigId &&
      locationIds.length > 0 &&
      isAuthenticated,
    onSuccess: (data: IGBPLocationsActionsResponse) => {
      console.log("GBP locations actions data:", data);
    },
    onError: (error: Error) => {
      console.error("GBP locations actions fetch failed:", error);
    },
  } as UseQueryOptions<IGBPLocationsActionsResponse, Error>);
};

export const useGBPAnalyticsMetrics = (
  companyId: string | undefined,
  dateRange: string,
  integrationConfigId: string | null,
  locationIds: string[],
  enabled: boolean = true
) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [
      "gbpAnalyticsMetrics",
      companyId,
      dateRange,
      integrationConfigId,
      locationIds,
    ],
    queryFn: () => {
      if (!integrationConfigId || !locationIds.length) {
        throw new Error("Missing required parameters");
      }
      return getGBPAnalyticsMetrics(companyId!, dateRange, {
        location_ids: locationIds,
        integration_config_id: integrationConfigId,
      });
    },
    enabled:
      enabled &&
      !!companyId &&
      !!dateRange &&
      !!integrationConfigId &&
      locationIds.length > 0 &&
      isAuthenticated,
    onSuccess: (data: IGBPAnalyticsMetricsResponse) => {
      console.log("GBP locations actions data:", data);
    },
    onError: (error: Error) => {
      console.error("GBP locations actions fetch failed:", error);
    },
  } as UseQueryOptions<IGBPAnalyticsMetricsResponse, Error>);
};

export const useGBPLocationsActionsAnalytics = (
  companyId: string | undefined,
  dateRange: string,
  integrationConfigId: string | null,
  locationIds: string[],
  enabled: boolean = true,
  stats: {
    website_clicks: number;
    messages: number;
    directions: number;
    phone_calls: number;
    bookings: number;
    total_interactions: number;
    leads: number;
    deals: number;
  },
  selectedAddress?: boolean
) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [
      selectedAddress
        ? "singlegbpLocationsActionsAnalytics"
        : "gbpLocationsActionsAnalytics",
      companyId,
      dateRange,
      integrationConfigId,
      locationIds,
    ],
    queryFn: () => {
      if (!integrationConfigId || !locationIds.length) {
        throw new Error("Missing required parameters");
      }
      return getGBPLocationsAnalytics(companyId!, dateRange, {
        location_ids: locationIds,
        integration_config_id: integrationConfigId,
        ...stats,
      });
    },
    enabled:
      enabled &&
      !!companyId &&
      !!dateRange &&
      !!integrationConfigId &&
      locationIds.length > 0 &&
      isAuthenticated,
    onSuccess: (data: IGBPLocationsAnalyticsResponse) => {
      console.log("GBP locations actions data:", data);
    },
    onError: (error: Error) => {
      console.error("GBP locations actions fetch failed:", error);
    },
  } as UseQueryOptions<IGBPLocationsAnalyticsResponse, Error>);
};
