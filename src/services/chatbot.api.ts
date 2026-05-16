import api from "./api.service";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

export const defaultTopics = [
  { id: "topic-1", name: "Car Accident", position: 0 },
  { id: "topic-2", name: "Bike Accident", position: 1 },
  { id: "topic-3", name: "Animal Bite", position: 2 },
  { id: "topic-4", name: "Workers' Compensation", position: 3 },
  { id: "topic-5", name: "Wrongful Death", position: 4 },
  { id: "topic-6", name: "Other Injuries", position: 5 },
];

// -------------------- List Response Types --------------------
export interface IPaginatedListResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface IListParams {
  page?: number;
  size?: number;
  company_id?: string;
}

export const defaultQuestions = [
  {
    id: "question-1",
    topicId: "topic-1",
    text: "Did you suffer any injuries or are you experiencing pain from the accident?",
    answerType: "text",
    position: 0,
    answers: [],
  },
  {
    id: "question-2",
    topicId: "topic-1",
    text: "What kind of medical care have they received so far? Scroll down & select all that apply.",
    answerType: "text",
    position: 0,
    answers: [],
  },
  {
    id: "question-3",
    topicId: "topic-1",
    text: "Are there any other details you would like us to know?",
    answerType: "text",
    position: 0,
    answers: [],
  },
  {
    id: "question-4",
    topicId: "topic-1",
    text: "What kind of medical care have you received so far? Scroll down & select all that apply.",
    answerType: "text",
    position: 0,
    answers: [],
  },
  {
    id: "question-5",
    topicId: "topic-1",
    text: "And the city?",
    answerType: "text",
    position: 0,
    answers: [],
  },
  {
    id: "question-6",
    topicId: "topic-1",
    text: "When did the accident occur?",
    answerType: "text",
    position: 0,
    answers: [],
  },
  {
    id: "question-7",
    topicId: "topic-1",
    text: "Did they receive medical treatment for their injuries?",
    answerType: "text",
    position: 0,
    answers: [],
  },
  {
    id: "question-8",
    topicId: "topic-1",
    text: "Did you receive medical treatment for your injuries?",
    answerType: "text",
    position: 0,
    answers: [],
  },
  {
    id: "question-9",
    topicId: "topic-1",
    text: "What are their injuries or where are they experiencing pain? Scroll down & select all that apply.",
    answerType: "text",
    position: 0,
    answers: [],
  },
  {
    id: "question-10",
    topicId: "topic-1",
    text: "What are your injuries or where are you experiencing pain? Scroll down & select all that apply.",
    answerType: "text",
    position: 0,
    answers: [],
  },
  {
    id: "question-2",
    topicId: "topic-2",
    text: "Did you receive medical treatment for your injuries?",
    answerType: "text",
    position: 1,
    answers: [],
  },
  {
    id: "question-1",
    topicId: "topic-3",
    text: "What kind of medical care have you received so far? Scroll down & select all that apply.",
    answerType: "text",
    position: 1,
    answers: [],
  },
  {
    id: "question-1",
    topicId: "topic-4",
    text: "Did you seek medical care?",
    answerType: "text",
    position: 1,
    answers: [],
  },
  {
    id: "question-1",
    topicId: "topic-5",
    text: "What is your relationship with the person who passed?",
    answerType: "text",
    position: 1,
    answers: [],
  },
  {
    id: "question-1",
    topicId: "topic-6",
    text: "Are there any other details you would like us to know?",
    answerType: "text",
    position: 1,
    answers: [],
  },
];
// Transform API response to ChatbotBuilderContext format
export const transformBotDataForBuilder = (apiData: any) => {
  return {
    // General settings
    publishInfo: {
      mainDomain: apiData.domain_url || "",
    },
    userInfoInputs: {
      collectEmail: apiData.user_input_settings?.email || false,
      collectPhone: apiData.user_input_settings?.phone || false,
      collectName: apiData.user_input_settings?.name || false,
      collectCompany: false, // Default value since not in API response
      emailRequired: apiData.user_input_settings?.email_required || false,
      askPermission: apiData.user_input_settings?.ask_msg_permission || false,
      otherFields: [], // Initialize empty array to prevent undefined error
    },

    // Questionnaire settings
    firstLastMessages: {
      firstMessage: apiData.first_message || "",
      lastMessage: apiData.last_message || "",
      firstDialogVideo: apiData.first_dialog_url || "",
      lastDialogVideo: apiData.last_dialog_url || "",
      firstDialogFileName: apiData.first_dialog_url || "", // Default value
      lastDialogFileName: apiData.last_dialog_url || "", // Default value
    },

    // Transform topics and questions
    topics:
      apiData.topics?.map((topic: any, index: number) => ({
        id: topic.id || `topic-${index}`,
        name: topic.name || "",
        position: topic.order - 1, // Convert 1-based to 0-based
      })) || [],

    questions:
      apiData.topics?.flatMap(
        (topic: any) =>
          topic.questions?.map((question: any, qIndex: number) => ({
            id: `question-${topic.id}-${qIndex}`,
            topicId: topic.id,
            text: question.text || "",
            answerType: question.type || "text",
            position: question.order, // Convert 1-based to 0-based
            answers:
              question.options?.map((option: string, aIndex: number) => ({
                id: `answer-${topic.id}-${qIndex}-${aIndex}`,
                text: option,
              })) || [],
          })) || []
      ) || [],

    // Detailed settings
    followUpMessages: {
      enableEmailFollowUp: apiData.follow_up_emails,
      enableSMSFollowUp: apiData.follow_up_sms,
      emailFollowUpMessage: apiData.follow_up_email_template, // Default value
      smsFollowUpMessage: apiData.follow_up_sms_template, // Default value
      messageForIncompleteEmail: apiData.follow_up_email_incomplete_template, // Default value
      messageForIncompleteSMS: apiData.follow_up_sms_incomplete_template, // Default value
    },

    // Appearance settings
    botAppearance: {
      botName: apiData.name || "",
      botPhoto: apiData.photo_url || "",
      photoType: apiData.photo_url ? "custom" : "default",
      greeting: apiData.greeting_message || "",
      themeColor: apiData.theme_colour_hex || "#3b82f6",
      position: apiData.position?.replace("_", "-") || "bottom-right",
      themeType: apiData.gradient?.color1 ? "gradient" : "solid", // Default value
      gradientColor: apiData.gradient
        ? {
            color1: apiData.gradient.color1 || "",
            color2: apiData.gradient.color2 || "",
          }
        : null,
      botPreviewPhoto: apiData.background_image_url || "",
    },

    // Popup config
    popupConfig: {
      enabled: !!apiData.bot_popup,
      type:
        apiData.bot_popup?.type === "binary"
          ? "binary_question"
          : "contact_options",
      message:
        apiData.bot_popup?.type_config?.key ||
        "Would you like to continue receiving help in chat?",
      positiveResponse:
        apiData.bot_popup?.type_config?.yes_label || "Yes, start chat",
      negativeResponse:
        apiData.bot_popup?.type_config?.no_label || "No, thanks",
      delaySeconds: apiData.bot_popup?.delay_sec || 10,
      position: apiData.bot_popup?.position || "center_center",
      trigger: "delay", // Default value
    },
  };
};

