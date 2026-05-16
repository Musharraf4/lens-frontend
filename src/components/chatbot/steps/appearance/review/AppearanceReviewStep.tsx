import React, { useState } from 'react';
import { useChatbotBuilder } from '@/store/ChatbotBuilderContext';
import ChatbotPreview from '@/components/chatbot/ChatbotPreview';
import PreviewLandingPage from '@/components/chatbot/PreviewLandingPage';
import { TabSlice } from '@/components/TabSlice';
import DeviceSelector from '@/components/chatbot/DeviceSelector';

interface AppearanceReviewStepProps {
  showPreview?: boolean;
}

const AppearanceReviewStep: React.FC<AppearanceReviewStepProps> = ({ showPreview = true }) => {
  const { state, chatbotState, setChatbotState, toggleChatbotState, setSelectedDevice } = useChatbotBuilder();
  const [activeTab, setActiveTab] = useState("Bot");

  const { popupConfig } = state;
  const { selectedDevice } = state;

  const { position } = state.botAppearance;
  const tabOptions = [
    { label: "Bot", value: "Bot" },
    { label: "Chat", value: "Chat", },
    ...(popupConfig.enabled ? [{ label: "Exit Popup", value: "Popup" }] : []),
  ];

  // Helper function for popup positioning (supports synonyms like top_center)
  const getPopupPositionClasses = (pos: string) => {
    const p = (pos || '').replace('-', '_');
    switch (p) {
      case 'center_top':
      case 'top_center':
        return 'top-[109px] left-1/2 -translate-x-1/2';
      case 'center_bottom':
      case 'bottom_center':
        return 'bottom-8 left-1/2 -translate-x-1/2';
      case 'center_center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default:
        return 'top-20 left-1/2 -translate-x-1/2';
    }
  };
  const gradientStart = state.botAppearance.gradientColor?.color1;
  const gradientEnd = state.botAppearance.gradientColor?.color2;
  const hasGradient =
    state.botAppearance.themeType === 'gradient' &&
    Boolean(gradientStart && gradientEnd);
  // Full-width preview component for the review step
  const reviewContent = (
    <div className="space-y-8">
      {/* Preview landing page with the chatbot */}
      <div className="border rounded-lg overflow-hidden flex flex-col">
        <div className="bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 px-3 sm:px-4 py-2 flex-shrink-0">
          <TabSlice
            className="mt-2"
            tabs={tabOptions}
            activeTab={activeTab}
            onTabChange={(v) => {
              if (v === 'Chat' && chatbotState === 'closed') {
                setChatbotState('open');
              } else {
                setChatbotState('closed');
              }
              setActiveTab(v);
            }}
          />
          <div className="flex items-center">
            <DeviceSelector
              selectedDevice={selectedDevice}
              onDeviceChange={setSelectedDevice}
            />
          </div>
        </div>
        <div className="p-3 sm:p-4 flex-1 min-h-0">
          <div className="min-h-[400px] h-full max-h-[600px] sm:max-h-[700px] md:max-h-[800px] relative overflow-hidden">
            <PreviewLandingPage position={position} hideDeviceSelector={true} height={true}>
              {activeTab === 'Bot' && <ChatbotPreview initialState="closed" />}
              {activeTab === 'Chat' && <ChatbotPreview initialState="open" />}
              {activeTab === 'Popup' && <ChatbotPreview initialState="closed" />}
            </PreviewLandingPage>
            {activeTab === 'Popup' && (
              <div className={`max-w-sm w-[calc(100%-1rem)] bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 absolute z-50 ${getPopupPositionClasses(popupConfig.position)}`}>
                <div className="p-4">
                  <p className="text-center mb-4">{popupConfig.message}</p>
                  <div className="space-y-1 flex gap-2">
                    <button style={{ borderColor: hasGradient ? gradientStart : state.botAppearance.themeColor || '', color: hasGradient ? gradientStart : state.botAppearance.themeColor || '', }} className="w-full py-1 px-4 rounded-xl bg-gray-100 border border-gray-200">
                      {popupConfig.positiveResponse}
                    </button>
                    <button
                      style={{
                        backgroundImage: hasGradient ? `linear-gradient(90deg, ${gradientStart}, ${gradientEnd})` : undefined,
                        backgroundColor: !hasGradient ? state.botAppearance.themeColor || '' : undefined,
                      }}
                      className="w-full py-1 px-4 rounded-xl text-white"
                    >
                      {popupConfig.negativeResponse}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // If showPreview is false (for tablet/mobile), don't render the preview
  if (!showPreview) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Review & Publish</h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Review all your chatbot appearance settings before publishing your changes.
          </p>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Preview is shown in the main preview area</p>
        </div>
      </div>
    );
  }

  // For web view, show the full layout with preview
  return (
    <div className="space-y-2">
      {reviewContent}
    </div>
  );
};

export default AppearanceReviewStep;
