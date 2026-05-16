import React, { ReactNode } from "react";
import { Role } from "./enums";

// Sidebar related interfaces
export interface SidebarItem {
  title: string;
  icon?: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
}
export type CompanyType = {
  company: {
    id: string;
    name: string;
    website: string;
    created_at: string; // ISO timestamp
    plan?: string;
  };
  owner_notification_settings?: {
    is_notify_form_submission: boolean;
    is_notify_call_scheduled: boolean;
    is_notify_chat_scheduled: boolean;
  };
  notification_recipients?: NotificationRecipient[];
  role: string;
  association: string;
  linked_at: string; // ISO timestamp
  subscription_status: SubscriptionStatus;
  master_agency_email?: string | null;
};

export interface NotificationRecipient {
  email: string;
  id?: string;
  is_notify_form_submission: boolean;
  is_notify_call_scheduled: boolean;
  is_notify_chat_scheduled: boolean;
  notify_call_scheduled?: boolean;
  notify_chat_scheduled?: boolean;
  notify_form_scheduled?: boolean;
}

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "canceled"
  | "past_due"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export type ChargeDateResponse = {
  charge_at: string | null;
  company_id: string;
};
export type StripeInvoice = {
  id: string;
  number: string;
  status: string;
  currency: string;
  subtotal: number;
  total: number;
  amount_paid: number;
  amount_remaining: number;
  billing_reason:
    | "manual"
    | "subscription_create"
    | "subscription_cycle"
    | "subscription_update"
    | "subscription"
    | "upcoming"
    | "subscription_threshold";
  hosted_invoice_url: string;
  invoice_pdf: string;
  payment_intent_id: string | null;
  charge_id: string | null;
  created: string;
  due_date: string | null;
  period_start: string;
  period_end: string;
  plan: PlanDetail;
};

export type PlanDetail = {
  id: string;
  name: string;
  nickname?: string;
  product_name: string;
  interval: string; // Stripe standard intervals
  amount_cents: number;
  currency: string;
  is_custom: boolean;
};

type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
};

type StripeInfo = {
  customer_id: string | null;
  subscription_id: string | null;
  latest_invoice_id: string | null;
  default_payment_method: PaymentMethod | null;
};

export type SubscriptionData = {
  status: string;
  plan: PlanDetail;
  trial_end: string;
  current_period_end: string | null;
  stripe: StripeInfo;
};

export type CompanyDetail = {
  id: string; // UUID
  name: string;
  website: string;
  industry: string;
  company_size: string;
  currency: string;
  stripe_customer_id: string | null;
  plan: string;
  created_at: string;
  updated_at: string;
  config: any[]; // adjust this if config structure is known
  user_links: any[];
  attachments: any[]; // adjust this if attachments have structure
  billing: SubscriptionData;
};
export interface PlanLimits {
  crm: string;
  roi: string;
  users: number;
  support: string;
  sync_clio: boolean;
  ai_insights: boolean;
  call_minutes: number;
  tracking_numbers: number;
  multiple_integrations: boolean;
}

export interface Plan {
  plan_id: string; // ✅ UUID of plan
  plan_key: string;
  plan_name: string;
  price_key: string;
  interval: string;
  amount_cents: number;
  compare_at_cents: number | null;
  trial_days: number;
  limits: PlanLimits;
  nickname: string;
}

type Usage = {
  call_minutes_used: number;
  integrations_active: number;
  users_active: number;
  tracking_numbers_used: number;
};

type Allowed = {
  call_minutes: boolean;
  integrations: boolean;
  tracking_numbers: boolean;
  users: boolean;
};

type Period = {
  current_period_start: string; // ISO date string
  current_period_end: string | null;
};

export interface PlansUserResponse {
  company_id: string;
  subscription_status: SubscriptionStatus;
  plan: Plan;
  limits: PlanLimits;
  usage: Usage;
  allowed: Allowed;
  period: Period;
}

export interface SidebarProps {
  mainItems: SidebarItem[];
  utilityItems: SidebarItem[];
}

// User related interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

// Home page component interfaces
export interface DateSelectorProps {
  selected: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  additional?: boolean;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  bgColor?: string;
  textColor?: string;
  icon?: React.ReactNode;
}

export interface InfoCardProps {
  title: string;
  value: string;
  highlight?: string;
}

export interface ToggleButtonProps {
  options: { label: string; icon: ReactNode }[];
  selectedOption: string;
  onSelect: (option: string) => void;
  className?: string;
}

export interface IntegrationCardProps {
  title: string;
}

export interface NoticeProps {
  count: string;
  message: string;
}
export interface DateSelectorProps {
  selected: string;
  onChange: (value: string) => void;
}
export interface ChartData {
  month: string;
  traffic: number;
  leads: number;
  sales: number;
  deals: number;
  revenue: number;
  [key: string]: number | string; // This allows dynamic access to known properties
}

export interface ChartDataBase {
  month: string;
  leads: number;
  deals: number;
}

// Content related interfaces
export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  tags: string[];
  publishedAt: Date;
  status: "draft" | "published" | "archived";
  metadata: PostMetadata;
}

export interface PostMetadata {
  readTime: number;
  views: number;
  likes: number;
  lastModified: Date;
}

// API Response interfaces
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
}

// Store related interfaces
export interface AppState {
  user: UserState;
  posts: PostsState;
  ui: UIState;
}

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface PostsState {
  items: Post[];
  loading: boolean;
  error: string | null;
}