// Upload image attachment
export const uploadAttachment = async (file: File, type: string = "image") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("attachment_type", type);

  const response = await api.post("/v1/attachments", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Get all lead concierges
export const getAllLeadConcierge = async (
  company_id: string,
  params?: IListParams
): Promise<IPaginatedListResponse<any>> => {
  const page = params?.page ?? 1;
  const size = params?.size ?? 10;
  const response = await api.get(
    `/v1/chatbots?company_id=${company_id}&page=${page}&size=${size}`
  );
  return response.data as IPaginatedListResponse<any>;
};

export const getCompanyDomains = async (company_id: string) => {
  const response = await api.get(`/v1/chatbots/domains/${company_id}`);
  return response.data;
};

// Check if a chatbot can be created for the given company and domain
export const checkChatbotDomainAvailability = async (
  company_id: string,
  domain_url: string
): Promise<{ available: boolean }> => {
  const response = await api.post(`/v1/chatbots/domain-available`, {
    company_id,
    domain: domain_url,
  });
  return response.data;
};

// Get all lead concierges drafts
export const getAllDrafts = async (
  params?: IListParams
): Promise<IPaginatedListResponse<any>> => {
  const page = params?.page ?? 1;
  const size = params?.size ?? 10;
  const company_id = params?.company_id ?? "";
  const response = await api.get(
    `/v1/chatbots/draft?page=${page}&size=${size}&company_id=${company_id}`
  );
  return response.data as IPaginatedListResponse<any>;
};

// Create lead concierge
export const createLeadConcierge = async (payload: any) => {
  const response = await api.post("/v1/chatbots", payload);
  return response.data;
};

// Get lead concierge by ID
export const getLeadConcierge = async (id: string) => {
  const response = await api.get(`/v1/chatbots/${id}`);
  return response.data;
};

// Update lead concierge
export const updateLeadConcierge = async (id: string, payload: any) => {
  const response = await api.put(`/v1/chatbots/${id}`, payload);
  return response.data;
};
// Update  status lead concierge
export const updateLeadConciergeStatus = async (id: string, status: string) => {
  const response = await api.patch(`/v1/chatbots/${id}`, { status });
  return response.data;
};

// Delete lead concierge
export const deleteLeadConcierge = async (id: string) => {
  const response = await api.delete(`/v1/chatbots/${id}`);
  return response.data;
};

// Delete Draft concierge
export const deleteDraftConcierge = async (id: string) => {
  const response = await api.delete(`/v1/chatbots/drafts/${id}`);
  return response.data;
};

// Get chatbot draft by ID
export const getChatbotDraftById = async (id: string) => {
  const response = await api.get(`/v1/chatbots/drafts/${id}`);
  return response.data;
};

// Save draft
export const saveDraft = async (payload: {
  flow_tab_name: string;
  step_name: string;
  step_number: number;
  total_steps: number;
  data: any;
}) => {
  const response = await api.post("/v1/chatbots/draft", payload);
  return response.data;
};

// Update existing draft by ID
export const updateDraft = async (
  id: string,
  payload: {
    flow_tab_name: string;
    step_name: string;
    step_number: number;
    total_steps: number;
    data: any;
  }
) => {
  const response = await api.put(`/v1/chatbots/drafts/${id}`, payload);
  return response.data;
};

// --- TanStack Query Hooks ---

// Get all lead concierges
export const useGetAllLeadConcierge = (
  companyId: string,
  params?: IListParams
) => {
  return useQuery({
    queryKey: ["leadConcierges", companyId, params],
    queryFn: () => getAllLeadConcierge(companyId, params),
  });
};

// Get all domains
export const useGetAllDomains = (companyId: string) => {
  return useQuery({
    queryKey: ["domains", companyId],
    queryFn: () => getCompanyDomains(companyId),
  });
};

export const useGetAllDrafts = (params?: IListParams) => {
  return useQuery({
    queryKey: ["leadDrafts", params],
    queryFn: () => getAllDrafts(params),
  });
};

// Transform draft API data to builder initial state and resume info
export const transformDraftToBuilder = (draft: any) => {
  const d = draft?.data || {};
  return {
    initialData: {
      selectedDevice: "web",
      botAppearance: {
        botName: d.name || "",
        botPhoto: d.photo_url || null,
        botPreviewPhoto: d.background_image_url || null,
        photoType: d.photo_url ? "custom" : "default",
        greeting: d.greeting_message || "",
        position: (d.position || "bottom_right").replace("_", "-"),
        themeType: "solid",
        themeColor: d.theme_colour_hex || "#2C54BB",
        gradientColor: "",
      },
      popupConfig: d.popup
        ? {
            enabled: true,
            type: (d.popup.type === "binary"
              ? "binary_question"
              : d.popup.type) as any,
            message: d.popup.type_config?.key || "",
            positiveResponse: d.popup.type_config?.yes_label || "",
            negativeResponse: d.popup.type_config?.no_label || "",
            trigger: "delay",
            delaySeconds: d.popup.delay_sec || 10,
            position: d.popup.position || "center_center",
          }
        : {
            enabled: false,
            type: "binary_question",
            message: "Would you like to continue receiving help in chat?",
            positiveResponse: "Yes, start chat",
            negativeResponse: "No, thanks",
            trigger: "delay",
            delaySeconds: 10,
            position: "center_center",
          },
      topics: (d.topics || []).map((t: any, idx: number) => ({
        id: t.id || String(idx),
        name: t.name,
        position: (t.order ?? idx) - 1,
      })),
      questions: (d.topics || []).flatMap((topic: any, tIdx: number) =>
        (topic.questions || []).map((q: any, qIdx: number) => ({
          id: `question-${topic.id}-${qIdx}`,
          topicId: topic.id || String(tIdx),
          text: q.text || "",
          answerType: q.type || "text",
          position: (q.order ?? qIdx) - 1,
          answers: (q.options || []).map((opt: string, aIdx: number) => ({
            id: `answer-${topic.id}-${qIdx}-${aIdx}`,
            text: opt,
          })),
        }))
      ),
      publishInfo: { mainDomain: d.domain_url || "" },
      userInfoInputs: {
        collectName: !!d.user_input_settings?.name,
        collectEmail: !!d.user_input_settings?.email,
        collectPhone: !!d.user_input_settings?.phone,
        collectCompany: false,
        emailRequired: !!d.user_input_settings?.email_required,
        askPermission: !!d.user_input_settings?.ask_msg_permission,
        otherFields: [],
      },
      firstLastMessages: {
        firstMessage: d.first_message || "",
        lastMessage: d.last_message || "",
        firstDialogVideo: d.first_dialog_url || null,
        lastDialogVideo: d.last_dialog_url || null,
        firstDialogFileName: "",
        lastDialogFileName: "",
      },
      followUpMessages: {
        enableEmailFollowUp: !!d.follow_up_emails,
        emailFollowUpMessage: d.follow_up_email_template || "",
        enableSMSFollowUp: !!d.follow_up_sms,
        smsFollowUpMessage: d.follow_up_sms_template || "",
        messageForIncompleteEmail: !!d.follow_up_email_incomplete_template,
        messageForIncompleteSMS: !!d.follow_up_sms_incomplete_template,
      },
    },
    resumeFlow: draft.flow_tab_name as "create_bot" | "appearance",
    resumeStep: draft.step_number,
  };
};
// Get lead concierge by ID
export const useGetLeadConcierge = (id: string) => {
  return useQuery({
    queryKey: ["leadConcierge", id],
    queryFn: () => getLeadConcierge(id),
    enabled: !!id,
  });
};

// Fetch a single chatbot draft by ID
export const useGetChatbotDraftById = (id: string) => {
  return useQuery({
    queryKey: ["leadDraft", id],
    queryFn: () => getChatbotDraftById(id),
    enabled: !!id,
  });
};

// Create lead concierge
export const useCreateLeadConcierge = (
  options?: UseMutationOptions<any, AxiosError, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLeadConcierge,
    onSuccess: (data) => {
      console.log("Lead concierge creation successful:", data);
      // Invalidate the lead concierges list
      queryClient.invalidateQueries({ queryKey: ["leadConcierges"] });
    },
    onError: (error) => {
      console.error("Lead concierge creation failed:", error);
    },
    ...options,
  });
};

