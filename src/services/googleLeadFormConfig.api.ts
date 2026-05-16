import { useQuery, UseQueryOptions, useMutation, UseMutationOptions } from '@tanstack/react-query';
import api from './api.service';

// Interface for Google Lead Form Config
export interface IGoogleLeadFormConfig {
  spam_filter_enabled: boolean;
  stop_words: string[];
  api_key: string;
  tracking_enabled: boolean;
  id: string;
  company_id: string;
  webhook_url: string;
  created_at: string;
  updated_at: string;
}

// Interface for Google Lead Form Config create/update request
export interface IGoogleLeadFormConfigRequest {
  spam_filter_enabled?: boolean;
  stop_words?: string[];
  tracking_enabled?: boolean;
}

// --- API Functions ---
export const getGoogleLeadFormConfig = async (): Promise<IGoogleLeadFormConfig> => {
  try {
    const response = await api.get('/v1/google-lead-form-config/');
    return response.data;
  } catch (error) {
    console.error('Google Lead Form Config fetch failed:', error);
    throw error;
  }
};

export const saveGoogleLeadFormConfig = async (
  data: IGoogleLeadFormConfigRequest
): Promise<IGoogleLeadFormConfig> => {
  try {
    const response = await api.post('/v1/google-lead-form-config/', data);
    return response.data;
  } catch (error) {
    console.error('Google Lead Form Config save failed:', error);
    throw error;
  }
};

export const createApiKey = async (): Promise<IGoogleLeadFormConfig> => {
  try {
    const response = await api.post('/v1/google-lead-form-config/create-api-key');
    return response.data;
  } catch (error) {
    console.error('API key creation failed:', error);
    throw error;
  }
};

// --- TanStack Query Hooks ---
export const useGoogleLeadFormConfig = (
  options?: UseQueryOptions<IGoogleLeadFormConfig, Error>
) =>
  useQuery({
    queryKey: ['googleLeadFormConfig'],
    queryFn: getGoogleLeadFormConfig,
    onSuccess: (data: IGoogleLeadFormConfig) => {
      console.log('Google Lead Form Config data:', data);
    },
    onError: (error: Error) => {
      console.error('Google Lead Form Config fetch failed:', error);
    },
    ...options,
  } as UseQueryOptions<IGoogleLeadFormConfig, Error>);

export const useSaveGoogleLeadFormConfig = (
  options?: UseMutationOptions<IGoogleLeadFormConfig, Error, IGoogleLeadFormConfigRequest>
) =>
  useMutation({
    mutationFn: saveGoogleLeadFormConfig,
    onSuccess: (data: IGoogleLeadFormConfig) => {
      console.log('Google Lead Form Config save successful:', data);
    },
    onError: (error: Error) => {
      console.error('Google Lead Form Config save failed:', error);
    },
    ...options,
  });

export const useCreateApiKey = (
  options?: UseMutationOptions<IGoogleLeadFormConfig, Error, void>
) =>
  useMutation({
    mutationFn: createApiKey,
    onSuccess: (data: IGoogleLeadFormConfig) => {
      console.log('API key creation successful:', data);
    },
    onError: (error: Error) => {
      console.error('API key creation failed:', error);
    },
    ...options,
  });
