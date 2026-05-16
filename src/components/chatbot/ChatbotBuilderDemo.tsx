import React from 'react';
import ChatbotBuilderSteps from './ChatbotBuilderSteps';
import { ChatbotBuilderProvider } from '@/store/ChatbotBuilderContext';

interface ChatbotBuilderDemoProps {
  onClose?: () => void;
  initialData?: any;
  isEditMode?: boolean;
  editBotId?: string;
  resumeFlow?: 'create_bot' | 'appearance';
  resumeStep?: number;
  draftId?: string;
}

const ChatbotBuilderDemo: React.FC<ChatbotBuilderDemoProps> = ({
  onClose,
  initialData,
  isEditMode = false,
  editBotId,
  resumeFlow,
  resumeStep,
  draftId
}) => {
  return (
    <div className="h-full">
      <ChatbotBuilderProvider initialData={initialData} isEditMode={isEditMode} editBotId={editBotId}>
        <ChatbotBuilderSteps onClose={onClose} isEditMode={isEditMode} editBotId={editBotId} resumeFlow={resumeFlow} resumeStep={resumeStep} draftId={draftId} />
      </ChatbotBuilderProvider>
    </div>
  );
};

export default ChatbotBuilderDemo;