// Update lead concierge
export const useUpdateLeadConcierge = (
  options?: UseMutationOptions<any, AxiosError, { id: string; payload: any }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateLeadConcierge(id, payload),
    onSuccess: (data, variables) => {
      console.log("Lead concierge update successful:", data);
      // Invalidate both the list and specific item
      queryClient.invalidateQueries({ queryKey: ["leadConcierges"] });
      queryClient.invalidateQueries({
        queryKey: ["leadConcierge", variables.id],
      });
    },
    onError: (error) => {
      console.error("Lead concierge update failed:", error);
    },
    ...options,
  });
};

export const useUpdateLeadStatus = (
  options?: UseMutationOptions<any, AxiosError, { id: string; status: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateLeadConciergeStatus(id, status),
    onSuccess: (data, variables) => {
      console.log("Lead concierge update successful:", data);
      // Invalidate both the list and specific item
      queryClient.invalidateQueries({ queryKey: ["leadConcierges"] });
      queryClient.invalidateQueries({
        queryKey: ["leadConcierge", variables.id],
      });
    },
    onError: (error) => {
      console.error("Lead concierge update failed:", error);
    },
    ...options,
  });
};

// Delete lead concierge
export const useDeleteLeadConcierge = (
  options?: UseMutationOptions<any, AxiosError, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLeadConcierge,
    onSuccess: (data, id) => {
      console.log("Lead concierge deletion successful:", data);
      // Invalidate the lead concierges list
      queryClient.invalidateQueries({ queryKey: ["leadConcierges"] });
      // Remove the specific item from cache
      queryClient.removeQueries({ queryKey: ["leadConcierge", id] });
    },
    onError: (error) => {
      console.error("Lead concierge deletion failed:", error);
    },
    ...options,
  });
};

