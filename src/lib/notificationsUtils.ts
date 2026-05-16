import {
  DisplayNotification,
  DisplayNotificationType,
  NotificationItem,
} from "@/services/notifications.api";
import { capitalizeFirstChar } from "./utils";

export const formatCurrency = (value?: number): string | null => {
  if (typeof value !== "number") {
    return null;
  }
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

export const getHostName = (url?: string | null): string | null => {
  if (!url) return null;
  try {
    const hostname = new URL(url).hostname;
    return hostname.startsWith("www.")
      ? hostname.replace("www.", "")
      : hostname;
  } catch {
    return null;
  }
};

export const formatNotificationDate = (
  isoDate: string
): { date: string; time: string } => {
  const dateObj = new Date(isoDate);

  return {
    date: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
    }).format(dateObj),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(dateObj),
  };
};

export const notificationTypeCopy: Record<DisplayNotificationType, string> = {
  lead_form: "submitted a new contact form",
  lead_chat: "communicated via chat",
  lead_call: "called your business number",
  lead_conversion: "contact converted into a deal",
  integration_connected: "connected an integration",
  integration_disconnected: "disconnected an integration",
  integration_primary_set: "set an integration as primary",
  chatbot_deleted: "deleted a chatbot",
  chatbot_created: "created a new chatbot",
  account_added: "sent an account invitation",
  phone_number_created: "added a phone number",
  phone_number_deleted: "deleted a phone number",
  new_account: "created a new account",
};

export const notificationTypeColorMap: Record<DisplayNotificationType, string> =
  {
    lead_form: "#F259FF",
    lead_chat: "#62D8FE",
    lead_call: "#866FFA",
    lead_conversion: "#8EE68A",
    integration_connected: "#8EE68A",
    integration_disconnected: "#FF6E6E",
    integration_primary_set: "#62D8FE",
    chatbot_deleted: "#FF6E6E",
    chatbot_created: "#8EE68A",
    account_added: "#62D8FE",
    phone_number_created: "#8EE68A",
    phone_number_deleted: "#FF6E6E",
    new_account: "#62D8FE",
  };

const mapEventTypeToDisplayType = (
  eventType: NotificationItem["event_type"] | NotificationItem["event_key"]
): DisplayNotificationType => {
  switch (eventType) {
    case "form_submission":
      return "lead_form";
    case "chat_activity":
      return "lead_chat";
    case "call_recording":
      return "lead_call";
    case "lead_converted":
    case "deal_created":
      return "lead_conversion";
    case "integration_connected":
      return "integration_connected";
    case "integration_disconnected":
      return "integration_disconnected";
    case "integration_primary_set":
      return "integration_primary_set";
    case "chatbot_created":
      return "chatbot_created";
    case "chatbot_deleted":
      return "chatbot_deleted";
    case "account_added":
      return "account_added";
    case "phone_number_created":
      return "phone_number_created";
    case "phone_number_deleted":
      return "phone_number_deleted";
    case "new_account":
      return "account_added";
    default:
      return "lead_form";
  }
};

