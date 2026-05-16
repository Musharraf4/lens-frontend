import {
  useQuery,
  UseQueryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import api from "./api.service";
import { IOrganicRow } from "@/app/(protected)/acquisition/landing-pages/page";
import { CompanyIdParam, Metric } from "@/types";

export interface IOrganicReportResponse {
  items: IOrganicRow[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface IGetOrganicParams {
  page?: number;
  size?: number;
  channel?: string;
  revenue_min?: number;
  revenue_max?: number;
  rps_min?: number;
  rps_max?: number;
  conv_min?: number;
  conv_max?: number;
  avg_sec_min?: number;
  avg_sec_max?: number;
  date_range?: string;
  companyId?: string;
}

export interface IReportOverviewResponse {
  deal_rate: Metric;
  revenue: Metric;
  traffic: Metric;
  deals: Metric;
  spend: Metric;
  roi: Metric;
  is_monthly: boolean;
}

export type IUpdateSpendPayload = {
  monthly_spend?: number;
  yearly_spend?: number;
};

export interface IUpdateSpendResponse {
  success: boolean;
  message?: string;
}

const BASE = "/v1/analytics";
export const fmt = (range: string) => range.toLowerCase().replace(/\s+/g, "_");

//-------------------------------------Hooks----------------------------------
export const useOrganicList = (params?: IGetOrganicParams) => {
  return useQuery({
    queryKey: ["organic", params],
    queryFn: async () => {
      const { companyId, ...queryParams } = params || {};
      const response = await api.get(`${BASE}/${companyId}/organic/landing`, {
        params: queryParams,
      });
      return response.data;
    },
    onError: (error: Error) => {
      console.error("organic fetch failed:", error);
    },
  } as UseQueryOptions<IOrganicReportResponse, Error>);
};

export const useOrganicReportOverview = ({
  timeRange,
  company_id,
}: CompanyIdParam & { timeRange: string }) => {
  return useQuery({
    queryKey: ["organic-report-overview", timeRange, company_id],
    queryFn: async () =>
      await api.get(`${BASE}/${company_id}/organic/performance-overview`, {
        params: { date_range: timeRange },
      }),
    onError: (error: Error) => {
      console.error("report overview fetch failed:", error);
    },
  } as UseQueryOptions<{ data: IReportOverviewResponse }, Error>);
};

export const useUpdateOrganicSpend = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IUpdateSpendResponse,
    Error,
    { companyId: string; payload: IUpdateSpendPayload }
  >({
    mutationFn: async ({ companyId, payload }) => {
      const response = await api.patch<IUpdateSpendResponse>(
        `v1/companies/${companyId}/spend`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate organic queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["organic"] });
      queryClient.invalidateQueries({ queryKey: ["organic-report-overview"] });
    },
    onError: (error: Error) => {
      console.error("Update organic spend failed:", error);
    },
  });
};
