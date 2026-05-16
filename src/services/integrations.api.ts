import {
  useQuery,
  UseQueryOptions,
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import api from "./api.service";
import { useAuth } from "@/store/AuthContext";

// Enums for integration types
export type IntegrationCategory = "Marketing";
export type IntegrationProvider = "google";

// Interface for Integration
export interface IIntegration {
  name: string;
  category: IntegrationCategory;
  provider: IntegrationProvider;
  description: string;
  details: string;
  allow_multiple: boolean;
  id: string;
  is_active: boolean;
}

// Interface for Create Integration request
export interface ICreateIntegrationRequest {
  name: string;
  category: IntegrationCategory;
  provider: IntegrationProvider;
  description: string;
  details: string;
}

// Interface for Update Integration request
export interface IUpdateIntegrationRequest {
  name: string;
  category: IntegrationCategory;
  provider: IntegrationProvider;
  description: string;
  details: string;
  is_active: boolean;
}

// Interface for Update Status request
export interface IUpdateIntegrationStatusRequest {
  is_active: boolean;
}

export interface GAdsSettingsResponse {
  selected_customer_id: string | null;
  enhanced_conversions: boolean;
  send_calls_as_conversions: boolean;
  conversion_action_type: "single" | "separate";
  send_forms_as_conversions: boolean;
  send_leads_as_conversions: boolean;
  primary_conversion_action: string | null;
  send_deals_as_conversions: boolean;
  send_deal_values: boolean;
  secondary_conversion_action: string | null;
  send_call_values: boolean;
  send_form_values: boolean;
}

export interface GAdsSettingsPayload {
  enhanced_conversions?: boolean;
  send_calls_as_conversions?: boolean;
  conversion_action_type?: "single" | "separate";
  send_forms_as_conversions?: boolean;
  send_leads_as_conversions?: boolean;
  primary_conversion_action?: string;
  send_deals_as_conversions?: boolean;
  send_deal_values?: boolean;
  secondary_conversion_action?: string;
  send_call_values?: boolean;
  send_form_values?: boolean;
}

// Interface for Integration List response
export interface IIntegrationListResponse extends Array<IIntegration> {}

// --- API Functions ---
export const getIntegrations = async (): Promise<IIntegrationListResponse> => {
  try {
    const response = await api.get("/v1/integrations");
    return response.data;
  } catch (error) {
    console.error("Integrations fetch failed:", error);
    throw error;
  }
};

export const getGAdsSettings = async (
  configId: string
): Promise<GAdsSettingsResponse> => {
  try {
    const response = await api.get(
      `/v1/integration-configs/${configId}/google-ads/settings`
    );
    return response.data;
  } catch (error) {
    console.error("Integrations Settings  failed:", error);
    throw error;
  }
};

export const createIntegration = async (
  data: ICreateIntegrationRequest
): Promise<IIntegration> => {
  try {
    const response = await api.post("/v1/integrations", data);
    return response.data;
  } catch (error) {
    console.error("Integration creation failed:", error);
    throw error;
  }
};

export const getIntegrationById = async (
  integrationId: string
): Promise<IIntegration> => {
  try {
    const response = await api.get(`/v1/integrations/${integrationId}`);
    return response.data;
  } catch (error) {
    console.error("Integration fetch failed:", error);
    throw error;
  }
};

export const updateIntegration = async (
  integrationId: string,
  data: IUpdateIntegrationRequest
): Promise<IIntegration> => {
  try {
    const response = await api.put(`/v1/integrations/${integrationId}`, data);
    return response.data;
  } catch (error) {
    console.error("Integration update failed:", error);
    throw error;
  }
};

export const updateGadsSettings = async (
  configId: string,
  data: GAdsSettingsPayload
): Promise<GAdsSettingsResponse> => {
  try {
    const response = await api.put(
      `/v1/integration-configs/${configId}/google-ads/settings`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Integration update failed:", error);
    throw error;
  }
};

export const updateIntegrationStatus = async (
  integrationId: string,
  data: IUpdateIntegrationStatusRequest
): Promise<IIntegration> => {
  try {
    const response = await api.put(
      `/v1/integrations/${integrationId}/status`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Integration status update failed:", error);
    throw error;
  }
};

// --- TanStack Query Hooks ---
export const useIntegrations = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["integrations"],
    queryFn: getIntegrations,
    enabled: isAuthenticated,
    onSuccess: (data: IIntegrationListResponse) => {
      console.log("Integrations data:", data);
    },
    onError: (error: Error) => {
      console.error("Integrations fetch failed:", error);
    },
  } as UseQueryOptions<IIntegrationListResponse, Error>);
};

export const useGetGdsSettings = (configId: string, enabled: boolean) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["GadsSettings", configId],
    queryFn: () => getGAdsSettings(configId),
    enabled: !!(isAuthenticated && configId && enabled),
    onSuccess: (data: GAdsSettingsResponse) => {
      console.log("Integrations data:", data);
    },
    onError: (error: Error) => {
      console.error("Integrations fetch failed:", error);
    },
  } as UseQueryOptions<GAdsSettingsResponse, Error>);
};

export const useCreateIntegration = (
  options?: UseMutationOptions<IIntegration, Error, ICreateIntegrationRequest>
) =>
  useMutation({
    mutationFn: createIntegration,
    onSuccess: (data: IIntegration) => {
      console.log("Integration creation successful:", data);
    },
    onError: (error: Error) => {
      console.error("Integration creation failed:", error);
    },
    ...options,
  });

export const useIntegrationById = (integrationId: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["integration", integrationId],
    queryFn: () => getIntegrationById(integrationId),
    enabled: !!integrationId && isAuthenticated,
    onSuccess: (data: IIntegration) => {
      console.log("Integration data:", data);
    },
    onError: (error: Error) => {
      console.error("Integration fetch failed:", error);
    },
  } as UseQueryOptions<IIntegration, Error>);
};

export const useUpdateIntegration = (
  options?: UseMutationOptions<
    IIntegration,
    Error,
    { integrationId: string; data: IUpdateIntegrationRequest }
  >
) =>
  useMutation({
    mutationFn: ({ integrationId, data }) =>
      updateIntegration(integrationId, data),
    onSuccess: (data: IIntegration) => {
      console.log("Integration update successful:", data);
    },
    onError: (error: Error) => {
      console.error("Integration update failed:", error);
    },
    ...options,
  });

export const useUpdateGadsSettings = (
  options?: UseMutationOptions<
    GAdsSettingsResponse,
    Error,
    { configId: string; data: GAdsSettingsPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    GAdsSettingsResponse,
    Error,
    { configId: string; data: GAdsSettingsPayload }
  >({
    mutationFn: ({ configId, data }) => updateGadsSettings(configId, data),
    onSuccess: (data: GAdsSettingsResponse) => {
      queryClient.invalidateQueries({ queryKey: ["GadsSettings"] });
      queryClient.invalidateQueries({ queryKey: [data?.selected_customer_id] });
      console.log("Integration update successful:", data);
    },
    onError: (error: Error) => {
      console.error("Integration update failed:", error);
    },
    ...options,
  });
};
export const useUpdateIntegrationStatus = (
  options?: UseMutationOptions<
    IIntegration,
    Error,
    { integrationId: string; data: IUpdateIntegrationStatusRequest }
  >
) =>
  useMutation({
    mutationFn: ({ integrationId, data }) =>
      updateIntegrationStatus(integrationId, data),
    onSuccess: (data: IIntegration) => {
      console.log("Integration status update successful:", data);
    },
    onError: (error: Error) => {
      console.error("Integration status update failed:", error);
    },
    ...options,
  });
