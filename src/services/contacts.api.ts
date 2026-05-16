import { useAuth } from "@/store/AuthContext";
import { CompanyIdParam, PaginationResponse } from "@/types";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import api from "./api.service";
import { normalizedParams } from "@/lib/utils";

// Interface for Contact
export interface IContact {
  name: string;
  email: string;
  phone_number: string;
  phone: string;
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
  contact_id: string;
}

export interface VisitorSession {
  channel: string;
  company_id: string;
  first_seen_at: string;
  id: string;
  ip_address: string | null;
  last_seen_at: string;
  landing_page: string;
  page_path: string;
  status: string;
}

// Interface for Contact with tracking data
export interface IContactWithTracking extends IContact {
  call_tracking: ICallTracking[];
  form_tracking: IFormTracking[];
  chat_tracking: ICatTracking[];
  timeline: IFormTracking[];
  visitor_sessions: VisitorSession[];
}

export interface NoteType {
  id: number;
  author: string;
  created_at: string;
  body: string;
  updated_at: string | null;
}

// Interface for Call Tracking
export interface ICallTracking {
  recording_url: string;
  transcription_text: string;
  source: string;
  medium: string;
  campaign: string;
  call_sid: string;
  status: "queued" | string;
  duration: number;
  call_date: string;
  tracking_number: string;
  caller_number: string;
  direction: string;
  caller_name: string;
  caller_city: string;
  caller_state: string;
  caller_zip: string;
  caller_country: string;
  id: string;
  company_id: string;
  phone_number_id: string;
  created_at: string;
  updated_at: string;
  revenue: number | null;
}

// Interface for Form Tracking

export interface ITimeLineData {
  channel: string;
  job_type: string;
  landing_page: string;
  url: string | null;
  revenue: number | null;
}
export interface IFormTracking {
  source: string;
  medium: string;
  campaign: string;
  keywords: string[];
  url: string;
  additional_data: Record<string, any>;
  id: string;
  company_id: string;
  contact_id: string;
  created_at: string;
  updated_at: string;
  timestamp: string;
  type: string;
  revenue: number | null;
  data: ITimeLineData;
}
export interface ICatTracking {
  source: string;
  medium: string;
  campaign: string;
  keywords: string[];
  topic_name: string;
  url: string;
  additional_data: Record<string, any>;
  id: string;
  company_id: string;
  contact_id: string;
  created_at: string;
  updated_at: string;
  timestamp: string;
  type: string;
  revenue: number | null;
  data: ITimeLineData;
  extra_metadata: {
    attribution: {
      source: string;
      medium: string;
      campaign: string;
      url: string;
    };
  };
  answer_json: {
    text: string;
  };
}

