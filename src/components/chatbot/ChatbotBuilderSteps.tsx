// src/components/chatbot/ChatbotBuilderSteps.tsx
import React, { useState } from 'react';
import GeneralStep from './steps/general/GeneralStep';
import QuestionnaireStep from './steps/questionnaire/QuestionnaireStep';
import DetailedSettingsStep from './steps/detailed-settings/DetailedSettingsStep';
import ReviewStep from './steps/review/ReviewStep';
import AppearanceSteps from './steps/appearance/AppearanceSteps';
import { Button } from '@/components/ui/button';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import ChatBotHeader from './ChatBotHeader';
import { useChatbotBuilder } from '@/store/ChatbotBuilderContext';
import { uploadAttachment, useCreateLeadConcierge, useUpdateLeadConcierge, useDeleteDraftConcierge, checkChatbotDomainAvailability } from '@/services/chatbot.api';
import { showToast } from '@/components/Toast';
import LoadingOverlay from '@/components/LoadingOverlay';
import SaveDraftModal from './SaveDraftModal';
import { useSelectedCompanyStore } from '@/store/SelectedCompany';

interface ChatbotBuilderStepsProps {
    onClose?: () => void;
    isEditMode?: boolean;
    editBotId?: string;
    resumeFlow?: 'create_bot' | 'appearance';
    resumeStep?: number;
    draftId?: string; // ID of the draft being resumed
}

const steps = [
    { id: 1, name: 'General' },
    { id: 2, name: 'Questionnaire' },
    { id: 3, name: 'Detailed Settings' },
    { id: 4, name: 'Review' }
];

const stepComponents: Record<number, React.ComponentType<any>> = {
    1: GeneralStep,
    2: QuestionnaireStep,
    3: DetailedSettingsStep,
    4: ReviewStep
};

