import React, { createContext, useContext, useState, ReactNode, useCallback, Dispatch, SetStateAction } from 'react';

// Define types for our context data
export type AnswerType = 'radio' | 'checkbox' | 'text' | 'dropdown' | 'date';

export interface Answer {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  topicId: string;
  text: string;
  answerType: AnswerType;
  position: number;
  answers: Answer[];
}

export interface Topic {
  id: string;
  name: string;
  position: number;
}

// In ChatbotBuilderContext.tsx
export interface UserInfoInputs {
  collectName: boolean;
  collectEmail: boolean;
  collectPhone: boolean;
  collectCompany: boolean;
  emailRequired: boolean; // Add this
  askPermission: boolean; // Add this
  otherFields: string[];
}

interface FirstLastMessages {
  firstMessage: string;
  lastMessage: string;
  firstDialogVideo: string | null;
  lastDialogVideo: string | null;
  firstDialogFileName: string;
  lastDialogFileName: string;
}

interface FollowUpMessages {
  enableEmailFollowUp: boolean;
  emailFollowUpMessage: string;
  enableSMSFollowUp: boolean;
  smsFollowUpMessage: string;
  messageForIncompleteEmail: boolean;  // Changed
  messageForIncompleteSMS: boolean;
}

interface BotAppearance {
  botName: string;
  botPhoto: string | null;
  botPreviewPhoto: string | null;
  photoType: 'default' | 'custom';
  greeting: string;
  position: string;
  themeType: 'solid' | 'gradient';
  themeColor: string;
  gradientColor?: {
    color1: string;
    color2: string;
  };
}

interface PopupConfig {
  enabled: boolean;
  type: 'binary_question' | 'contact_options';
  message: string;
  positiveResponse: string;
  negativeResponse: string;
  trigger: 'scroll' | 'delay';
  delaySeconds: number;
  position: 'center_top' | 'center_bottom' | 'center_center';
}

interface PublishInfo {
  mainDomain: string;
}

// Device selector state
export type DeviceType = 'web' | 'tablet' | 'mobile';

interface ChatbotBuilderState {
  topics: Topic[];
  questions: Question[];
  userInfoInputs: UserInfoInputs;
  firstLastMessages: FirstLastMessages;
  followUpMessages: FollowUpMessages;
  botAppearance: BotAppearance;
  popupConfig: PopupConfig;
  publishInfo: PublishInfo;
  selectedDevice: DeviceType;
}

interface ChatbotBuilderContextType {
  state: ChatbotBuilderState;
  setTopics: (topics: Topic[]) => void;
  setQuestions: (questions: Question[]) => void;
  setUserInfoInputs: (inputs: UserInfoInputs) => void;
  setFirstLastMessages: (messages: FirstLastMessages) => void;
  setFollowUpMessages: (messages: FollowUpMessages | ((prev: FollowUpMessages) => FollowUpMessages)) => void;
  setBotAppearance: (appearance: BotAppearance | ((prev: BotAppearance) => BotAppearance)) => void;
  setPopupConfig: (config: PopupConfig | ((prev: PopupConfig) => PopupConfig)) => void;
  setPublishInfo: (info: PublishInfo) => void;
  setSelectedDevice: (device: DeviceType) => void;
  chatbotState: 'open' | 'closed';
  setChatbotState: (state: 'open' | 'closed') => void;
  toggleChatbotState: () => void;
  setIsDefaultTemplate: Dispatch<SetStateAction<boolean>>;
  isDefaultTemplate: boolean;
}

// Create context with default values
const ChatbotBuilderContext = createContext<ChatbotBuilderContextType | undefined>(undefined);

// Initial state
const initialState: ChatbotBuilderState = {
  topics: [],
  questions: [],
  userInfoInputs: {
    collectName: true,
    collectEmail: true,
    collectPhone: true,
    collectCompany: false,
    emailRequired: true,
    askPermission: false,
    otherFields: [],
  },
  firstLastMessages: {
    firstMessage: '',
    lastMessage: '',
    firstDialogVideo: null,
    lastDialogVideo: null,
    firstDialogFileName: '',
    lastDialogFileName: '',
  },
  followUpMessages: {
    enableEmailFollowUp: false,
    emailFollowUpMessage: '',
    enableSMSFollowUp: false,
    smsFollowUpMessage: '',
    messageForIncompleteEmail: false,
    messageForIncompleteSMS: false,
  },
  botAppearance: {
    botName: '',
    botPhoto: null,
    photoType: 'default',
    greeting: '',
    position: 'bottom-right',
    themeType: 'solid',
    themeColor: '#2C54BB',
    gradientColor: {
      color1: '',
      color2: '',
    },
    botPreviewPhoto: null,
  },
  popupConfig: {
    enabled: false,
    type: 'binary_question',
    message: 'Would you like to continue receiving help in chat?',
    positiveResponse: 'Yes, start chat',
    negativeResponse: 'No, thanks',
    trigger: 'delay',
    delaySeconds: 10,
    position: 'center_center'
  },
  publishInfo: {
    mainDomain: '',
  },
  selectedDevice: 'web' as DeviceType,
};

