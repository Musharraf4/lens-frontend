import React, { useState } from 'react';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { IoCopyOutline } from 'react-icons/io5';
import { FiEdit } from 'react-icons/fi';
import { RiChatAiLine, RiDeleteBin6Line } from 'react-icons/ri';
import TextWithCopy from '@/components/TextWithCopy';
import { showToast } from '@/components/Toast';
import { Skeleton } from '@/components/ui/skeleton';
import { BotCardProps } from '@/types';
import { ActionDialog } from '../ActionDialog';
import { useUpdateLeadStatus, useDeleteLeadConcierge } from '@/services/chatbot.api';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import PreviewLandingPage from '@/components/chatbot/PreviewLandingPage';
import ChatbotPreview from '@/components/chatbot/ChatbotPreview';
import { ChatbotBuilderProvider } from '@/store/ChatbotBuilderContext';
import { TabSlice } from '@/components/TabSlice';
import { getPopupPositionClasses } from '@/lib/utils';
import { MdDeleteOutline } from 'react-icons/md';
import TooltipWrapper from '@/components/ui/TooltipWrapper';

const BotCard: React.FC<BotCardProps> = ({
  id,
  image,
  avatarImage,
  chatbotMessage,
  siteLink,
  topics,
  isActive = true,
  onEdit,
  onDelete,
  onToggle,
  onClick,
  botData,
  index
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Bot");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingState, setPendingState] = useState<boolean | null>(null);

  // Hook for updating lead status
  const updateLeadStatusMutation = useUpdateLeadStatus();

  // Hook for deleting lead concierge
  const deleteLeadConciergeMutation = useDeleteLeadConcierge();
  const handleToggleChange = (checked: boolean) => {
    // Always show confirmation dialog when changing state
    if (checked !== isActive) {
      setPendingState(checked);
      setDialogOpen(true);
    }
  };
  // Extract bot name from chatbot message (e.g., "Hi, I'm Alice. How can I assist you?" -> "Alice")
  const extractBotName = () => {
    const match = chatbotMessage.match(/I'm\s+([A-Za-z]+)/i);
    return match ? `${match[1]}-Bot` : 'Bot';
  };

  const handleConfirmToggle = async () => {
    if (pendingState !== null) {
      try {
        // Update the status via API
        const status = pendingState ? 'active' : 'paused';
        await updateLeadStatusMutation.mutateAsync({ id, status });

        // Call the onToggle callback if provided
        if (onToggle) {
          onToggle(pendingState);
        }

        // Show success toast based on action (pause or enable)
        const botName = extractBotName();
        if (pendingState === false) {
          showToast({
            title: `${botName} was paused`,
            description: "You can reactivate anytime you're ready.",
            type: 'success',
          });
        } else {
          showToast({
            title: `${botName} was enabled`,
            description: "The bot is now active and available.",
            type: 'success',
          });
        }
      } catch (error) {
        console.error('Failed to update bot status:', error);
        showToast({
          title: 'Failed to update bot status',
          description: 'There was an error updating the bot status. Please try again.',
          type: 'error',
        });
      }
    }
    setDialogOpen(false);
    setPendingState(null);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Call the delete API
      await deleteLeadConciergeMutation.mutateAsync(id);

      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete();
      }

      // Show success toast for deletion
      const botName = extractBotName();
      showToast({
        title: `${botName} was deleted`,
        description: "The bot has been permanently removed and will no longer be available for use.",
        type: 'success',
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete bot:', error);
      showToast({
        title: 'Failed to Delete Bot',
        description: 'There was an error deleting the bot. Please try again.',
        type: 'error',
      });
    }
  };

  const intitalData = {
    selectedDevice: 'web',
    botAppearance: {
      botName: botData?.name || '',
      botPhoto: botData?.photo_url || avatarImage || null,
      botPreviewPhoto: image || null,
      photoType: (botData?.photo_url || avatarImage) ? 'custom' : 'default',
      greeting: botData?.greeting_message || chatbotMessage || '',
      position: botData?.position || 'bottom_right',
      themeType: botData?.gradient?.color1 && botData?.gradient?.color2 ? 'gradient' : 'solid',
      gradientColor: botData?.gradient || { color1: '#2C54BB', color2: '#2C54BB' },
      themeColor: botData?.theme_colour_hex || '#2C54BB',
    },
    popupConfig: {
      enabled: botData?.bot_popup || false,
      type: botData?.bot_popup?.type || 'none',
      message: botData?.bot_popup?.type_config.key || '',
      positiveResponse: botData?.bot_popup?.type_config.yes_label || 'Yes, sure',
      negativeResponse: botData?.bot_popup?.type_config.no_label || 'No, thanks',
      trigger: 'delay',
      delaySeconds: 10,
      position: botData?.bot_popup?.position || 'center_center',
    },
    topics: (botData?.topics || topics || []).map((t: any, idx: number) => ({ id: t.id || String(idx), name: t.name, position: idx })),
    questions: [],
    publishInfo: { mainDomain: siteLink || '' },
    userInfoInputs: {
      collectName: false,
      collectEmail: false,
      collectPhone: false,
      collectCompany: false,
      emailRequired: false,
      askPermission: false,
      otherFields: [],
    },
    firstLastMessages: {
      firstMessage: botData?.first_message || '',
      lastMessage: botData?.last_message || '',
      firstDialogVideo: botData?.first_dialog_url || '',
      lastDialogVideo: botData?.last_dialog_url || '',
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
    }
  }
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text || '');
      showToast({
        title: "The Script has been copied to your clipboard",
        description: "You can paste it in your website header.",
        type: 'success',
      });
    } catch {
      console.error('Failed to copy text');
      showToast({
        title: 'Failed to copy text',
        description: 'Failed to copy text',
        type: 'error',
      });
    }
  };

  const gradientStart = intitalData.botAppearance.gradientColor?.color1;
  const gradientEnd = intitalData.botAppearance.gradientColor?.color2;
  const hasGradient =
    intitalData.botAppearance.themeType === 'gradient' &&
    Boolean(gradientStart && gradientEnd);
  return (
    <div
      className="rounded-3xl p-3 overflow-hidden bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col h-full"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      data-tour={`${index === 0 ? 'bot-cards' : ''}`}
    >
      {/* Main Image with Chatbot Overlay */}
      <div
        className="relative w-full h-60 flex-shrink-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={image}
          alt="Bot preview"
          fill
          className={`object-cover rounded-3xl transition-all duration-300 ${isHovered ? 'blur-sm scale-[1.01]' : ''}`}
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {/* Hover overlay with Preview action */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPreviewOpen(true);
          }}
          className={`absolute inset-0 flex items-center justify-center rounded-3xl transition-colors duration-300 ${isHovered ? 'bg-black/30' : 'bg-transparent'}`}
          aria-label="Open preview"
        >
          {isHovered && (
            <span className="text-white text-sm sm:text-base font-medium tracking-wide">
              Preview
            </span>
          )}
        </button>

        {/* Chatbot Message with Avatar - Overlay on image */}
        <div className="absolute bottom-2 left-4 right-4 pointer-events-none">
          <div className="flex items-end gap-2">
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={avatarImage || '/message-icon.svg'}
                alt="Chatbot avatar"
                fill
                className="object-cover"
              />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-3 shadow-lg w-full relative">
              <div className="text-sm text-gray-800">
                {chatbotMessage || 'Greeting message goes here...'}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Content area - flex-1 to push controls to bottom */}
      <div className="flex-1 flex flex-col">
        {/* Link to site */}
        <div onClick={() => handleCopy(`<script type="text/javascript" src="${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bots/${id}.js"></script>`)} className="relative px-4 py-1 items-center gap-2">
          <div className='flex items-center gap-2 mb-1'>

            <div className="w-5 h-5 rounded-full p-1 border border-gray-300 flex items-center justify-center">
              <IoCopyOutline className="text-gray-500 text-sm" />
            </div>
            <span className="text-sm text-gray-600">Embeded in website:</span>
          </div>
          <div className="font-normal break-all overflow-wrap-anywhere text-xs sm:text-sm leading-5 tracking-[0%] align-middle text-black whitespace-pre-line bg-neutral-50 p-4 rounded-3xl border border-neutral-200"
          >
            <span className="text-sm text-neutral-500">{`<script type="text/javascript" src="${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bots/${id}.js"></script>`}</span>
          </div>
        </div>
        {/* Link to site */}
        <div className="relative px-4 py-1 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full p-1 border border-gray-300 flex items-center justify-center">
            <img src="/Link.svg" alt="link icon" className="w-3 h-3 object-contain" />
          </div>
          <span className="text-sm text-gray-600">Link to site:</span>
          <div className="flex-1 overflow-hidden">
            <div className='flex gap-1'>
              <a
                href={`https://${siteLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className=" text-sm text-neutral-500  truncate max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis block"

              >
                {siteLink}
              </a>
              <button onClick={() => handleCopy(siteLink)} className='ml-2 text-neutral-500 hover:text-neutral-700 cursor-pointer'><IoCopyOutline /></button>
            </div>
          </div>
        </div>


        <div className="w-[1px] mx-5 ml-6  h-3 bg-gray-300"></div>
        {/* Topics */}
        <div className="relative px-4 py-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full p-1 border border-gray-300 flex items-center justify-center">
              <RiChatAiLine className="text-gray-500 text-sm" />
            </div>
            <span className="text-sm text-gray-600 font-medium">Topics:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topics.map((topic) => (
              <span
                key={topic.id}
                className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {topic.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Controls - always at bottom */}
      <div className="px-4 py-2 flex justify-between items-center mt-auto flex-shrink-0">
        <Switch
          checked={isActive}
          onCheckedChange={handleToggleChange}
          disabled={updateLeadStatusMutation.isPending}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleEditClick}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
              <FiEdit size={16} />
            </div>
          </button>
          <button
            onClick={handleDeleteClick}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
              <RiDeleteBin6Line size={16} />
            </div>
          </button>
        </div>
      </div>
      {/* Toggle Confirmation Dialog */}
      <ActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={pendingState === false
          ? `Are you sure you want to pause the ${extractBotName()}?`
          : `Do you want to enable the ${extractBotName()}?`}
        description={pendingState === false
          ? "Pausing the bot stops its operation, which could impact performance monitoring."
          : "It will improve the website's user experience while streamlining user tracking, automation, and engagement effortlessly."}
        confirmLabel={pendingState === false ? "Pause" : "Enable"}
        onConfirm={handleConfirmToggle}
        loading={updateLeadStatusMutation.isPending}
        type={pendingState === false ? "alert" : "default"}
        icon={<img src="/Toggle-off.svg" alt={pendingState === false ? "Pause Icon" : "Enable Icon"} className={`mx-auto mb-2 ${pendingState === false ? '' : ' rotate-180'}`} />}
      />

      {/* Delete Confirmation Dialog */}
      <ActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        type="alert"
        title={`Are you sure you want to delete ${extractBotName()}?`}
        description={`This action will permanently remove the ${extractBotName()}, and it cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        loading={deleteLeadConciergeMutation.isPending}
        icon={<MdDeleteOutline size={48} className="text-black-500 mx-auto mb-2" />}
      />

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen} >
        <DialogContent className="max-w-6xl h-[95vh] p-0">
          <div className="flex flex-col h-full">
            <div className="p-3 sm:p-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <TabSlice
                className="mt-2"
                tabs={[
                  { label: "Bot", value: "Bot" },
                  { label: "Chat", value: "Chat" },
                  ...(intitalData.popupConfig.enabled ? [{ label: "Exit Popup", value: "Popup" }] : []),
                ]}
                activeTab={activeTab}
                onTabChange={(v) => {
                  setActiveTab(v);
                }}
              />
            </div>
            <div className="flex-1 p-3 sm:p-4">
              <div className="h-full relative rounded-lg overflow-hidden border">
                {/** Provide builder context so preview components work outside builder pages */}
                <ChatbotBuilderProvider
                  initialData={intitalData}
                >
                  <PreviewLandingPage position={intitalData?.botAppearance?.position?.replace('_', '-') || 'bottom-right'}>
                    {activeTab === 'Chat' && <ChatbotPreview initialState="open" initialData={intitalData} />}
                    {activeTab === 'Bot' && <ChatbotPreview initialState="closed" initialData={intitalData} />}
                  </PreviewLandingPage>
                  {activeTab === 'Popup' && (
                    <div className={`max-w-sm bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 absolute ${getPopupPositionClasses(intitalData.popupConfig.position)}`}>
                      <div className="p-4">
                        <p className="text-center mb-4">{intitalData?.popupConfig?.message}</p>
                        <div className="space-y-1 flex gap-2">
                          <button style={{ borderColor: hasGradient ? gradientStart : intitalData.botAppearance.themeColor || '', color: hasGradient ? gradientStart : intitalData.botAppearance.themeColor || '', }} className="w-full py-1 px-4 rounded-xl bg-gray-100 border ">
                            {intitalData?.popupConfig?.positiveResponse}
                          </button>
                          <button style={{
                            backgroundImage: hasGradient ? `linear-gradient(90deg, ${gradientStart}, ${gradientEnd})` : undefined,
                            backgroundColor: !hasGradient ? intitalData.botAppearance.themeColor || '' : undefined,
                          }} className={`w-full py-1 px-4 rounded-xl text-white`}>
                            {intitalData?.popupConfig?.negativeResponse}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </ChatbotBuilderProvider>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div >
  );
};

export const BoatCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
      {/* Main Image Skeleton with Chatbot Overlay */}
      <div className="relative w-full h-48">
        <Skeleton className="w-full h-full" />

        {/* Chatbot Message with Avatar Skeleton - Overlay on image */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-48 h-8 rounded-2xl rounded-bl-sm" />
          </div>
        </div>
      </div>

      {/* Link to site Skeleton */}
      <div className="px-4 py-2 flex items-center gap-2">
        <Skeleton className="w-4 h-4" />
        <Skeleton className="w-20 h-4" />
        <Skeleton className="flex-1 h-4" />
        <Skeleton className="w-4 h-4" />
      </div>

      {/* Topics Skeleton */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="w-20 h-6 rounded-full" />
          <Skeleton className="w-24 h-6 rounded-full" />
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
      </div>

      {/* Controls Skeleton */}
      <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
        <Skeleton className="w-10 h-5 rounded-full" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default BotCard;
