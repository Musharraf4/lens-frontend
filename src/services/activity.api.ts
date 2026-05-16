import { showToast } from "@/components/Toast";
import { useAuth } from "@/store/AuthContext";
import { CompanyIdParam } from "@/types";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import api from "./api.service";

export type HeatMapBucket = "day" | "month";

export type InteractionType = "call" | "form" | "chat" | "summary";

export interface IStatsDataset {
  label: string;
  data: number[];
}

export interface IStatsResponse {
  bucket: HeatMapBucket;
  labels: string[];
  datasets: IStatsDataset[];
}

export interface IContact {
  name: string;
  email: string;
  phone_number: string;
  contact_type: "lead" | "deal";
  job_type: string;
  url: string;
  channel: string;
  first_interaction_date: string;
  interaction_type: "chat" | "call" | "form";
  revenue: string;
  id: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface IContactsListResponse {
  items: IContact[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface IGetContactsParams {
  page?: number;
  size?: number;
  date_range?: string;
  job_type?: string;
  contact_type?: string;
  first_interaction_date_from?: string;
  interaction_type?: InteractionType;
  channel?: string;
  revenue_min?: number;
  revenue_max?: number;
  companyId?: string;
}

const BASE = "/v1/contacts";
export const fmt = (range: string) => range.toLowerCase().replace(/\s+/g, "_");

// ---------------------------------------API Functions-----------------------
export const getContactInteractions = async (
  params?: IGetContactsParams
): Promise<IContactsListResponse> => {
  try {
    const { companyId, ...queryParams } = params || {};
    const response = await api.get(`${BASE}/${companyId}/interaction`, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    showToast({ title: "Failed to load contacts", type: "error" });
    console.error("Contacts fetch failed:", error);
    throw error;
  }
};

export const fetchInteractionStatus = async ({
  dateRange,
  interactionType,
  company_id,
}: CompanyIdParam & {
  dateRange: string;
  interactionType: InteractionType;
}): Promise<IStatsResponse> => {
  const params: Record<string, string> = { date_range: fmt(dateRange) };
  if (interactionType && interactionType !== "summary") {
    params.interaction_type = interactionType;
  }
  const { data } = await api.get<IStatsResponse>(
    `${BASE}/${company_id}/interaction-stats`,
    {
      params,
    }
  );
  return data;
};
export const updateIntractionRevenue = async (
  intractionId: string,
  company_id: string,
  contactType: string,
  intraction_type: string,
  revenue: number
): Promise<IContact> => {
  try {
    const response = await api.patch(`/v1/contacts/${company_id}/interaction`, {
      interaction_id: intractionId,
      interaction_type: intraction_type,
      contact_type: contactType,
      revenue,
    });
    return response.data;
  } catch (error) {
    console.error("Contact job type update failed:", error);
    throw error;
  }
};

//-------------------------------------Hooks----------------------------------
export const useInteractionStatus = ({
  activeTab,
  dateRange,
  company_id,
}: CompanyIdParam & { dateRange: string; activeTab: InteractionType }) => {
  return useQuery({
    queryKey: [
      "contactIntractionResponse",
      dateRange,
      activeTab ?? "summary",
      company_id,
    ],
    queryFn: () =>
      fetchInteractionStatus({
        dateRange,
        interactionType: activeTab,
        company_id,
      }),
    onError: (error: Error) => {
      showToast({ title: "Failed to load Interaction Stats", type: "error" });
    },
  } as UseQueryOptions<IStatsResponse, Error>);
};

export const useContacts = (params?: IGetContactsParams) => {
  return useQuery({
    queryKey: ["contacts", params],
    queryFn: () => getContactInteractions(params),
    retry: false,
  } as UseQueryOptions<IContactsListResponse, Error>);
};

export const useUpdateIntractionRevenue = (
  options?: UseMutationOptions<
    IContact,
    Error,
    {
      intractionId: string;
      company_id: string;
      contactType: string;
      intraction_type: string;
      revenue: number;
    }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      intractionId,
      company_id,
      contactType,
      intraction_type,
      revenue,
    }) =>
      updateIntractionRevenue(
        intractionId,
        company_id,
        contactType,
        intraction_type,
        revenue
      ),
    onSuccess: (data: IContact) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (error: Error) => {
      console.error("Contact update failed:", error);
    },
    ...options,
  });
};
