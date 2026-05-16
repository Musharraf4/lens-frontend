import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useChatbotBuilder } from '@/store/ChatbotBuilderContext';
import { StatusTag } from '@/components/StatusTag';

export const FollowUpMessagesStatusTag: React.FC = () => {
    const { state } = useChatbotBuilder();
    const {
        enableEmailFollowUp,
        emailFollowUpMessage,
        enableSMSFollowUp,
        smsFollowUpMessage,
        messageForIncompleteEmail,
        messageForIncompleteSMS
    } = state.followUpMessages;

    const enabledFeatures = [];
    if (enableEmailFollowUp) enabledFeatures.push('Email Follow-up');
    if (enableSMSFollowUp) enabledFeatures.push('SMS Follow-up');
    if (messageForIncompleteEmail) enabledFeatures.push('Message for incomplete email');
    if (messageForIncompleteSMS) enabledFeatures.push('Message for incomplete SMS');

    if (enabledFeatures.length === 0) return null;

    return (
        <>
            {enabledFeatures.map((feature) => (
                <StatusTag key={feature} type="default" className="mr-1 last:mr-0">
                    {feature}
                </StatusTag>
            ))}
        </>
    );
};

const FollowUpMessagesContent: React.FC = () => {
    const { state, setFollowUpMessages } = useChatbotBuilder();
    const { enableEmailFollowUp, emailFollowUpMessage, enableSMSFollowUp, smsFollowUpMessage, messageForIncompleteEmail, messageForIncompleteSMS } = state.followUpMessages;

    const handleToggle = (field: keyof typeof state.followUpMessages) => (value: boolean) => {
        setFollowUpMessages({
            ...state.followUpMessages,
            [field]: value
        });
    };

    const handleMessageChange = (field: 'emailFollowUpMessage' | 'smsFollowUpMessage') => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFollowUpMessages({
            ...state.followUpMessages,
            [field]: e.target.value
        });
    };

    return (
        <div className="space-y-8">
            {/* Email Follow-up */}
            <div className="space-y-4 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/attherate.svg" alt="Email" className="w-5 h-5 bg-gray-100 p-1 rounded-full" />
                        <span className="text-sm font-medium">Follow-up Email</span>
                    </div>
                    <Switch
                        checked={enableEmailFollowUp}
                        onCheckedChange={handleToggle('enableEmailFollowUp')}
                    />
                </div>
                <p className={`text-sm text-gray-600 ${enableEmailFollowUp ? 'w-full' : ' max-w-[525px]'}`}>
                    Email message will be sent after an initial communication to remind or check in with
                    the recipient about a previous conversation, request, or action.
                </p>

                {enableEmailFollowUp && (
                    <div className="mt-4">
                        <Textarea
                            placeholder="Type message"
                            value={emailFollowUpMessage}
                            onChange={handleMessageChange('emailFollowUpMessage')}
                            className="min-h-[100px]"
                        />
                    </div>
                )}
                {(enableEmailFollowUp) && (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="incomplete-chats"
                            checked={messageForIncompleteEmail}
                            onCheckedChange={(checked) =>
                                handleToggle('messageForIncompleteEmail')(checked === true)
                            }
                        />
                        <label htmlFor="incomplete-chats" className="text-sm">
                            Message for incomplete chats
                        </label>
                    </div>
                )}
            </div>

            {/* SMS Follow-up */}
            <div className="space-y-4 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/smsfollowup.svg" alt="Email" className="w-5 h-5 bg-gray-100 p-1 rounded-full" />
                        <span className="text-sm font-medium">Follow-up SMS</span>
                    </div>
                    <Switch
                        checked={enableSMSFollowUp}
                        onCheckedChange={handleToggle('enableSMSFollowUp')}
                    />
                </div>
                <p className={`text-sm text-gray-600 ${enableSMSFollowUp ? 'w-full' : ' max-w-[525px]'}`}>
                    SMS short text message will be sent to follow up on a prior interaction, typically to remind,
                    confirm, or prompt a response.
                </p>

                {enableSMSFollowUp && (
                    <div className="mt-4">
                        <Textarea
                            placeholder="Type message"
                            value={smsFollowUpMessage}
                            onChange={handleMessageChange('smsFollowUpMessage')}
                            className="min-h-[100px]"
                        />
                    </div>
                )}
            </div>

            {/* Message for incomplete chats */}
            {(enableSMSFollowUp) && (
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="incomplete-chats"
                        checked={messageForIncompleteSMS}
                        onCheckedChange={(checked) =>
                            handleToggle('messageForIncompleteSMS')(checked === true)
                        }
                    />
                    <label htmlFor="incomplete-chats" className="text-sm">
                        Message for incomplete chats
                    </label>
                </div>
            )}
        </div>
    );
};

export default FollowUpMessagesContent;