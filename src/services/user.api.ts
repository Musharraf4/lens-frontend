import { useAuth } from "@/store/AuthContext";
import {
  AwaitingInvitation,
  ChargeDateResponse,
  CompanyDetail,
  CompanyType,
  NotificationRecipient,
  PlansUserResponse,
  StripeInvoice,
} from "@/types";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from "./api.service";
import { invalidateCompanyQueries } from "@/hooks/useInvalidateCompanyQueries";

export interface User {
  id: string;
  email: string;
}

// --- API Functions ---
export const createUser = (data: any) => api.post("/v1/users", data);

export const addExistingUser = (data: any) =>
  api.post("/v1/companies/access-invitations", data);

export const listUsers = () => api.get("/v1/users");

const fetchCurrentUser = async (): Promise<User> => {
  const response = await api.get("/v1/users/me");
  return response.data;
};

export const getCurrentUser = () => api.get("/v1/users/me");

export const deleteUser = () => api.delete("/v1/users/me");

export const updateCurrentUser = (data: any) => api.patch("/v1/users/me", data);

export const updatePassword = (data: any) =>
  api.patch("/v1/users/update-password", data);

export const updateUser = (userId: string, data: any) =>
  api.patch(`/v1/users/${userId}`, data);

export const attachPayment = (companyId: string, data: any) =>
  api.post(`/v1/companies/${companyId}/billing`, data);

export const inviteUser = (data: any) =>
  api.post(`/v1/users/send-invitation`, data);

export const inviteResponse = (data: any) =>
  api.post(`/v1/users/invitation/respond`, data);

export const pauseAccount = (companyId: string) =>
  api.post(`/v1/companies/${companyId}/subscription/pause`);

export const resumeAccount = (companyId: string) =>
  api.post(`/v1/companies/${companyId}/subscription/resume`);

export const chnageCompanyPlan = (companyId: string, data: any) =>
  api.post(`/v1/companies/${companyId}/subscription/change`, data);

export const updateCompanyUser = (
  companyId: string,
  userId: string,
  data: any
) => api.patch(`/v1/companies/${companyId}/users/${userId}/role`, data);

export const acceptCompanyInvite = (data: any) =>
  api.post(`/v1/companies/access-invitations/accept`, data);

export const getUser = (userId: string) => api.get(`/v1/users/${userId}`);

export const checkPlanUsed = async (
  companyId: string
): Promise<PlansUserResponse> => {
  const response = await api.get(
    `/v1/subscription-plans/companies/${companyId}`
  );
  return response.data;
};

// Update company alerts (email notification preferences)
export interface NotificationPreferencePayload {
  email: string;
  is_notify_form_submission: boolean;
  is_notify_call_scheduled: boolean;
  is_notify_chat_scheduled: boolean;
}

export interface OwnerNotificationSettings {
  is_notify_form_submission: boolean;
  is_notify_call_scheduled: boolean;
  is_notify_chat_scheduled: boolean;
}

export const updateCompanyAlerts = async (
  companyId: string,
  data: OwnerNotificationSettings
) => {
  return api.patch(`/v1/companies/${companyId}/notification-settings`, data);
};

export const getNotificationRecipients = async (
  companyId: string
): Promise<NotificationRecipient[]> => {
  try {
    const response = await api.get(
      `/v1/notification-recipients/?company_id=${companyId}`
    );
    return response.data.items || response.data || [];
  } catch (error) {
    console.error("Fetch notification recipients failed:", error);
    throw error;
  }
};

export const createNotificationRecipients = async (
  companyId: string,
  recipients: Array<
    NotificationPreferencePayload & {
      email: string;
    }
  >
) => {
  return api.post(`/v1/notification-recipients/bulk`, {
    company_id: companyId,
    recipients,
  });
};

export const updateNotificationRecipient = async (
  recipient_id: string,
  data: NotificationPreferencePayload
) => {
  return api.put(`/v1/notification-recipients/${recipient_id}`, data);
};

export const deleteNotificationRecipient = async (recipientId: string) => {
  return api.delete(`/v1/notification-recipients/${recipientId}`);
};

export const getAwaitingUsers = async (): Promise<AwaitingInvitation[]> => {
  try {
    const response = await api.get(
      `/v1/users/awaiting-invite-approval?awaiting_approval=true`
    );
    return response.data.items;
  } catch (error) {
    console.error("waiting-invite-approva fetch failed:", error);
    throw error;
  }
};

export const getCompanyInvoice = async (
  companyId: string
): Promise<StripeInvoice[]> => {
  try {
    const response = await api.get(`/v1/companies/${companyId}/invoices`);
    return response.data.invoices;
  } catch (error) {
    console.error("monthly performance fetch failed:", error);
    throw error;
  }
};

export const getCompaniesChargeDate = async (): Promise<
  ChargeDateResponse[]
> => {
  try {
    const response = await api.get(`/v1/companies/charge-at`);
    return response.data.items;
  } catch (error) {
    console.error("monthly performance fetch failed:", error);
    throw error;
  }
};

export const deleteCompanyUser = (userId: string) =>
  api.delete(`/v1/users/${userId}`);

export const deleteCompaniesUser = (
  companyId: string,
  userId: string,
  invitationId?: string
) =>
  api.delete(`/v1/companies/${companyId}/users/${userId}`, {
    params: {
      ...(invitationId && { invitation_id: invitationId }),
    },
  });

// --- TanStack Query Hooks ---
export const useCreateUser = () => useMutation({ mutationFn: createUser });

export const useAddExistingUser = () =>
  useMutation({ mutationFn: addExistingUser });

export const fetchUserCompanies = async (): Promise<CompanyType[]> => {
  const response = await api.get<{ items: CompanyType[] }>(
    "/v1/users/me/companies"
  );
  return response.data.items;
};

