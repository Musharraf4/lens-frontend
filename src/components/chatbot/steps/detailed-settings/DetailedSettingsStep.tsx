"use client";

import React, { useState } from 'react';
import ChatbotAccordion from '../../ChatbotAccordion';
import FollowUpMessagesContent, { FollowUpMessagesStatusTag } from './FollowUpMessagesContent';

export interface DetailedSettingsStepProps {
    onNext?: () => void;
    onClose?: () => void;
}

const DetailedSettingsStep: React.FC<DetailedSettingsStepProps> = ({ onNext, onClose }) => {
    const [openAccordion, setOpenAccordion] = useState<string | undefined>('follow-up-messages');

    const handleValueChange = React.useCallback((newValue: string | undefined) => {
        setOpenAccordion(newValue);
    }, []);

    return (
        <div className="flex flex-col h-full">
            {/* <div className="p-6">
                <h2 className="text-xl font-semibold">Detailed Settings</h2>
                <p className="text-gray-600 mt-2">Advanced configuration options</p>
            </div> */}

            <div className="flex-1 p-6 overflow-auto">
                <div className="mx-auto space-y-6">
                    <ChatbotAccordion
                        id="follow-up-messages"
                        stepNumber={1}
                        title="Add Follow-up Messages"
                        value={openAccordion}
                        onValueChange={handleValueChange}
                        statusTag={<FollowUpMessagesStatusTag />}
                    >
                        <FollowUpMessagesContent />
                    </ChatbotAccordion>

                    {/* Add other accordion items for additional settings as needed */}
                </div>
            </div>
        </div>
    );
};

export default DetailedSettingsStep;