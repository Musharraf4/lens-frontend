import { useQuery, UseQueryOptions, useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import api from './api.service';

// Interface for phone number draft data
export interface IPhoneNumberDraftData {
  [key: string]: any;
}

// Interface for phone number draft
export interface IPhoneNumberDraft {
  name: string;
  step_name: string;
  step_number: number;
  total_steps: number;
  data: IPhoneNumberDraftData;
  id: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

// Interface for phone number draft list response
export interface IPhoneNumberDraftListResponse {
  items: IPhoneNumberDraft[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Interface for phone number draft list parameters
export interface IPhoneNumberDraftListParams {
  page?: number;
  size?: number;
}

// Interface for phone number draft create request
export interface IPhoneNumberDraftCreateRequest {
  name: string;
  step_name: string;
  step_number: number;
  total_steps: number;
  data: IPhoneNumberDraftData;
}

// Interface for phone number draft update request
export interface IPhoneNumberDraftUpdateRequest {
  name: string;
  step_name: string;
  step_number: number;
  total_steps: number;
  data: IPhoneNumberDraftData;
}

// --- API Functions ---
export const createPhoneNumberDraft = async (data: IPhoneNumberDraftCreateRequest): Promise<IPhoneNumberDraft> => {
  try {
    const response = await api.post('/v1/phone-number-drafts', data);
    return response.data;
  } catch (error) {
    console.error('Phone number draft creation failed:', error);
    throw error;
  }
};

export const getPhoneNumberDrafts = async (params: IPhoneNumberDraftListParams): Promise<IPhoneNumberDraftListResponse> => {
  try {
    const response = await api.get('/v1/phone-number-drafts', { params });
    return response.data;
  } catch (error) {
    console.error('Phone number drafts fetch failed:', error);
    throw error;
  }
};

export const getPhoneNumberDraftById = async (draftId: string): Promise<IPhoneNumberDraft> => {
  try {
    const response = await api.get(`/v1/phone-number-drafts/${draftId}`);
    return response.data;
  } catch (error) {
    console.error('Phone number draft fetch failed:', error);
    throw error;
  }
};

export const updatePhoneNumberDraft = async (
  draftId: string,
  data: IPhoneNumberDraftUpdateRequest
): Promise<IPhoneNumberDraft> => {
  try {
    const response = await api.put(`/v1/phone-number-drafts/${draftId}`, data);
    return response.data;
  } catch (error) {
    console.error('Phone number draft update failed:', error);
    throw error;
  }
};

export const deletePhoneNumberDraft = async (draftId: string): Promise<void> => {
  try {
    await api.delete(`/v1/phone-number-drafts/${draftId}`);
  } catch (error) {
    console.error('Phone number draft deletion failed:', error);
    throw error;
  }
};

// --- TanStack Query Hooks ---
export const useCreatePhoneNumberDraft = (
  options?: UseMutationOptions<IPhoneNumberDraft, Error, IPhoneNumberDraftCreateRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPhoneNumberDraft,
    onSuccess: (data: IPhoneNumberDraft, variables, context) => {
      console.log('Phone number draft creation successful:', data);

      // ✅ Invalidate the draft list
      queryClient.invalidateQueries({ queryKey: ['phoneNumberDrafts'] });
    },
    onError: (error: Error, variables, context) => {
      console.error('Phone number draft creation failed:', error);
    },
    ...options,
  });
};

export const usePhoneNumberDrafts = (params: IPhoneNumberDraftListParams) =>
  useQuery({
    queryKey: ['phoneNumberDrafts', params],
    queryFn: () => getPhoneNumberDrafts(params),
    onSuccess: (data: IPhoneNumberDraftListResponse) => {
      console.log('Phone number drafts data:', data);
    },
    onError: (error: Error) => {
      console.error('Phone number drafts fetch failed:', error);
    },
  } as UseQueryOptions<IPhoneNumberDraftListResponse, Error>);

export const usePhoneNumberDraftById = (draftId: string) =>
  useQuery({
    queryKey: ['phoneNumberDraft', draftId],
    queryFn: () => getPhoneNumberDraftById(draftId),
    enabled: !!draftId,
    onSuccess: (data: IPhoneNumberDraft) => {
      console.log('Phone number draft data:', data);
    },
    onError: (error: Error) => {
      console.error('Phone number draft fetch failed:', error);
    },
  } as UseQueryOptions<IPhoneNumberDraft, Error>);

export const useUpdatePhoneNumberDraft = (
  options?: UseMutationOptions<
    IPhoneNumberDraft,
    Error,
    { draftId: string; data: IPhoneNumberDraftUpdateRequest }
  >
) =>
  useMutation({
    mutationFn: ({ draftId, data }) => updatePhoneNumberDraft(draftId, data),
    onSuccess: (data: IPhoneNumberDraft) => {
      console.log('Phone number draft update successful:', data);
    },
    onError: (error: Error) => {
      console.error('Phone number draft update failed:', error);
    },
    ...options,
  });

export const useDeletePhoneNumberDraft = (
  options?: UseMutationOptions<void, Error, string>
) =>
  useMutation({
    mutationFn: deletePhoneNumberDraft,
    onSuccess: () => {
      console.log('Phone number draft deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Phone number draft deletion failed:', error);
    },
    ...options,
  });