export const buildNotificationDetailLine = (
  notification: NotificationItem
): string | null => {
  const meta = notification.meta_data ?? {};
  const channel =
    capitalizeFirstChar(meta.channel ?? meta.source ?? "website") ?? "Website";
  const host = getHostName(meta.url);
  switch (notification.event_type) {
    case "form_submission": {
      if (host) {
        return `Submitted via ${channel} on ${host}`;
      }
      return `Submitted via ${channel}`;
    }
    case "chat_activity": {
      return `New chat conversation via ${channel}`;
    }
    case "call_recording": {
      if (meta.callDuration && meta.phone) {
        return `Call from ${meta.phone} lasting ${meta.callDuration}`;
      }
      if (meta.callDuration) {
        return `Call duration ${meta.callDuration}`;
      }
      if (meta.phone) {
        return `Call from ${meta.phone}`;
      }
      return "New call activity";
    }
    case "lead_converted":
    case "deal_created": {
      const value = formatCurrency(meta.revenue);
      if (meta.contact_id && value) {
        return `Converted deal worth ${value}`;
      }
      if (meta.customerId) {
        return `Converted deal ${meta.customerId}`;
      }
      if (value) {
        return `Case value ${value}`;
      }
      return "Lead converted to customer";
    }
    case "integration_connected": {
      return `A new ${capitalizeFirstChar(
        meta.integration_name?.replace(/_/g, " ") || "integration"
      )} account ${
        meta.user_email || "an integration"
      } integrated successfully.`;
    }
    case "integration_disconnected": {
      return `${
        meta.user_email || "An integration"
      } has disconnected from the ${capitalizeFirstChar(
        meta.integration_name?.replace(/_/g, " ") || "integration"
      )}.`;
    }
    case "integration_primary_set": {
      return `${
        meta.user_email || "An integration"
      } has set the as primary account in  ${capitalizeFirstChar(
        meta.integration_name?.replace(/_/g, " ") || "integration"
      )}.`;
    }
    case "phone_number_created": {
      return `A new phone number named "${
        meta.phone_number_name || "Unnamed"
      }" has been added.`;
    }
    case "phone_number_deleted": {
      return `The phone number named "${
        meta.phone_number_name || "Unnamed"
      }" has been deleted.`;
    }
    case "generic": {
      if (notification.event_key === "chatbot_deleted") {
        return `A chatbot named "${
          meta.chatbot_name || "Unnamed"
        }" has been deleted.`;
      } else if (notification.event_key === "chatbot_created") {
        return `A new chatbot named "${
          meta.chatbot_name || "Unnamed"
        }" has been created.`;
      } else if (notification.event_key === "account_added") {
        return `An account invitation sent to ${
          meta.invited_email || "an unknown user"
        } as a ${meta.role || "member"}.`;
      } else if (notification.event_key === "new_account") {
        return `A new account ${meta.company_name || ""} created.`;
      } else {
        return null;
      }
    }
    default:
      return null;
  }
};

export const buildNotificationChips = (
  notification: NotificationItem
): string[] => {
  const meta = notification.meta_data ?? {};
  const chips: string[] = [];
  switch (notification.event_type) {
    case "form_submission":
      if (meta.source)
        chips.push(`Source: ${capitalizeFirstChar(meta.source)}`);
      if (meta.channel)
        chips.push(`Channel: ${capitalizeFirstChar(meta.channel)}`);
      // if (meta.campaign) chips.push(`Campaign: ${meta.campaign}`);
      break;
    case "chat_activity":
      if (meta.chatId) chips.push(`Chat ID: ${meta.chatId}`);
      break;
    case "call_recording":
      if (meta.phone) chips.push(`Caller: ${meta.phone}`);
      if (meta.recordingUrl) chips.push("Recording available");
      break;
    case "lead_converted":
    case "deal_created":
      if (meta.customerId) chips.push(`Customer: ${meta.customerId}`);
      if (meta.conversionValue) {
        const formatted = formatCurrency(meta.conversionValue);
        if (formatted) chips.push(`Value: ${formatted}`);
      }
      break;
    case "integration_connected":
      if (meta.user_email) chips.push(`Connected by: ${meta.user_email}`);
      break;
    case "integration_disconnected":
      if (meta.user_email) chips.push(`Disconnected by: ${meta.user_email}`);
      break;
    default:
      break;
  }
  return chips;
};

export const transformNotification = (
  apiNotification: NotificationItem
): DisplayNotification => {
  const eventType =
    apiNotification.event_type === "generic"
      ? apiNotification.event_key
      : apiNotification.event_type;
  const displayType = mapEventTypeToDisplayType(eventType);

  const isIntegrationEvent = [
    "connected",
    "primary",
    "chatbot",
    "account",
  ].some((type) => displayType.includes(type));

  const isPhoneEvent = displayType.includes("phone_number");

  const name = apiNotification?.meta_data?.name
    ? apiNotification.meta_data.name
    : isIntegrationEvent
    ? apiNotification?.meta_data?.requested_by_name || "An Integration"
    : isPhoneEvent
    ? apiNotification?.meta_data?.user_name || "A User"
    : "A Visitor";
  const isRead = apiNotification.status === "read";
  return {
    id: apiNotification.id,
    name,
    date: apiNotification.created_at,
    message: apiNotification.message,
    detailLine: buildNotificationDetailLine(apiNotification),
    chips: buildNotificationChips(apiNotification),
    is_read: isRead,
    contact_id: apiNotification.contact_id,
    type: mapEventTypeToDisplayType(eventType),
    notificationId: apiNotification.id,
    companyId: apiNotification.company_id,
    channel:
      apiNotification.meta_data.channel ||
      apiNotification.meta_data.source ||
      apiNotification.meta_data.integration_name,
  };
};
