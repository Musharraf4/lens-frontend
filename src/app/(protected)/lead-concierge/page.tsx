"use client";

import { useState } from 'react';
import { Tabs } from "@/components/Tabs";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import BoatCardDemo from "@/components/lead-concierge/BotCardDemo";
import ChatbotBuilderDemo from "@/components/chatbot/ChatbotBuilderDemo";
import { useGetLeadConcierge, transformBotDataForBuilder } from "@/services/chatbot.api";

export default function LeadConciergePage() {
    const [activeTab, setActiveTab] = useState("active");
    const [isCreatingBot, setIsCreatingBot] = useState(false);
    const [isEditingBot, setIsEditingBot] = useState(false);
    const [editingBotId, setEditingBotId] = useState<string | null>(null);
    const [isResumingDraft, setIsResumingDraft] = useState(false);
    const [resumeData, setResumeData] = useState<any>(null);
    const [resumeDraftId, setResumeDraftId] = useState<string | null>(null);

    const tabOptions = [
        { label: "Active", value: "active" },
        { label: "Paused", value: "paused" },
        { label: "Drafts", value: "drafts" },
    ];

    // Fetch bot data for editing
    const { data: botData, isLoading: isLoadingBotData } = useGetLeadConcierge(editingBotId || '');

    // Handle edit bot
    const handleEditBot = (botId: string) => {
        setEditingBotId(botId);
        setIsEditingBot(true);
    };

    // Handle close edit
    const handleCloseEdit = () => {
        setIsEditingBot(false);
        setEditingBotId(null);
    };

    const handleResumeDraft = (data: any, draftId?: string) => {
        setResumeData(data);
        setResumeDraftId(draftId || null);
        setIsResumingDraft(true);
    };

    const handleCloseResume = () => {
        setIsResumingDraft(false);
        setResumeData(null);
        setResumeDraftId(null);
    };

    if (isCreatingBot) {
        return (
            <div className="w-full">
                <ChatbotBuilderDemo onClose={() => setIsCreatingBot(false)} />
            </div>
        );
    }

    if (isEditingBot) {
        return (
            <div className="w-full">
                {isLoadingBotData ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-blue-500 border-opacity-20 border-t-blue-500"></div>
                    </div>
                ) : botData ? (
                    <ChatbotBuilderDemo
                        initialData={transformBotDataForBuilder(botData)}
                        onClose={handleCloseEdit}
                        isEditMode={true}
                        editBotId={editingBotId || ''}
                    />
                ) : (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-500">Failed to load bot data</p>
                    </div>
                )}
            </div>
        );
    }

    if (isResumingDraft && resumeData) {
        return (
            <div className="w-full">
                <ChatbotBuilderDemo
                    initialData={resumeData.initialData}
                    resumeFlow={resumeData.resumeFlow}
                    resumeStep={resumeData.resumeStep}
                    draftId={resumeDraftId || undefined}
                    onClose={handleCloseResume}
                />
            </div>
        );
    }

    return (
        <div className="w-full">
            <PageHeader
                title="Lead Concierge Designer"
                description="Create a personalized conversation guide that warmly welcomes visitors, qualifies prospects, and smoothly transitions them into your sales process. Your Lead Concierge works 24/7 to engage potential clients with intelligent, industry-specific dialogue while capturing valuable attribution data."
                data-tour="lead-concierge-page-header"
            />
            <div className="flex justify-between md:flex-row md:items-center md:justify-between my-8 gap-4">
                <div data-tour="lead-concierge-tabs">
                    <Tabs
                        tabs={tabOptions}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                </div>
                <div data-tour="create-bot-button">
                    <Button
                        variant="default"
                        className="rounded-full"
                        onClick={() => setIsCreatingBot(true)}
                    >
                        Create New Bot
                    </Button>
                </div>
            </div>
            <div>
                <BoatCardDemo activeTab={activeTab} onEditBot={handleEditBot} onResumeDraft={handleResumeDraft} />
            </div>
        </div>
    );


}