export const useListUsers = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
    enabled: isAuthenticated,
  });
};

export const useCurrentUser = () => {
  const { isAuthenticated } = useAuth();
  return useQuery<User, AxiosError>({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    enabled: isAuthenticated,
    onError: (error: AxiosError) => {
      console.error("Fetch current user failed:", error);
    },
  } as UseQueryOptions<User, AxiosError>);
};

export const useDeleteUser = () => useMutation({ mutationFn: deleteUser });

export const useUpdateCurrentUser = () =>
  useMutation({ mutationFn: updateCurrentUser });

export const useUpdatePassword = () =>
  useMutation({ mutationFn: updatePassword });

export const useUpdateUser = () =>
  useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      updateUser(userId, data),
  });

export const useUpdateCompanyUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      companyId,
      userId,
      data,
    }: {
      companyId: string;
      userId: string;
      data: any;
    }) => updateCompanyUser(companyId, userId, data),
    onSuccess: () => {
      invalidateCompanyQueries(queryClient);
    },
  });
};

export const useAcceptCompanyInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: any }) => acceptCompanyInvite(data),
    onSuccess: () => {
      invalidateCompanyQueries(queryClient);
    },
  });
};

export const useChangeCompanyPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: any }) =>
      chnageCompanyPlan(companyId, data),
    onSuccess: () => {
      invalidateCompanyQueries(queryClient);
    },
  });
};

export const useUpdateCompanyAlerts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: string;
      data: OwnerNotificationSettings;
    }) => updateCompanyAlerts(companyId, data),
    onSuccess: () => {
      invalidateCompanyQueries(queryClient);
    },
  });
};

export const useGetNotificationRecipients = (companyId: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery<NotificationRecipient[]>({
    queryKey: ["notificationRecipients", companyId],
    queryFn: () => getNotificationRecipients(companyId),
    enabled: !!companyId && isAuthenticated,
  });
};

export const useCreateNotificationRecipients = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      companyId,
      recipients,
    }: {
      companyId: string;
      recipients: Array<
        NotificationPreferencePayload & {
          email: string;
        }
      >;
    }) => createNotificationRecipients(companyId, recipients),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["notificationRecipients", variables.companyId],
      });
      invalidateCompanyQueries(queryClient);
    },
  });
};

export const useUpdateNotificationRecipient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      recipient_id,
      data,
    }: {
      recipient_id: string;
      data: NotificationPreferencePayload;
    }) => updateNotificationRecipient(recipient_id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["notificationRecipients", variables.recipient_id],
      });
      invalidateCompanyQueries(queryClient);
    },
  });
};

export const useDeleteNotificationRecipient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recipientId }: { recipientId: string }) =>
      deleteNotificationRecipient(recipientId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["notificationRecipients", variables.recipientId],
      });
      invalidateCompanyQueries(queryClient);
    },
  });
};

export const usePauseAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId }: { companyId: string }) =>
      pauseAccount(companyId),
    onSuccess: () => {
      invalidateCompanyQueries(queryClient);
    },
  });
};

export const useResumeAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId }: { companyId: string }) =>
      resumeAccount(companyId),
    onSuccess: () => {
      invalidateCompanyQueries(queryClient);
    },
  });
};

export const useAttachPaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: any }) =>
      attachPayment(companyId, data),
    onSuccess: () => {
      invalidateCompanyQueries(queryClient);
    },
  });
};

export const useInvitationResponse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: any }) => inviteResponse(data),
    onSuccess: () => {
      invalidateCompanyQueries(queryClient);
    },
  });
};

export const useInviteCompanyUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: any }) => inviteUser(data),
    onSuccess: () => {
      invalidateCompanyQueries(queryClient);
    },
  });
};
export const useGetUser = (userId: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
    enabled: !!userId && isAuthenticated,
  });
};

export const useGetCompnayInvoice = (companyId: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["companyInvoice", companyId],
    queryFn: () => getCompanyInvoice(companyId),
    enabled: !!companyId && isAuthenticated,
  });
};
export const useGetCompaniesChargeDate = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["companyChargeDate"],
    queryFn: () => getCompaniesChargeDate(),
    enabled: isAuthenticated,
  });
};

export const useDeleteCompanyUser = () =>
  useMutation({ mutationFn: (userId: string) => deleteCompanyUser(userId) });

type DeleteCompaniesUserParams = {
  companyId: string;
  userId: string;
  invitationId?: string;
};

export const useDeleteCompaniesUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      userId,
      invitationId,
    }: DeleteCompaniesUserParams) =>
      deleteCompaniesUser(companyId, userId, invitationId),
    onSuccess: () => {
      invalidateCompanyQueries(queryClient);
    },
  });
};
export const useGetCompaniesDetails = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["companyDetails", user?.id],
    queryFn: async () => {
      const response = await api.get(`/v1/companies/details`);
      return response.data.items;
    },
    onError: (error: Error) => {
      console.error("report overview fetch failed:", error);
    },
  } as UseQueryOptions<CompanyDetail[], Error>);
};

export const useGetAwaitingUsers = () => {
  const { isAuthenticated, user } = useAuth();
  return useQuery({
    queryKey: ["awaitingUsers", user?.id],
    queryFn: () => getAwaitingUsers(),
    enabled: isAuthenticated,
  });
};

export const useCheckPlanUsed = (companyId: string) => {
  const { isAuthenticated } = useAuth();

  return useQuery<PlansUserResponse>({
    queryKey: ["checkPlanUsed", companyId],
    queryFn: () => checkPlanUsed(companyId),
    enabled: !!companyId && isAuthenticated,
  });
};
