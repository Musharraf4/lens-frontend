import {
  useQuery,
  UseQueryOptions,
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import api from "./api.service";
import { showToast } from "@/components/Toast";
import { CompanyIdParam, PaginationResponse } from "@/types";

// Interface for Twilio phone number capabilities
export interface IPhoneNumberCapabilities {
  voice: boolean;
  SMS: boolean;
  MMS: boolean;
}

// Interface for Twilio phone number
export interface ITwilioPhoneNumber {
  friendly_name: string;
  phone_number: string;
  lata: string;
  locality: string;
  rate_center: string;
  latitude: string | null;
  longitude: string | null;
  region: string;
  postal_code: string | null;
  iso_country: string;
  address_requirements: string;
  beta: boolean;
  capabilities: IPhoneNumberCapabilities;
}

// Interface for phone number search parameters
export interface IPhoneNumberSearchParams {
  country_code: string;
  company_id?: string;
  area_code?: string | null;
  contains?: string | null;
  sms_enabled?: boolean;
  voice_enabled?: boolean;
  limit?: number;
  is_toll_free?: boolean;
}

// Interface for tracking number
export interface ITrackingNumber {
  phone_number: string;
  number_sid: string;
  status: string;
}

// Interface for phone number purchase request
export interface IPhoneNumberPurchaseRequest {
  phone_numbers: string[];
  number_name: string;
  name: string;
  source: string;
  pool_type: "static" | "dynamic";
  forwarding_number: string;
  call_recording_enabled: boolean;
  call_recording_message: string;
  call_greeting_enabled: boolean;
  call_greeting_message: string;
  call_whisper_enabled: boolean;
  call_whisper_message: string;
  status: "active";
  traffic_filter: string;
  company_id?: string;
}

// Interface for phone number purchase response
export interface IPhoneNumberPurchaseResponse {
  id: string;
  company_id: string;
  name: string;
  source: string;
  pool_type: "static";
  tracking_numbers: ITrackingNumber[];
  forwarding_number: string;
  call_recording_enabled: boolean;
  call_recording_message: string;
  call_greeting_enabled: boolean;
  call_greeting_message: string;
  call_whisper_enabled: boolean;
  call_whisper_message: string;
  status: "active";
  traffic_filter: string;
  created_at: string;
  updated_at: string;
}

// Interface for phone number list response
export interface IPhoneNumberListResponse extends PaginationResponse {
  items: IPhoneNumberPurchaseResponse[];
}

// Interface for phone number list parameters
export interface IPhoneNumberListParams {
  page?: number;
  size?: number;
  company_id?: string;
  number_status?: string | null;
}

// Interface for phone number update request
export interface IPhoneNumberUpdateRequest {
  name: string;
  source: string;
  pool_type: string;
  forwarding_number: string;
  company_id?: string;
  call_recording_enabled: boolean;
  call_recording_message: string;
  call_greeting_enabled: boolean;
  call_greeting_message: string;
  call_whisper_enabled: boolean;
  call_whisper_message: string;
  status: string;
  traffic_filter: string;
}

// Interface for update forwarding request
export interface IUpdateForwardingRequest {
  phone_number_ids: string[];
  forwarding_number: string;
  company_id?: string;
}

// Interface for update forwarding response
export interface IUpdateForwardingResponse {
  message: string;
}

// Interface for update status request
export interface IUpdateStatusRequest {
  phone_number_ids: string[];
  status: "active" | "disabled";
  company_id?: string;
}

// Interface for update status response
export interface IUpdateStatusResponse {
  message: string;
}

// Interface for Twilio purchased number
export interface ITwilioPurchasedNumber {
  sid: string;
  phone_number: string;
  friendly_name: string;
  date_created: string;
  capabilities: IPhoneNumberCapabilities;
}

// Interface for release number response
export interface IReleaseNumberResponse {
  message: string;
}

// --- API Functions ---
export const getAvailablePhoneNumbers = async (
  params: IPhoneNumberSearchParams
): Promise<ITwilioPhoneNumber[]> => {
  try {
    const { company_id, ...restOfParams } = params || {};
    const response = await api.get(
      `/v1/phone-numbers/${company_id}/twilio/generate`,
      {
        params: restOfParams,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Available phone numbers fetch failed:", error);
    throw error;
  }
};

export const purchasePhoneNumber = async (
  data: IPhoneNumberPurchaseRequest
): Promise<IPhoneNumberPurchaseResponse> => {
  try {
    const { company_id, ...restOfData } = data || {};
    const response = await api.post(
      `/v1/phone-numbers/${company_id}/`,
      restOfData
    );
    return response.data;
  } catch (error) {
    console.error("Phone number purchase failed:", error);
    throw error;
  }
};

export const getPhoneNumbers = async (
  params: IPhoneNumberListParams
): Promise<IPhoneNumberListResponse> => {
  try {
    const { company_id, ...restOfParams } = params || {};

    const response = await api.get(`/v1/phone-numbers/${company_id}/`, {
      params: restOfParams,
    });
    return response.data;
  } catch (error) {
    console.error("Phone numbers fetch failed:", error);
    throw error;
  }
};

export const getPhoneNumberById = async (
  phoneNumberId: string,
  company_id?: string
): Promise<IPhoneNumberPurchaseResponse> => {
  try {
    const response = await api.get(
      `/v1/phone-numbers/${company_id}/${phoneNumberId}`
    );
    return response.data;
  } catch (error) {
    console.error("Phone number fetch failed:", error);
    throw error;
  }
};

export const updatePhoneNumber = async (
  phoneNumberId: string,
  data: IPhoneNumberUpdateRequest
): Promise<IPhoneNumberPurchaseResponse> => {
  try {
    const { company_id, ...restOfData } = data || {};

    const response = await api.put(
      `/v1/phone-numbers/${company_id}/${phoneNumberId}`,
      restOfData
    );
    return response.data;
  } catch (error) {
    console.error("Phone number update failed:", error);
    throw error;
  }
};

export const updateForwardingNumbers = async (
  data: IUpdateForwardingRequest
): Promise<IUpdateForwardingResponse> => {
  try {
    const { company_id, ...restOfData } = data || {};

    const response = await api.patch(
      `/v1/phone-numbers/${company_id}/update-forwarding`,
      restOfData
    );
    return response.data;
  } catch (error) {
    console.error("Forwarding numbers update failed:", error);
    throw error;
  }
};

// --- TanStack Query Hooks ---
export const useAvailablePhoneNumbers = (params: IPhoneNumberSearchParams) =>
  useQuery({
    queryKey: ["twilioPhoneNumbers", params],
    queryFn: () => getAvailablePhoneNumbers(params),
    enabled: params.country_code && (params.area_code || params.is_toll_free),
    onSuccess: (data: ITwilioPhoneNumber[]) => {
      console.log("Available phone numbers data:", data);
    },
    onError: (error: Error) => {
      console.error("Available phone numbers fetch failed:", error);
    },
  } as UseQueryOptions<ITwilioPhoneNumber[], Error>);

export const usePurchasePhoneNumber = (
  options?: UseMutationOptions<
    IPhoneNumberPurchaseResponse,
    Error,
    IPhoneNumberPurchaseRequest
  >
) =>
  useMutation({
    mutationFn: purchasePhoneNumber,
    onSuccess: (data: IPhoneNumberPurchaseResponse) => {
      console.log("Phone number purchase successful:", data);
    },
    onError: (error: Error) => {
      console.error("Phone number purchase failed:", error);
    },
    ...options,
  });

export const usePhoneNumbers = (params: IPhoneNumberListParams) =>
  useQuery({
    queryKey: ["get-phone-numbers", params],
    queryFn: () => getPhoneNumbers(params),
  } as UseQueryOptions<IPhoneNumberListResponse, Error>);

export type TrackingNumber = {
  phone_number: string;
  number_sid: string;
  status: string; // extend as needed
};

export type NumberPoolResponse = {
  id: string; // UUID
  company_id: string; // UUID
  name: string;
  source: string;
  pool_type: string;
  tracking_numbers: TrackingNumber[];
  forwarding_number: string;
  call_recording_enabled: boolean;
  call_recording_message: string;
  call_greeting_enabled: boolean;
  call_greeting_message: string;
  call_whisper_enabled: boolean;
  call_whisper_message: string;
  status: string;
  traffic_filter: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
};

export const usePhoneNumberById = ({
  phoneNumberId,
  company_id,
}: { phoneNumberId: string } & CompanyIdParam) =>
  useQuery({
    queryKey: ["phone-number-by-id", phoneNumberId, company_id],
    queryFn: () => getPhoneNumberById(phoneNumberId, company_id),
    staleTime: 0,
    refetchOnMount: true,
    enabled: !!phoneNumberId,
  } as UseQueryOptions<NumberPoolResponse, Error>);

export const useUpdatePhoneNumber = (
  options?: UseMutationOptions<
    IPhoneNumberPurchaseResponse,
    Error,
    { phoneNumberId: string; data: IPhoneNumberUpdateRequest }
  >
) =>
  useMutation({
    mutationFn: ({ phoneNumberId, data }) =>
      updatePhoneNumber(phoneNumberId, data),
    onSuccess: (data: IPhoneNumberPurchaseResponse) => {
      console.log("Phone number update successful:", data);
    },
    onError: (error: Error) => {
      console.error("Phone number update failed:", error);
    },
    ...options,
  });

export const useDeletePhoneNumber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      phoneNumberId,
      company_id,
    }: {
      phoneNumberId: string;
      company_id?: string;
    }) => {
      return await api.delete(
        `/v1/phone-numbers/${company_id}/${phoneNumberId}`
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-phone-numbers"] });
      // Optionally show a toast
      showToast({
        title: "Phone number deleted",
        description: "The number has been removed successfully.",
        type: "success",
      });
    },

    onError: (error: Error) => {
      console.error("Phone number deletion failed:", error);
      showToast({
        title: "Error deleting phone number",
        description: "Please try again",
        type: "error",
      });
    },
  });
};