export interface UIState {
  theme: "light" | "dark";
  language: string;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  timestamp: Date;
}

// Component Props interfaces
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "outline" | "ghost" | "link" | "dark";
  size?: "default" | "sm" | "lg" | "icon";
}

// Context Types
export interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
}

export interface AppContextType {
  state: AppState;
  updateUser: (user: User | null) => void;
  addPost: (post: Post) => void;
  setTheme: (theme: "light" | "dark") => void;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ) => void;
  removeNotification: (id: string) => void;
}

// State Types
export interface AppState {
  user: UserState;
  posts: PostsState;
  ui: UIState;
}

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface PostsState {
  items: Post[];
  loading: boolean;
  error: string | null;
}

export interface UIState {
  theme: "light" | "dark";
  language: string;
  notifications: Notification[];
}

export interface BotCardProps {
  id: string;
  image: string;
  avatarImage: string;
  chatbotMessage: string;
  siteLink: string;
  topics: Topic[];
  isActive?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: (isActive: boolean) => void;
  onClick?: () => void;
  botData?: Bot;
  index: number;
}
// Data Models
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  profile?: UserProfile;
}
// In RevenueChartProps interface
export interface RevenueChartProps {
  title?: string | React.ReactNode;
  icons?: Array<{
    id: string;
    icon: React.ElementType;
    text?: string;
    activeControl?: string;
  }>;
  lineGradientStart?: string;
  lineGradientMid?: string;
  lineGradientEnd?: string;
  fillGradient?: string;
  trendUpColor?: string;
  helpIcon?: boolean;
  helpTooltip?: string;
  trendDownColor?: string;
  totalRevenue?: {
    amount: number;
    change: number;
    trend: "up" | "down" | "neutral";
    otherAmount?: number;
    otherChange?: number;
    otherData?: number[];
  };
}
export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  tags: string[];
  publishedAt: Date;
  status: "draft" | "published" | "archived";
  metadata: PostMetadata;
}

export interface PostMetadata {
  readTime: number;
  views: number;
  likes: number;
  lastModified: Date;
}

export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  timestamp: Date;
}

// API Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends ApiResponse<AuthTokens> {
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
}
export interface SidebarItem {
  title: string;
  icon?: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
}

export interface SidebarProps {
  mainItems: SidebarItem[];
  utilityItems: SidebarItem[];
}

// Tracking related interfaces

export interface TrackingRecord {
  id: string;
  name: string;
  source: string;
  trackingNumber: string;
  callRecording: boolean;
  status: boolean;
  forwardTo: string;
  type: string;
}

export type CompanyIdParam = { company_id?: string };

export interface ActiveFilter {
  name: string;
  value: string | number | (string | number)[];
}

export type Metric = {
  value?: string | number | null;
  change?: string | number | null;
};

export type PaginationResponse = {
  total: number;
  page: number;
  size: number;
  pages: number;
};

export type CompanyUser = {
  created_at: string;
  email: string;
  first_activity: string;
  id: string;
  last_activity: string;
  name: string;
  role: Role;
  invitation_id?: string | null;
  status?: "SENT" | "ACCEPTED" | "DECLINED" | null;
};
export type CompanyDetails = {
  industry: string;
  company_size: string;
  website: string;
  id: string;
  name: string;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
  users: CompanyUser[];
  billing: SubscriptionData;
};

export type AwaitingInvitation = {
  invitation_id: string; // UUID
  company_id: string; // UUID
  company_name: string;
  role: string;
  username: string;
  is_new_user: boolean;
  sender_name: string;
  sender_email: string;
  status: "SENT" | "ACCEPTED" | "DECLINED"; // You can expand this as needed
  sent_at: string; // ISO date string
  expired_at: string; // ISO date string
};

interface TypeConfig {
  key: string;
  yes_label: string;
  no_label: string;
}

interface ChatConfig {
  type: "binary"; // or extend it if other types are possible
  type_config: TypeConfig;
  position:
    | "center_top"
    | "center_bottom"
    | "top_left"
    | "top_right"
    | "bottom_left"
    | "bottom_right"
    | string; // specify other possible values if needed
  action: string;
  delay_sec: number;
  id: string;
  user_response: string | null;
}

export interface Bot {
  name: string;
  photo_url: string;
  background_image_url: string;
  theme_colour_hex: string;
  gradient: Record<string, any>; // adjust if you know the gradient structure
  greeting_message: string;
  first_message: string;
  last_message: string;
  first_dialog_url: string;
  last_dialog_url: string;
  follow_up_email_template: string;
  follow_up_sms_template: string;
  follow_up_email_incomplete_template: boolean;
  follow_up_sms_incomplete_template: boolean;
  follow_up_emails: boolean;
  follow_up_sms: boolean;
  position: "bottom_left" | "bottom_right" | "top_left" | "top_right" | string; // define more if needed
  domain_url: string;
  company_id: string;
  contact_info: string | null;
  id: string;
  created_at: string; // ISO date string
  updated_at: string;
  created_by_id: string;
  updated_by_id: string;
  status: "active" | "inactive" | string;
  topics: Topic[];
  bot_popup: ChatConfig;
}

export interface Topic {
  name: string;
  order: number;
  questions: Question[];
  id: string;
}

export interface Question {
  text: string;
  type: "text" | "multiple_choice" | "number" | string;
  order: number;
  options: string[];
}