// Provider component
export const ChatbotBuilderProvider: React.FC<{
  children: ReactNode;
  initialData?: any;
  isEditMode?: boolean;
  editBotId?: string;
}> = ({ children, initialData, isEditMode = false, editBotId }) => {
  const [isDefaultTemplate, setIsDefaultTemplate] = useState(false);
  const [state, setState] = useState<ChatbotBuilderState>(() => {
    if (initialData) {
      // Always hydrate with provided initialData (for edit and resume draft)
      return {
        ...initialState,
        ...initialData,
      };
    }
    return initialState;
  });

  const setTopics = useCallback((topics: Topic[]) => {
    setState((prevState) => ({
      ...prevState,
      topics,
    }));
  }, []);

  const setQuestions = useCallback((questions: Question[]) => {
    setState((prevState) => ({
      ...prevState,
      questions,
    }));
  }, []);

  const setUserInfoInputs = useCallback((userInfoInputs: UserInfoInputs | ((prev: UserInfoInputs) => UserInfoInputs)) => {
    setState((prevState) => {
      const newUserInfoInputs = typeof userInfoInputs === 'function'
        ? userInfoInputs(prevState.userInfoInputs)
        : userInfoInputs;

      return {
        ...prevState,
        userInfoInputs: newUserInfoInputs,
      };
    });
  }, []);

  const setFirstLastMessages = useCallback((firstLastMessages: FirstLastMessages) => {
    setState((prevState) => ({
      ...prevState,
      firstLastMessages,
    }));
  }, []);

  const setFollowUpMessages = useCallback((followUpMessages: FollowUpMessages | ((prev: FollowUpMessages) => FollowUpMessages)) => {
    setState((prevState) => {
      const newFollowUpMessages = typeof followUpMessages === 'function'
        ? followUpMessages(prevState.followUpMessages)
        : followUpMessages;

      return {
        ...prevState,
        followUpMessages: newFollowUpMessages,
      };
    });
  }, []);

  const setPublishInfo = useCallback((publishInfo: PublishInfo) => {
    setState((prevState) => ({
      ...prevState,
      publishInfo,
    }));
  }, []);

  const setBotAppearance = useCallback((botAppearance: BotAppearance | ((prev: BotAppearance) => BotAppearance)) => {
    setState((prevState) => {
      const newBotAppearance = typeof botAppearance === 'function'
        ? botAppearance(prevState.botAppearance)
        : botAppearance;

      return {
        ...prevState,
        botAppearance: newBotAppearance,
      };
    });
  }, []);

  const setPopupConfig = useCallback((popupConfig: PopupConfig | ((prev: PopupConfig) => PopupConfig)) => {
    setState((prevState) => {
      const newPopupConfig = typeof popupConfig === 'function'
        ? popupConfig(prevState.popupConfig)
        : popupConfig;

      return {
        ...prevState,
        popupConfig: newPopupConfig,
      };
    });
  }, []);

  const setSelectedDevice = useCallback((selectedDevice: DeviceType) => {
    setState((prevState) => ({
      ...prevState,
      selectedDevice,
    }));
  }, []);

  // State for controlling chatbot preview open/closed state
  const [chatbotState, setChatbotState] = useState<'open' | 'closed'>('closed');

  // Function to toggle chatbot state
  const toggleChatbotState = () => {
    setChatbotState(prev => prev === 'open' ? 'closed' : 'open');
  };

  return (
    <ChatbotBuilderContext.Provider
      value={{
        state,
        setTopics,
        setQuestions,
        setUserInfoInputs,
        setFirstLastMessages,
        setFollowUpMessages,
        setBotAppearance,
        setPopupConfig,
        setPublishInfo,
        setSelectedDevice,
        chatbotState,
        setChatbotState,
        toggleChatbotState,
        setIsDefaultTemplate,
        isDefaultTemplate,
      }}
    >
      {children}
    </ChatbotBuilderContext.Provider>
  );
};

// Custom hook to use the context
export const useChatbotBuilder = () => {
  const context = useContext(ChatbotBuilderContext);
  if (context === undefined) {
    throw new Error('useChatbotBuilder must be used within a ChatbotBuilderProvider');
  }
  return context;
};