export const useUpdateForwardingNumbers = () =>
  useMutation({
    mutationFn: updateForwardingNumbers,
    onSuccess: () => {
      showToast({
        title: "Forwarding numbers update successful",
        type: "success",
      });
    },
    onError: (error: Error) => {
      showToast({ title: "Forwarding numbers update failed", type: "error" });
      console.error("Forwarding numbers update failed:", error);
    },
  });

export const useUpdatePhoneNumberStatus = () =>
  useMutation({
    mutationFn: async (data: IUpdateStatusRequest) => {
      const { company_id, ...restOfData } = data || {};
      const response = await api.patch(
        `/v1/phone-numbers/${company_id}/update-status`,
        restOfData
      );
      return response.data;
    },
    onSuccess: () => {
      showToast({
        title: "Phone number status updated successfully",
        type: "success",
      });
    },
    onError: (error: Error) => {
      showToast({ title: "Phone number status update failed", type: "error" });
      console.error("Phone number status update failed:", error);
    },
  });

export const useTwilioPurchasedNumbers = ({
  company_id,
}: {
  company_id?: string;
}) =>
  useQuery({
    queryKey: ["twilioPurchasedNumbers", company_id],
    queryFn: async () => {
      const response = await api.get(
        `/v1/phone-numbers/${company_id}/twilio/purchased`
      );
      return response.data;
    },
    onError: (error: Error) => {
      console.error("Twilio purchased numbers fetch failed:", error);
    },
  } as UseQueryOptions<ITwilioPurchasedNumber[], Error>);

export const useReleaseTwilioNumber = ({
  sid,
  company_id,
}: {
  sid: string;
  company_id?: string;
}) =>
  useMutation({
    mutationFn: async () => {
      const response = await api.post(
        `/v1/phone-numbers/${company_id}/twilio/release/${sid}`
      );
      return response.data;
    },
    onSuccess: (data: IReleaseNumberResponse) => {
      console.log("Twilio number release successful:", data);
    },
    onError: (error: Error) => {
      console.error("Twilio number release failed:", error);
    },
  });
