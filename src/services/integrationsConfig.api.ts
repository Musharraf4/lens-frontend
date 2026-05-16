import { useAuth } from "@/store/AuthContext";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import api from "./api.service";

// Interface for Integration Config
export interface IIntegrationConfig {
  id: string;
  integration_name: string;
  config_data: Record<string, any>;
  user_email: string;
  is_active: boolean;
  is_selected: boolean;
}

// Interface for Create Integration Config request
export interface ICreateIntegrationConfigRequest {
  integration_id: string;
  company_id: string;
  config_data: Record<string, any>;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  is_active: boolean;
  user_email: string;
}

// Interface for Update Integration Config request
export interface IUpdateIntegrationConfigRequest {
  // user_email: string;
  // config_data: Record<string, any>;
  // access_token: string;
  // refresh_token: string;
  // token_expires_at: string;
  // is_active: boolean;
  manager_id: string;
  customer_ids: string[];
}

// Interface for Disconnect Integration Config request
export interface IDisconnectIntegrationConfigRequest {
  user_email: string;
  is_active: boolean;
}

// Interface for Update Primary Connection request
export interface IUpdatePrimaryConnectionRequest {
  is_selected: boolean;
}

// Interface for Integration Config List response
export interface IIntegrationConfigListResponse
  extends Array<IIntegrationConfig> {}

// Interface for Integration Config Customer IDs response
export interface IIntegrationConfigCustomerIdsResponse {
  manager_id: string;
  customer_ids: string[];
}

// --- API Functions ---
export const getIntegrationConfigs = async (
  companyId?: string
): Promise<IIntegrationConfigListResponse> => {
  try {
    const response = await api.get(`/v1/integration-configs/${companyId}`);
    return response.data;
  } catch (error) {
    console.error("Integration configs fetch failed:", error);
    throw error;
  }
};

export const createIntegrationConfig = async (
  data: ICreateIntegrationConfigRequest
): Promise<IIntegrationConfig> => {
  try {
    const response = await api.post("/v1/integration-configs", data);
    return response.data;
  } catch (error) {
    console.error("Integration config creation failed:", error);
    throw error;
  }
};

export const getIntegrationConfigById = async (
  integrationId: string
): Promise<IIntegrationConfig> => {
  try {
    const response = await api.get(`/v1/integration-configs/${integrationId}`);
    return response.data;
  } catch (error) {
    console.error("Integration config fetch failed:", error);
    throw error;
  }
};

export const updateIntegrationConfig = async (
  integrationId: string,
  data: IUpdateIntegrationConfigRequest
): Promise<IIntegrationConfig> => {
  try {
    const response = await api.put(
      `/v1/integration-configs/${integrationId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Integration config update failed:", error);
    throw error;
  }
};

export const disconnectIntegrationConfig = async (
  integrationId: string,
  data: IDisconnectIntegrationConfigRequest
): Promise<IIntegrationConfig> => {
  try {
    const response = await api.put(
      `/v1/integration-configs/${integrationId}/disconnect`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Integration config disconnect failed:", error);
    throw error;
  }
};

export const getIntegrationConfigCustomerIds = async (
  configId: string
): Promise<IIntegrationConfigCustomerIdsResponse> => {
  try {
    const response = await api.get(
      `/v1/integration-configs/${configId}/customer-ids`
    );
    return response.data;
  } catch (error) {
    console.error("Integration config customer IDs fetch failed:", error);
    throw error;
  }
};

export const updatePrimaryConnection = async (
  configId: string,
  data: IUpdatePrimaryConnectionRequest
): Promise<IIntegrationConfig> => {
  try {
    const response = await api.put(
      `/v1/integration-configs/${configId}/toggle-selected`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Primary connection update failed:", error);
    throw error;
  }
};

// --- TanStack Query Hooks ---
export const useIntegrationConfigs = (companyId?: string) => {
  return useQuery({
    queryKey: ["integration-configs", companyId],
    queryFn: () => getIntegrationConfigs(companyId),
    enabled: !!companyId,
    onSuccess: (data: IIntegrationConfigListResponse) => {
      console.log("Integration configs data:", data);
    },
    onError: (error: Error) => {
      console.error("Integration configs fetch failed:", error);
    },
  } as UseQueryOptions<IIntegrationConfigListResponse, Error>);
};

export const useCreateIntegrationConfig = (
  options?: UseMutationOptions<
    IIntegrationConfig,
    Error,
    ICreateIntegrationConfigRequest
  >
) =>
  useMutation({
    mutationFn: createIntegrationConfig,
    onSuccess: (data: IIntegrationConfig) => {
      console.log("Integration config creation successful:", data);
    },
    onError: (error: Error) => {
      console.error("Integration config creation failed:", error);
    },
    ...options,
  });

export const useIntegrationConfigById = (integrationId: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["integration-config", integrationId],
    queryFn: () => getIntegrationConfigById(integrationId),
    enabled: !!integrationId && isAuthenticated,
    onSuccess: (data: IIntegrationConfig) => {
      console.log("Integration config data:", data);
    },
    onError: (error: Error) => {
      console.error("Integration config fetch failed:", error);
    },
  } as UseQueryOptions<IIntegrationConfig, Error>);
};

export const useUpdateIntegrationConfig = (
  options?: UseMutationOptions<
    IIntegrationConfig,
    Error,
    { integrationId: string; data: IUpdateIntegrationConfigRequest }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ integrationId, data }) =>
      updateIntegrationConfig(integrationId, data),
    onSuccess: (data: IIntegrationConfig) => {
      console.log("Integration config update successful:", data);
      queryClient.invalidateQueries({ queryKey: ["checkPlanUsed"] });
    },
    onError: (error: Error) => {
      console.error("Integration config update failed:", error);
    },
    ...options,
  });
};
export const useDisconnectIntegrationConfig = (
  options?: UseMutationOptions<
    IIntegrationConfig,
    Error,
    { integrationId: string; data: IDisconnectIntegrationConfigRequest }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ integrationId, data }) =>
      disconnectIntegrationConfig(integrationId, data),
    onSuccess: (data: IIntegrationConfig) => {
      console.log("Integration config disconnect successful:", data);
      queryClient.invalidateQueries({ queryKey: ["checkPlanUsed"] });
    },
    onError: (error: Error) => {
      console.error("Integration config disconnect failed:", error);
    },
    ...options,
  });
};
export const useIntegrationConfigCustomerIds = (configId: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["integration-config-customer-ids", configId],
    queryFn: () => getIntegrationConfigCustomerIds(configId),
    enabled: !!configId && isAuthenticated,
    onSuccess: (data: IIntegrationConfigCustomerIdsResponse) => {
      console.log("Integration config customer IDs data:", data);
    },
    onError: (error: Error) => {
      console.error("Integration config customer IDs fetch failed:", error);
    },
  } as UseQueryOptions<IIntegrationConfigCustomerIdsResponse, Error>);
};

export const useUpdatePrimaryConnection = (
  options?: UseMutationOptions<
    IIntegrationConfig,
    Error,
    { configId: string; data: IUpdatePrimaryConnectionRequest }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ configId, data }) => updatePrimaryConnection(configId, data),
    onSuccess: (data: IIntegrationConfig) => {
      console.log("Primary connection update successful:", data);
      queryClient.invalidateQueries({ queryKey: ["integration-configs"] });
    },
    onError: (error: Error) => {
      console.error("Primary connection update failed:", error);
    },
    ...options,
  });
};