const ChatbotBuilderSteps: React.FC<ChatbotBuilderStepsProps> = ({ onClose, isEditMode = false, editBotId, resumeFlow, resumeStep, draftId }) => {
    const [currentStep, setCurrentStep] = useState(resumeFlow === 'create_bot' && resumeStep ? resumeStep : 1);
    const [showAppearanceFlow, setShowAppearanceFlow] = useState(resumeFlow === 'appearance'); // Always start with main steps
    const [isLoading, setIsLoading] = useState(false);
    const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
    const [currentAppearanceStep, setCurrentAppearanceStep] = useState(resumeFlow === 'appearance' && resumeStep ? resumeStep : 1);
    const { state } = useChatbotBuilder();
    const createLeadConciergeMutation = useCreateLeadConcierge();
    const updateLeadConciergeMutation = useUpdateLeadConcierge();
    const deleteDraftMutation = useDeleteDraftConcierge();
    const StepComponent = stepComponents[currentStep as keyof typeof stepComponents];
    const { selectedCompany } = useSelectedCompanyStore();
    const { mainDomain } = state.publishInfo;
    const handleNext = async () => {
        // When leaving General step (1) during create flow, verify domain availability
        if (!isEditMode && currentStep === 1) {
            const companyId = selectedCompany?.company?.id || '';
            if (companyId && mainDomain) {
                try {
                    const res = await checkChatbotDomainAvailability(companyId, mainDomain);
                    if (!res?.available) {
                        showToast({
                            title: 'Domain Unavailable',
                            description: 'This domain already have chatbot.',
                            type: 'error'
                        });
                        return; // Block moving to next step
                    }
                } catch (err: any) {
                    showToast({
                        title: 'Domain Check Failed',
                        description: 'Unable to verify domain availability. Please try again.',
                        type: 'error'
                    });
                    return;
                }
            }
        }
        if (currentStep === 2) {
            const topicsWithoutQuestions = state.topics.filter(topic => {
                const questionsForTopic = state.questions.filter(q => q.topicId === topic.id);
                return questionsForTopic.length === 0;
            });

            if (topicsWithoutQuestions.length > 0) {
                showToast({
                    title: 'Validation Error',
                    description: `Each topic must have at least one question. Please add questions to the following topics: ${topicsWithoutQuestions.map(t => t.name || 'Unnamed topic').join(', ')}`,
                    type: 'error'
                });
                return;
            }
        }
        if (currentStep < steps.length) {
            setCurrentStep(prev => prev + 1);
        } else if (currentStep === steps.length) {
            setShowAppearanceFlow(true);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const handleSaveAsDraft = () => {

        setShowSaveDraftModal(true);
    };

    const handleDraftSaved = (draftData: any) => {
        setShowSaveDraftModal(false);
    };

    // Get current flow information
    const getCurrentFlowInfo = () => {
        if (showAppearanceFlow) {
            // We're in the appearance flow
            const appearanceStepNames = ["Bot", "First & Last Dialogs", "Chat", "Talk to Us Pop-up", "Review"];
            return {
                flow_tab_name: "appearance",
                step_name: appearanceStepNames[currentAppearanceStep - 1] || "Bot",
                step_number: currentAppearanceStep,
                total_steps: 5 // Bot → First & Last Dialogs → Chat → Talk to Us Pop-up → Review
            };
        } else {
            // We're in the create bot flow
            const stepNames = ["General", "Questionnaire", "Detailed Settings", "Review"];
            return {
                flow_tab_name: "create_bot",
                step_name: stepNames[currentStep - 1] || "General",
                step_number: currentStep,
                total_steps: 4 // General → Questionnaire → Detailed Settings → Review
            };
        }
    };
    const handleAppearanceComplete = async () => {
        // Transform topics and questions to backend format
        const transformTopicsForBackend = (topics: any[], questions: any[]) => {
            return topics
                .sort((a: any, b: any) => a.position - b.position) // Sort by position
                .map((topic: any) => {
                    // Get questions for this topic, sorted by position
                    const topicQuestions = questions
                        .filter((q: any) => q.topicId === topic.id)
                        .sort((a: any, b: any) => a.position - b.position)
                        .map((question: any) => ({
                            text: question.text,
                            type: question.answerType,
                            order: question.position + 1, // Convert 0-based to 1-based
                            options: question.answers.map((answer: any) => answer.text)
                        }));

                    return {
                        name: topic.name,
                        order: topic.position + 1, // Convert 0-based to 1-based
                        questions: topicQuestions
                    };
                });
        };

        const transformedTopics = transformTopicsForBackend(state.topics, state.questions);

        setIsLoading(true);

        try {
            let photoUrl = state.botAppearance.botPhoto;
            let imageUploadSuccess = true;
            if (state.botAppearance.botPhoto && state.botAppearance.botPhoto.startsWith('data:')) {
                try {
                    const response = await fetch(state.botAppearance.botPhoto);
                    const blob = await response.blob();
                    const file = new File([blob], 'bot-photo.jpg', { type: 'image/jpeg' });
                    const uploadResponse = await uploadAttachment(file, 'image');
                    photoUrl = uploadResponse.url; // Assuming the API returns { url: "..." }
                } catch (uploadError) {
                    showToast({
                        title: 'Image Upload Failed',
                        description: 'Failed to upload bot photo. Please try again.',
                        type: 'error'
                    });
                    imageUploadSuccess = false;
                }
            }
            if (imageUploadSuccess) {
                const backendPayload = {
                    company_id: selectedCompany?.company?.id || '',
                    name: state.botAppearance.botName,
                    photo_url: photoUrl,
                    theme_colour_hex: state.botAppearance.themeColor,
                    gradient: state.botAppearance.themeType === 'gradient' && state.botAppearance.gradientColor?.color1 ? {
                        color1: state.botAppearance.gradientColor?.color1 || '',
                        color2: state.botAppearance.gradientColor?.color2 || ''
                    } : {},
                    greeting_message: state.botAppearance.greeting,
                    first_message: state.firstLastMessages.firstMessage,
                    last_message: state.firstLastMessages.lastMessage,
                    first_dialog_url: state.firstLastMessages.firstDialogVideo,
                    last_dialog_url: state.firstLastMessages.lastDialogVideo,
                    background_image_url: state.botAppearance.botPreviewPhoto,
                    // follow_up_email_template: state.followUpMessages.enableEmailFollowUp,
                    // follow_up_sms_template: state.followUpMessages.enableSMSFollowUp,

                    follow_up_email_template: state.followUpMessages.emailFollowUpMessage,
                    follow_up_sms_template: state.followUpMessages.smsFollowUpMessage,
                    follow_up_email_incomplete_template: state.followUpMessages.messageForIncompleteEmail,
                    follow_up_sms_incomplete_template: state.followUpMessages.messageForIncompleteSMS,
                    follow_up_emails: state.followUpMessages.enableEmailFollowUp,
                    follow_up_sms: state.followUpMessages.enableSMSFollowUp,

                    position: !state.botAppearance.position ? 'bottom_right' : state.botAppearance.position?.replace('-', '_'),
                    domain_url: state.publishInfo.mainDomain,
                    user_input_settings: {
                        email: state.userInfoInputs.collectEmail,
                        phone: state.userInfoInputs.collectPhone,
                        name: state.userInfoInputs.collectName,
                        email_required: state.userInfoInputs.emailRequired,
                        ask_msg_permission: state.userInfoInputs.askPermission
                    },
                    popup: state.popupConfig.enabled ? {
                        type: state.popupConfig.type?.split('_')[0] || 'standard',
                        type_config: {
                            key: state.popupConfig.message,
                            yes_label: state.popupConfig.positiveResponse,
                            no_label: state.popupConfig.negativeResponse
                        },
                        position: state.popupConfig.position,
                        action: state.popupConfig.positiveResponse,
                        delay_sec: state.popupConfig.delaySeconds
                    } : null,
                    topics: transformedTopics
                };

                if (isEditMode && editBotId) {
                    await updateLeadConciergeMutation.mutateAsync({ id: editBotId, payload: backendPayload });
                    showToast({
                        title: 'Chatbot Updated Successfully!',
                        description: 'Your lead concierge chatbot has been updated.',
                        type: 'success'
                    });
                } else {
                    // Create new chatbot
                    await createLeadConciergeMutation.mutateAsync(backendPayload);

                    // If resuming from draft, delete it after successful creation
                    if (draftId) {
                        try {
                            await deleteDraftMutation.mutateAsync(draftId);
                        } catch (error) {
                            console.error('Failed to delete draft:', error);
                            // Don't show error toast as the chatbot was created successfully
                        }
                    }
                    showToast({
                        title: 'Chatbot Created Successfully!',
                        description: 'Your lead concierge chatbot has been created and is ready to use.',
                        type: 'success'
                    });
                }

                if (onClose) onClose();
            } else {
                console.error('❌ Skipping chatbot creation due to image upload failure');
            }

        } catch (error: any) {
            const errorMsg = error?.response?.data?.detail;
            showToast({
                title: 'Failed to Create Chatbot',
                description: JSON.stringify(errorMsg) || 'There was an error creating your chatbot. Please try again.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (showAppearanceFlow) {
        return <AppearanceSteps hideDraft={Boolean(isEditMode)} draftId={draftId} onClose={onClose} onComplete={handleAppearanceComplete} onStepChange={setCurrentAppearanceStep} resumeStep={resumeFlow === 'appearance' ? resumeStep : undefined} />;
    }

    return (
        <div className="flex flex-col h-full max-h-screen">
            <ChatBotHeader
                title={isEditMode ? "Edit Chatbot" : "Create New Lead Concierge"}
                steps={steps.map(step => ({
                    ...step,
                    isCompleted: step.id < currentStep
                }))}
                currentStep={currentStep}
                onClose={onClose}
                className="border-b"
            />

            <div className="flex-1 overflow-auto p-2 sm:p-4">
                {StepComponent && <StepComponent isEditMode={isEditMode} />}
            </div>

            <div className="p-3 sm:p-4 mt-auto border-t">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
                    <div className="flex">
                        {currentStep > 1 && (
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                className="border-none shadow-none px-2 sm:px-3 py-1 text-sm sm:text-base bg-transparent font-medium text-neutral-500"
                            >
                                <BsArrowLeft size={14} className="mr-1 sm:mr-2" />
                                Previous
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                        {!isEditMode && (
                            <Button
                                variant="outline"
                                onClick={handleSaveAsDraft}
                                className="text-gray-700 rounded-full text-sm sm:text-base py-1 px-3 sm:px-4 h-auto"
                                disabled={!mainDomain}
                            >
                                Save as Draft
                            </Button>
                        )}

                        <Button
                            variant="default"
                            onClick={handleNext}
                            className="gap-1 sm:gap-2 rounded-full text-sm sm:text-base py-1 px-3 sm:px-4 h-auto disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!mainDomain || (currentStep === 2 && state.topics.length === 0)}
                        >
                            <span className="whitespace-nowrap">
                                {currentStep === steps.length ? 'Continue to Appearance' : 'Next Step'}
                            </span>
                            <BsArrowRight size={14} className="text-white flex-shrink-0" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            <LoadingOverlay
                isLoading={isLoading || createLeadConciergeMutation.isPending || updateLeadConciergeMutation.isPending}
                message={isEditMode ? "Updating your chatbot..." : "Creating your chatbot..."}
            />

            {/* Save Draft Modal */}
            <SaveDraftModal
                open={showSaveDraftModal}
                onOpenChange={setShowSaveDraftModal}
                onSave={handleDraftSaved}
                flowInfo={getCurrentFlowInfo()}
                botData={state}
                onClose={onClose}
                draftId={draftId}
            />
        </div>
    );
};

export default ChatbotBuilderSteps;