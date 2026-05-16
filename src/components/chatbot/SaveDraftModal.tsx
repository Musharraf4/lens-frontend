import React, { useState } from 'react';
import { ActionDialog } from '@/components/ActionDialog';
import { uploadAttachment, useSaveDraft, useUpdateDraft } from '@/services/chatbot.api';
import { showToast } from '@/components/Toast';
import { Save } from 'lucide-react';
import { useSelectedCompanyStore } from '@/store/SelectedCompany';

interface SaveDraftModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (draftData: {
        flow_tab_name: string;
        step_name: string;
        step_number: number;
        total_steps: number;
        data: any;
    }) => void;
    flowInfo: {
        flow_tab_name: string;
        step_name: string;
        step_number: number;
        total_steps: number;
    };
    botData?: any;
    onClose: (() => void) | undefined
    draftId?: string;
}

const SaveDraftModal: React.FC<SaveDraftModalProps> = ({
    open,
    onOpenChange,
    onSave,
    flowInfo,
    botData = {},
    onClose,
    draftId
}) => {
    const { selectedCompany } = useSelectedCompanyStore();
    const saveDraftMutation = useSaveDraft();
    const updateDraftMutation = useUpdateDraft();

    // Transform topics and questions to backend format (same as create API)
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

    const handleSave = async () => {
        try {
            // Generate a default draft name based on flow and step
            const defaultDraftName = `${flowInfo.flow_tab_name === 'create_bot' ? 'Create Bot' : 'Appearance'} - ${flowInfo.step_name}`;

            // Transform topics and questions to backend format
            const transformedTopics = transformTopicsForBackend(botData.topics || [], botData.questions || []);
            let photoUrl = botData.botAppearance.botPhoto;
            let imageUploadSuccess = true;
            if (botData.botAppearance.botPhoto && botData.botAppearance.botPhoto.startsWith('data:')) {
                try {
                    const response = await fetch(botData.botAppearance.botPhoto);
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
                // Create the exact same payload structure as the create API call
                const createApiPayload = {
                    company_id: selectedCompany?.company?.id || '',
                    name: botData.botAppearance?.botName || '',
                    photo_url: botData.botAppearance?.botPhoto || '',
                    theme_colour_hex: botData.botAppearance?.themeColor || '#3b82f6',
                    gradient: botData.botAppearance.themeType === 'gradient' && botData.botAppearance.gradientColor?.color1 ? {
                        color1: botData.botAppearance.gradientColor?.color1 || '',
                        color2: botData.botAppearance.gradientColor?.color2 || ''
                    } : {},
                    greeting_message: botData.botAppearance?.greeting || '',
                    background_image_url: botData.botAppearance.botPreviewPhoto,
                    first_message: botData.firstLastMessages?.firstMessage || '',
                    last_message: botData.firstLastMessages?.lastMessage || '',
                    first_dialog_url: botData.firstLastMessages?.firstDialogVideo || '',
                    last_dialog_url: botData.firstLastMessages?.lastDialogVideo || '',
                    follow_up_email_template: botData.followUpMessages?.enableEmailFollowUp || false,
                    follow_up_sms_template: botData.followUpMessages?.enableSMSFollowUp || false,
                    follow_up_email_incomplete_template: botData.followUpMessages.messageForIncompleteEmail,
                    follow_up_sms_incomplete_template: botData.followUpMessages.messageForIncompleteSMS,
                    follow_up_emails: botData.followUpMessages.enableEmailFollowUp,
                    follow_up_sms: botData.followUpMessages.enableSMSFollowUp,
                    position: !botData.botAppearance?.position ? 'bottom_right' : botData.botAppearance.position?.replace('-', '_'),
                    domain_url: botData.publishInfo?.mainDomain || '',
                    user_input_settings: {
                        email: botData.userInfoInputs?.collectEmail || false,
                        phone: botData.userInfoInputs?.collectPhone || false,
                        name: botData.userInfoInputs?.collectName || false,
                        email_required: botData.userInfoInputs?.emailRequired || false,
                        ask_msg_permission: botData.userInfoInputs?.askPermission || false
                    },
                    popup: botData.popupConfig?.enabled ? {
                        type: botData.popupConfig?.type?.split('_')[0] || 'standard',
                        type_config: {
                            key: botData.popupConfig?.message || '',
                            yes_label: botData.popupConfig?.positiveResponse || '',
                            no_label: botData.popupConfig?.negativeResponse || ''
                        },
                        position: botData.popupConfig?.position || 'center_center',
                        action: botData.popupConfig?.positiveResponse || '',
                        delay_sec: botData.popupConfig?.delaySeconds || 10
                    } : null,
                    topics: transformedTopics
                };

                const draftPayload = {
                    flow_tab_name: flowInfo.flow_tab_name,
                    step_name: flowInfo.step_name,
                    step_number: flowInfo.step_number,
                    total_steps: flowInfo.total_steps,
                    company_id: selectedCompany?.company?.id || '',
                    data: createApiPayload
                };

                if (draftId) {
                    await updateDraftMutation.mutateAsync({ id: draftId, payload: draftPayload });
                } else {
                    await saveDraftMutation.mutateAsync(draftPayload);
                }

                // Call the onSave callback
                onSave(draftPayload);

                showToast({
                    title: 'Draft Saved Successfully!',
                    description: `"${defaultDraftName}" has been saved as a draft and you can continue working on it later.`,
                    type: 'success',
                });

                onOpenChange(false);
                if (onClose) onClose();
            }
        } catch (error) {
            console.error('Failed to save draft:', error);
            showToast({
                title: 'Failed to Save Draft',
                description: 'There was an error saving your draft. Please try again.',
                type: 'error',
            });
        }
    };

    return (
        <ActionDialog
            open={open}
            onOpenChange={onOpenChange}
            type="default"
            title="Save as Draft"
            description="This bot will be moved to drafts, allowing you to return and continue working on it later."
            confirmLabel="Save"
            onConfirm={handleSave}
            loading={saveDraftMutation.isPending || updateDraftMutation.isPending}
            icon={<Save className="mx-auto mb-2 text-primary" size={36} />}
        />
    );
};

export default SaveDraftModal;
