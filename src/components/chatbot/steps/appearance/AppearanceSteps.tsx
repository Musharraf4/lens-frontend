import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import BotStep from './bot/BotStep';
import DialogsStep from './dialogs/DialogsStep';
import ChatStep from './chat/ChatStep';
import PopupStep from './popup/PopupStep';
import AppearanceReviewStep from './review/AppearanceReviewStep';
import ChatBotHeader from '../../ChatBotHeader';
import { useChatbotBuilder } from '@/store/ChatbotBuilderContext';
import PreviewLandingPage from '../../PreviewLandingPage';
import ChatbotPreview from '../../ChatbotPreview';
import LoadingOverlay from '@/components/LoadingOverlay';
import SaveDraftModal from '../../SaveDraftModal';

interface AppearanceStepsProps {
    onClose?: () => void;
    onComplete?: () => void;
    onStepChange?: (step: number) => void;
    hideDraft?: boolean;
    resumeStep?: number;
    draftId: string | undefined
}

const steps = [
    { id: 1, name: 'Bot' },
    { id: 2, name: 'First & Last Dialogs' },
    { id: 3, name: 'Chat' },
    { id: 4, name: 'Talk to Us Pop-up' },
    { id: 5, name: 'Review' }
];

const stepComponents = {
    1: BotStep,
    2: DialogsStep,
    3: ChatStep,
    4: PopupStep,
    5: AppearanceReviewStep
};

const AppearanceSteps: React.FC<AppearanceStepsProps> = ({ onClose, onComplete, onStepChange, hideDraft, resumeStep, draftId }) => {
    const [currentStep, setCurrentStep] = useState(resumeStep ? resumeStep : 1);
    const [isLoading, setIsLoading] = useState(false);
    const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
    const { state } = useChatbotBuilder();
    const { selectedDevice } = state;
    const StepComponent = stepComponents[currentStep as keyof typeof stepComponents];
    const isNextButtonDisabled = () => {
        // For the bot appearance step (assuming it's step 1)
        if (currentStep === 1) {
            return !state?.botAppearance.botName || !state?.botAppearance.greeting;
        }
        return false;
    };
    // Notify parent component of current step
    useEffect(() => {
        onStepChange?.(currentStep);
    }, [currentStep, onStepChange]);

    const handleNext = async () => {
        if (currentStep < steps.length) {
            const newStep = currentStep + 1;
            setCurrentStep(newStep);
            onStepChange?.(newStep);
        } else {
            // If we're at the last step, call the onComplete callback
            if (onComplete) {
                setIsLoading(true);
                try {
                    await onComplete();
                } finally {
                    setIsLoading(false);
                }
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            const newStep = currentStep - 1;
            setCurrentStep(newStep);
            onStepChange?.(newStep);
        }
    };

    const handleSaveAsDraft = () => {
        setShowSaveDraftModal(true);
    };

    const handleDraftSaved = (draftData: any) => {
        setShowSaveDraftModal(false);
    };

    // Get current flow information for appearance
    const getCurrentFlowInfo = () => {
        const appearanceStepNames = ["Bot", "First & Last Dialogs", "Chat", "Talk to Us Pop-up", "Review"];
        return {
            flow_tab_name: "appearance",
            step_name: appearanceStepNames[currentStep - 1] || "Bot",
            step_number: currentStep,
            total_steps: 5 // Bot → First & Last Dialogs → Chat → Talk to Us Pop-up → Review
        };
    };

    return (
        <div className="flex flex-col h-full max-h-screen">
            <ChatBotHeader
                title="Chatbot Appearance"
                steps={steps.map(step => ({
                    ...step,
                    isCompleted: step.id < currentStep
                }))}
                currentStep={currentStep}
                onClose={onClose}
                className="border-b"
            />

            <div className={`flex-1 flex ${selectedDevice === 'web' ? 'flex-col' :
                selectedDevice === 'tablet' ? 'flex-col md:flex-row' :
                    'flex-col md:flex-row'
                }`}>
                <div className={`overflow-auto p-2 sm:p-4 ${selectedDevice === 'web' ? 'flex-1' :
                    selectedDevice === 'tablet' ? 'flex-1 md:flex-1' :
                        'flex-1 md:flex-1'
                    }`}>
                    {StepComponent && <StepComponent showPreview={selectedDevice === 'web'} />}
                </div>

                {/* Preview section for tablet/mobile when in row layout */}
                {(selectedDevice === 'tablet' || selectedDevice === 'mobile') && (
                    <div className="hidden md:block flex-1 p-2 sm:p-4">
                        <div className="h-full w-full rounded-lg overflow-hidden bg-gray-50">
                            <div className="h-[600px] relative">
                                <PreviewLandingPage position={state.botAppearance.position}>
                                    <ChatbotPreview initialState="open" />
                                </PreviewLandingPage>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 sm:p-4 mt-auto border-t border-gray-200">
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
                        {!hideDraft && (
                            <Button
                                variant="outline"
                                onClick={handleSaveAsDraft}
                                className="text-gray-700 rounded-full text-sm sm:text-base py-1 px-3 sm:px-4 h-auto"
                                disabled={isLoading}
                            >
                                Save as Draft
                            </Button>
                        )}

                        <Button
                            variant="default"
                            onClick={handleNext}
                            className="gap-1 sm:gap-2 rounded-full text-sm sm:text-base py-1 px-3 sm:px-4 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isNextButtonDisabled()}
                        >
                            <span className="whitespace-nowrap">
                                {currentStep === steps.length ? 'Complete' : 'Next Step'}
                            </span>
                            <BsArrowRight size={14} className="text-white flex-shrink-0" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            <LoadingOverlay
                isLoading={isLoading}
                message="Creating your chatbot..."
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

export default AppearanceSteps;
