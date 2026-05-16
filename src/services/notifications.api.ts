import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import api from "./api.service";

const BASE = "/v1/activity-notifications";

export type NotificationEventType =
  | "chat_activity"
  | "form_submission"
  | "call_recording"
  | "lead_converted"
  | "integration_connected"
  | "integration_disconnected"
  | "integration_primary_set"
  | "generic"
  | "phone_number_created"
  | "phone_number_deleted"
  | "deal_created";

export type NotificationEventKeyType =
  | "chatbot_deleted"
  | "chatbot_created"
  | "new_account"
  | "account_added";

export interface NotificationDelivery {
  id: string;
  notification_id: string;
  recipient_id: string;
  user_id: string | null;
  is_read: number;
  read_at: string | null;
  is_dismissed: number;
  created_at: string;
}

export interface NotificationMetaData {
  name?: string;
  form_tracking_id?: string;
  contact_id?: string;
  visitor_session_id?: string;
  url?: string;
  source?: string;
  medium?: string | null;
  campaign?: string | null;
  keywords?: string | null;
  channel?: string;
  revenue?: number;
  chatId?: string;
  lastMessage?: string;
  phone?: string;
  callDuration?: string;
  recordingUrl?: string;
  customerId?: string;
  conversionValue?: number;
  integration_name?: string;
  user_email?: string;
  requested_by_name?: string;
  requested_by_email?: string;
  integration_config_id?: string;
  chatbot_name?: string;
  invited_email?: string;
  role?: string;
  user_name?: string;
  phone_number_name?: string;
  company_name?: string;
}

export interface NotificationItem {
  id: string;
  company_id: string;
  contact_id: string;
  event_type: NotificationEventType;
  event_key: NotificationEventKeyType;
  entity_table: string;
  entity_id: string;
  title: string;
  message: string;
  meta_data: NotificationMetaData;
  status: "unread" | "read";
  priority: number;
  created_at: string;
  updated_at: string;
  deliveries: NotificationDelivery[];
}

export interface NotificationsListResponse {
  items: NotificationItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface GetNotificationsParams {
  companyId: string;
  page?: number;
  size?: number;
  status?: "unread" | "read" | "all";
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export type DisplayNotificationType =
  | "lead_form"
  | "lead_chat"
  | "lead_call"
  | "integration_connected"
  | "integration_disconnected"
  | "integration_primary_set"
  | "chatbot_deleted"
  | "chatbot_created"
  | "account_added"
  | "phone_number_created"
  | "phone_number_deleted"
  | "new_account"
  | "lead_conversion";

export interface DisplayNotification {
  id: string;
  name: string;
  date: string;
  message: string;
  detailLine?: string | null;
  chips?: string[];
  is_read: boolean;
  contact_id: string;
  type: DisplayNotificationType;
  notificationId: string;
  companyId: string;
  channel?: string;
}

export interface UnreadNotificationsResponse {
  company_id: string;
  unread_count: number;
}

export const getNotifications = async (
  params: GetNotificationsParams
): Promise<NotificationsListResponse> => {
  const { companyId, ...queryParams } = params;
  const response = await api.get<NotificationsListResponse>(
    `${BASE}/${companyId}`,
    {
      params: queryParams,
    }
  );
  return response.data;
};

export const getUnreadNotificationsCount = async (
  companyId: string
): Promise<UnreadNotificationsResponse> => {
  const response = await api.get<UnreadNotificationsResponse>(
    `${BASE}/${companyId}/unread-count`
  );
  return response.data;
};

export const markNotificationAsRead = async (
  notificationId: string,
  companyId: string
): Promise<void> => {
  await api.post(`${BASE}/${companyId}/${notificationId}/read`);
};

export const markAllNotificationsAsRead = async (
  companyId: string
): Promise<void> => {
  await api.post(`${BASE}/${companyId}/mark-all-read`, { is_all_read: true });
};

// --- TanStack Query Hooks ---
export const useNotifications = (
  params: GetNotificationsParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["notifications", enabled, params],
    queryFn: () => getNotifications(params),
    enabled: enabled && !!params.companyId,
    keepPreviousData: true,
  } as UseQueryOptions<NotificationsListResponse, Error>);
};

export const useUnreadNotificationsCount = (
  companyId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["notifications-unread-count", companyId],
    queryFn: () => getUnreadNotificationsCount(companyId),
    enabled: enabled && !!companyId,
    staleTime: 30_000,
  } as UseQueryOptions<UnreadNotificationsResponse, Error>);
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      notificationId,
      companyId,
    }: {
      notificationId: string;
      companyId: string;
    }) => markNotificationAsRead(notificationId, companyId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count", variables.companyId],
      });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId }: { companyId: string }) =>
      markAllNotificationsAsRead(companyId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count", variables.companyId],
      });
    },
  });
};