// Interface for Contacts List Response
export interface IContactsListResponse {
  items: IContact[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Interface for Get Contacts Query Parameters
export interface IGetContactsParams {
  page?: number;
  size?: number;
  contact_type?: string;
  search_text?: string;
  date_range?: string;
  first_date_from?: string;
  first_date_to?: string;
  created_at_from?: string;
  created_at_to?: string;
  revenue_min?: number;
  revenue_max?: number;
  duration_min?: number;
  duration_max?: number;
  interaction_type?: string[];
  job_type?: string[];
  channel?: string[];
  campaign?: string[];
  keyword?: string;
  referrer?: string[];
  duration?: string[];
  landing_page?: string[];
  device?: string[];
}

// Interface for Create Contact Request
export interface ICreateContactRequest {
  name: string;
  email: string;
  phone_number: string;
  contact_type: "lead" | "deal";
  job_type: string;
  url: string;
  channel: string;
  first_interaction_date: string;
  interaction_type: "chat" | "call" | "form";
  revenue: number;
}

// Interface for Update Contact Request
export interface IUpdateContactRequest {
  name?: string;
  email?: string;
  company_id?: string;
  job_type?: string;
  revenue?: number;
  contact_type?: "lead" | "deal";
  url?: string;
}

type CreateNoteVariables = {
  contactId: string;
  company_id: string;
  data: string;
};

interface JobTypeResponse {
  job_types: string[];
}

export const createContact = async (
  data: ICreateContactRequest
): Promise<IContact> => {
  try {
    const response = await api.post("/v1/contacts", data);
    return response.data;
  } catch (error) {
    console.error("Contact creation failed:", error);
    throw error;
  }
};

export const getContactById = async (
  contactId: string,
  companyId: string
): Promise<IContactWithTracking> => {
  try {
    const response = await api.get(
      `/v1/contacts/${contactId}?company_id=${companyId}`
    );
    return response.data;
  } catch (error) {
    console.error("Contact fetch failed:", error);
    throw error;
  }
};

export const updateContact = async (
  contactId: string,
  data: IUpdateContactRequest
): Promise<IContact> => {
  try {
    const response = await api.patch(`/v1/contacts/${contactId}`, data);
    return response.data;
  } catch (error) {
    console.error("Contact update failed:", error);
    throw error;
  }
};

export const updateContactJob = async (
  contactId: string,
  company_id: string,
  job_type: string
): Promise<IContact> => {
  try {
    const response = await api.patch(
      `/v1/contacts/${contactId}/job-type?job_type=${job_type}&company_id=${company_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Contact job type update failed:", error);
    throw error;
  }
};

export const updateContactRevenue = async (
  contactId: string,
  company_id: string,
  revenue: number
): Promise<IContact> => {
  try {
    const response = await api.patch(
      `/v1/contacts/${contactId}/revenue?company_id=${company_id}`,
      {
        // updates: data,
        revenue: revenue,
        // contact_type_update: {
        //   contact_type: contactType,
        // },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Contact job type update failed:", error);
    throw error;
  }
};

export const deleteContact = async (contactId: string): Promise<void> => {
  try {
    await api.delete(`/v1/contacts/${contactId}`);
  } catch (error) {
    console.error("Contact deletion failed:", error);
    throw error;
  }
};

export const getNotesByContactId = async (
  contactId: string,
  companyId: string
): Promise<NoteType[]> => {
  try {
    const response = await api.get(
      `/v1/contacts/${contactId}/notes?company_id=${companyId}`
    );
    return response.data;
  } catch (error) {
    console.error("Contact fetch failed:", error);
    throw error;
  }
};

export const createNote = async (
  contactId: string,
  company_id: string,
  data: string
): Promise<NoteType> => {
  try {
    const response = await api.post(
      `/v1/contacts/${contactId}/note?company_id=${company_id}`,
      {
        body: data,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Note created failed:", error);
    throw error;
  }
};
export const updateNote = async (
  contactId: string,
  company_id: string,
  data: string,
  noteId?: string
): Promise<NoteType> => {
  try {
    const response = await api.patch(
      `/v1/contacts/${contactId}${
        noteId ? `/note/${noteId}` : ""
      }?company_id=${company_id}`,
      { body: data }
    );
    return response.data;
  } catch (error) {
    console.error("Note update failed:", error);
    throw error;
  }
};

export const deleteNote = async (
  contactId: string,
  company_id: string,
  noteId: string
): Promise<void> => {
  try {
    await api.delete(
      `/v1/contacts/${contactId}/note/${noteId}?company_id=${company_id}`
    );
  } catch (error) {
    console.error("Note deletion failed:", error);
    throw error;
  }
};

// --- TanStack Query Hooks ---

export const useCreateContact = (
  options?: UseMutationOptions<IContact, Error, ICreateContactRequest>
) =>
  useMutation({
    mutationFn: createContact,
    onSuccess: (data: IContact) => {
      console.log("Contact creation successful:", data);
    },
    onError: (error: Error) => {
      console.error("Contact creation failed:", error);
    },
    ...options,
  });

export const useContactById = (contactId: string, companyId: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["contact", "contactId", contactId],
    queryFn: () => getContactById(contactId, companyId),
    enabled: !!contactId && isAuthenticated,
    onSuccess: (data: IContactWithTracking) => {
      console.log("Contact data:", data);
    },
    onError: (error: Error) => {
      console.error("Contact fetch failed:", error);
    },
  } as UseQueryOptions<IContactWithTracking, Error>);
};

export const useUpdateContact = (
  options?: UseMutationOptions<
    IContact,
    Error,
    { contactId: string; data: IUpdateContactRequest }
  >
) =>
  useMutation({
    mutationFn: ({ contactId, data }) => updateContact(contactId, data),
    onSuccess: (data: IContact) => {
      console.log("Contact update successful:", data);
    },
    onError: (error: Error) => {
      console.error("Contact update failed:", error);
    },
    ...options,
  });

export const useUpdateContactJobType = (
  options?: UseMutationOptions<
    IContact,
    Error,
    { contactId: string; company_id: string; job_type: string }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, company_id, job_type }) =>
      updateContactJob(contactId, company_id, job_type),
    onSuccess: (data: IContact) => {
      queryClient.invalidateQueries({ queryKey: ["contact", "contactId"] });
      queryClient.invalidateQueries({ queryKey: ["get-contacts"] });

      queryClient.invalidateQueries({
        queryKey: ["contactIntractionResponse"],
      });
    },
    onError: (error: Error) => {
      console.error("Contact update failed:", error);
    },
    ...options,
  });
};

export const useUpdateContactRevenue = (
  options?: UseMutationOptions<
    IContact,
    Error,
    {
      contactId: string;
      company_id: string;
      revenue: number;
      // data: {
      //   id: string;
      //   revenue: string;
      //   type: string;
      // }[];
      // contactType: string;
    }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, company_id, revenue }) =>
      updateContactRevenue(contactId, company_id, revenue),
    onSuccess: (data: IContact) => {
      queryClient.invalidateQueries({ queryKey: ["contact", "contactId"] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({ queryKey: ["ChannelRevenue"] });
      queryClient.invalidateQueries({ queryKey: ["get-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contactIntractionResponse"],
      });
      console.log("Contact update successful:", data);
    },
    onError: (error: Error) => {
      console.error("Contact update failed:", error);
    },
    ...options,
  });
};
export const useDeleteContact = (
  options?: UseMutationOptions<void, Error, string>
) =>
  useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      console.log("Contact deletion successful");
    },
    onError: (error: Error) => {
      console.error("Contact deletion failed:", error);
    },
    ...options,
  });

export const useNotesByContactId = (contactId: string, companyId: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["notes", contactId, companyId],
    queryFn: () => getNotesByContactId(contactId, companyId),
    enabled: !!contactId && isAuthenticated,
    onSuccess: (data: NoteType[]) => {
      console.log("Notes data:", data);
    },
    onError: (error: Error) => {
      console.error("Notes fetch failed:", error);
    },
  } as UseQueryOptions<NoteType[], Error>);
};

export const useCreateNote = (
  options?: UseMutationOptions<NoteType, Error, CreateNoteVariables>
) => {
  const queryClient = useQueryClient();

  return useMutation<NoteType, Error, CreateNoteVariables>({
    mutationFn: ({ contactId, company_id, data }) =>
      createNote(contactId, company_id, data),

    onSuccess: (note, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", variables.contactId],
      });

      console.log("Note created successfully:", note);
    },

    onError: (error, variables, context) => {
      console.error("Note creation failed:", error);
    },
    ...options,
  });
};

export const useUpdateNote = (
  options?: UseMutationOptions<
    NoteType,
    Error,
    { contactId: string; company_id: string; noteId?: string; data: string }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, company_id, noteId, data }) =>
      updateNote(contactId, company_id, data, noteId),
    onSuccess: (data: NoteType) => {
      queryClient.invalidateQueries({
        queryKey: ["notes"],
      });
    },
    onError: (error: Error) => {
      console.error("Note update failed:", error);
    },
    ...options,
  });
};
export const useDeleteNote = (
  options?: UseMutationOptions<
    void,
    Error,
    { contactId: string; company_id: string; noteId: string }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, company_id, noteId }) =>
      deleteNote(contactId, company_id, noteId),
    onSuccess: () => {
      console.log("Note deletion successful");
      queryClient.invalidateQueries({
        queryKey: ["notes"],
      });
    },
    onError: (error: Error) => {
      console.error("Note deletion failed:", error);
    },
    ...options,
  });
};
export const useGetContactCountsQuery = ({
  company_id,
  date_range,
}: CompanyIdParam & { date_range: string }) => {
  return useQuery({
    queryKey: ["contact-counts", company_id, date_range],
    queryFn: async () => {
      const response = await api.get(`/v1/contacts/${company_id}/summary`, {
        params: { date_range },
      });
      return response.data;
    },
  } as UseQueryOptions<{ contact_count: number; deals_count: number; leads_count: number }, Error>);
};

export const useGetContactsQuery = (
  params: CompanyIdParam & IGetContactsParams
) => {
  return useQuery({
    queryKey: ["get-contacts", params],
    queryFn: async () => {
      const { company_id, ...restParams } = params;

      const response = await api.get(`/v1/contacts/${company_id}/list`, {
        params: normalizedParams(restParams),
      });

      return response.data;
    },
  } as UseQueryOptions<{ items: IContact[] } & PaginationResponse, Error>);
};

export const useGetLandingPagesOptionQuery = ({
  company_id,
}: CompanyIdParam) => {
  return useQuery({
    queryKey: ["get-landing-pages-options", company_id],
    queryFn: async () => {
      const response = await api.get(`/v1/analytics/${company_id}/landing`);

      return response;
    },
  } as UseQueryOptions<{ data: string[] }, Error>);
};

export const useGetJobTypeOptionQuery = ({
  company_id,
  type,
}: {
  company_id: string;
  type: string;
}) => {
  return useQuery<JobTypeResponse, Error>({
    queryKey: ["get-job-type-options", company_id],
    queryFn: async () => {
      const response = await api.get(
        `/v1/contacts/${company_id}/job-types?type=${type}`
      );
      return response.data; // Make sure to return only the data part of the response
    },
  });
};
