import React, { useState, useEffect } from "react";
import BoatCard, { BoatCardSkeleton } from "./BotCard";
import DraftCard from "./DraftCard";
import {
  useGetAllDrafts,
  useGetAllLeadConcierge,
  useGetChatbotDraftById,
  transformDraftToBuilder,
} from "@/services/chatbot.api";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { Bot } from "@/types";

interface BotData {
  id: string;
  image: string;
  avatar: string;
  name: string;
  message: string;
  link: string;
  topics: { id: string; name: string }[];
}

interface DraftData {
  id: number;
  avatar: string;
  message: string;
  creationDate: string;
  currentStep: number;
  totalSteps: number;
}

interface BotCardDemoProps {
  activeTab?: string;
  onEditBot?: (botId: string) => void;
  onResumeDraft?: (data: any, draftId?: string) => void;
}

const BotCardDemo: React.FC<BotCardDemoProps> = ({ activeTab = "active", onEditBot, onResumeDraft }) => {
  const { selectedCompany } = useSelectedCompanyStore();

  // Pagination state
  const [chatbotPage, setChatbotPage] = useState<number>(1);
  const [chatbotSize] = useState<number>(10);
  const [draftPage, setDraftPage] = useState<number>(1);
  const [draftSize] = useState<number>(10);

  const { data: chatbotData, isLoading: isChatbotLoading } =
    useGetAllLeadConcierge(selectedCompany?.company?.id || '', { page: chatbotPage, size: chatbotSize });

  const { data: draftData, isLoading: isDraftLoading } =
    useGetAllDrafts({ page: draftPage, size: draftSize, company_id: selectedCompany?.company?.id || '' });
  const [activeBots, setActiveBots] = useState<Bot[]>([]);
  const [pausedBots, setPausedBots] = useState<Bot[]>([]);
  const [draftBots, setDraftBots] = useState<Bot[]>([]);

  // Handle bot status change (active/paused)
  const handleToggle = (botId: string, active: boolean) => {
    if (active) {
      // Move bot from paused to active
      const botToMove = pausedBots.find((bot) => bot.id === botId);
      if (botToMove) {
        setPausedBots((prev) => prev.filter((bot) => bot.id !== botId));
        setActiveBots((prev) => [...prev, botToMove]);
      }
    } else {
      // Move bot from active to paused
      const botToMove = activeBots.find((bot) => bot.id === botId);
      if (botToMove) {
        setActiveBots((prev) => prev.filter((bot) => bot.id !== botId));
        setPausedBots((prev) => [...prev, botToMove]);
      }
    }
  };

  const handleEdit = (botId: string) => {
    if (onEditBot) {
      onEditBot(botId);
    }
  };

  const handleDelete = (botId: string) => {
    // The API will handle the deletion and cache invalidation
    // No need for local state management since data will be refreshed automatically
  };

  const handleDeleteDraft = (draftId: string) => {
    // Remove draft from drafts array
    setDraftBots((prev) => prev.filter((draft) => draft.id !== draftId));
  };

  const [resumeDraftId, setResumeDraftId] = useState<string | null>(null);
  const { data: resumeDraft } = useGetChatbotDraftById(resumeDraftId || "");

  // When draft is loaded, call parent's handleResumeDraft with draft ID
  useEffect(() => {
    if (resumeDraft && onResumeDraft) {
      const transformed = transformDraftToBuilder(resumeDraft);
      onResumeDraft(transformed, resumeDraftId || undefined);
      setResumeDraftId(null); // Reset after triggering
    }
  }, [resumeDraft, resumeDraftId, onResumeDraft]);

  const handleContinueSetup = (draftId: string) => {
    setResumeDraftId(draftId);
  };

  const handleCardClick = () => {
  };

  // Determine which bots to display based on activeTab
  const displayBots = chatbotData?.items
    ? activeTab === "active"
      ? chatbotData.items?.filter((bot: any) => bot.status === "active")
      : activeTab === "paused"
        ? chatbotData.items?.filter((bot: any) => bot.status === "paused")
        : []
    : [];

  if (isChatbotLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[1, 2, 3]?.map((_, index) => <BoatCardSkeleton key={index} />)}</div>;
  }
  return (
    <>
      <div className=" bg-gray-50 min-h-screen">
        {activeTab === "drafts" ? (
          // Render draft cards for drafts tab
          (draftData?.items?.length || 0) === 0 ? (
            <div className="text-center mx-auto py-12 text-gray-500">
              <img src='/empty-screen.svg' className="mx-auto" />
              <div>
                <h3 className="text-2xl text-black font-semibold">You haven’t any draft bots</h3>
                <span className="text-black/60 ">Once you create and save them as drafts, they’ll show up here.</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" >
              {draftData?.items && draftData.items?.map((draft: any, index: number) => (
                <DraftCard
                  key={draft.id}
                  id={draft.id}
                  index={index}
                  avatar={draft?.data.photo_url}
                  message={draft?.data.greeting_message}
                  creationDate={draft?.created_at}
                  currentStep={draft.step_number}
                  totalSteps={draft.total_steps}
                  onDelete={() => handleDeleteDraft(draft.id)}
                  onContinue={() => handleContinueSetup(draft.id)}
                  flowName={draft?.flow_tab_name === 'create_bot' ? 'Chat' : 'Apearance'}
                />
              ))}
            </div>
          )
        ) : // Render bot cards for active/paused tabs
          displayBots?.length === 0 ? (
            <div className="text-center mx-auto py-12 text-gray-500" data-tour="lead-concierge-empty-state">
              <img src='/empty-screen.svg' className="mx-auto" />
              {activeTab === "active"
                ? <div>
                  <h3 className="text-2xl text-black font-semibold">You haven't created any Lead Concierges yet</h3>
                  <span className="text-black/60 ">Start engaging prospects with personalized conversations that qualify leads while capturing valuable attribution data.</span>
                </div>
                :
                <div>
                  <h3 className="text-2xl text-black font-semibold">You haven't any paused bots</h3>
                  <span className="text-black/60 ">Once you begin pausing your active bots, they will be displayed here.</span>
                </div>
              }
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayBots?.map((bot: Bot, index: number) => (
                <BoatCard
                  key={bot.id}
                  id={bot.id}
                  image={bot.background_image_url || `/assets/lead-concierge/lead-preview${index + 1}.png`}
                  avatarImage={bot.photo_url}
                  chatbotMessage={bot.greeting_message}
                  siteLink={bot.domain_url}
                  topics={bot.topics}
                  isActive={activeTab === "active"}
                  onToggle={(active) => handleToggle(bot.id, active)}
                  onEdit={() => handleEdit(bot.id)}
                  onDelete={() => handleDelete(bot.id)}
                  onClick={handleCardClick}
                  botData={bot}
                  index={index}
                />
              ))}
            </div>
          )}
        {/* Pagination footer */}
        <div className="flex items-center justify-between py-6">
          <div className="text-sm text-black/70">
            {activeTab === 'drafts'
              ? `Total ${draftData?.total ?? 0} Items`
              : activeTab === 'active'
                ? `Total ${chatbotData?.items?.filter((bot) => bot.status === "active").length ?? 0} Items`
                : activeTab === 'paused'
                  ? `Total ${chatbotData?.items?.filter((bot) => bot.status === "paused").length ?? 0} Items`
                  : `Total ${chatbotData?.total ?? 0} Items`
            }
          </div>
          <div className="flex items-center gap-2">
            <button
              className="h-8 w-8 grid place-items-center text-gray-600 disabled:text-gray-300 disabled:border-gray-100"
              onClick={() => {
                if (activeTab === 'drafts') {
                  setDraftPage((p) => Math.max(1, p - 1));
                } else {
                  setChatbotPage((p) => Math.max(1, p - 1));
                }
              }}
              disabled={(activeTab === 'drafts' ? draftPage : chatbotPage) <= 1}
            >
              ←
            </button>
            {Array.from({ length: activeTab === 'drafts' ? (draftData?.pages ?? 0) : (chatbotData?.pages ?? 0) }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = (activeTab === 'drafts' ? draftPage : chatbotPage) === pageNum;
              return (
                <button
                  key={pageNum}
                  className={`h-8 w-8 text-sm rounded-full border grid place-items-center ${isActive ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-700'}`}
                  onClick={() => {
                    if (activeTab === 'drafts') {
                      setDraftPage(pageNum);
                    } else {
                      setChatbotPage(pageNum);
                    }
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="h-8 w-8 grid place-items-center text-gray-600 disabled:text-gray-300 disabled:border-gray-100"
              onClick={() => {
                if (activeTab === 'drafts') {
                  const totalPages = draftData?.pages ?? 1;
                  setDraftPage((p) => Math.min(totalPages, p + 1));
                } else {
                  const totalPages = chatbotData?.pages ?? 1;
                  setChatbotPage((p) => Math.min(totalPages, p + 1));
                }
              }}
              disabled={(activeTab === 'drafts'
                ? draftPage >= (draftData?.pages ?? 1)
                : chatbotPage >= (chatbotData?.pages ?? 1))}
            >
              →
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default BotCardDemo;