// Delete Draft concierge
export const useDeleteDraftConcierge = (
  options?: UseMutationOptions<any, AxiosError, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDraftConcierge,
    onSuccess: (data, id) => {
      console.log("Lead concierge deletion successful:", data);
      // Invalidate the lead concierges list
      queryClient.invalidateQueries({ queryKey: ["leadDrafts"] });
      // Remove the specific item from cache
      queryClient.removeQueries({ queryKey: ["leadDraft", id] });
    },
    onError: (error) => {
      console.error("Lead concierge deletion failed:", error);
    },
    ...options,
  });
};

// Save draft
export const useSaveDraft = (
  options?: UseMutationOptions<
    any,
    AxiosError,
    {
      flow_tab_name: string;
      step_name: string;
      step_number: number;
      total_steps: number;
      company_id: string;
      data: any;
    }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveDraft,
    onSuccess: (data) => {
      console.log("Draft saved successfully:", data);
      // Invalidate drafts queries if they exist
      queryClient.invalidateQueries({ queryKey: ["leadDrafts"] });
    },
    onError: (error) => {
      console.error("Draft save failed:", error);
    },
    ...options,
  });
};

// Update draft hook
export const useUpdateDraft = (
  options?: UseMutationOptions<
    any,
    AxiosError,
    {
      id: string;
      payload: {
        flow_tab_name: string;
        step_name: string;
        step_number: number;
        total_steps: number;
        data: any;
      };
    }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateDraft(id, payload),
    onSuccess: (data, variables) => {
      console.log("Draft updated successfully:", data);
      // Invalidate drafts queries
      queryClient.invalidateQueries({ queryKey: ["leadDrafts"] });
      queryClient.invalidateQueries({ queryKey: ["leadDraft"] });
    },
    onError: (error) => {
      console.error("Draft update failed:", error);
    },
    ...options,
  });
};
