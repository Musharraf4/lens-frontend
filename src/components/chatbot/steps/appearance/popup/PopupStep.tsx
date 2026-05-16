import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useChatbotBuilder } from "@/store/ChatbotBuilderContext";
import PreviewLandingPage from "@/components/chatbot/PreviewLandingPage";
import ChatbotPreview from "@/components/chatbot/ChatbotPreview";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IoCheckmarkCircle } from "react-icons/io5";

interface PopupStepProps {
  showPreview?: boolean;
}

const PopupStep: React.FC<PopupStepProps> = ({ showPreview = true }) => {
  const { state, setPopupConfig } = useChatbotBuilder();
  const { popupConfig } = state;
  const { selectedDevice } = state;
  const { position } = state.botAppearance;
  const [openAccordionId, setOpenAccordionId] = useState<string | undefined>(
    popupConfig.enabled ? "type-selection" : undefined
  );
  const [openedAccordions, setOpenedAccordions] = useState<Set<string>>(
    popupConfig.enabled ? new Set(["type-selection"]) : new Set()
  );

  const handleValueChange = (value: string | undefined) => {
    setOpenAccordionId(value);
    // Track that this accordion has been opened
    if (value) {
      setOpenedAccordions((prev) => new Set([...prev, value]));
    }
  };

  // Helper functions to check if accordions are completed
  const isTypeSelectionCompleted = () => {
    return !!popupConfig.type;
  };

  const isMessageCustomizationCompleted = () => {
    return !!(
      popupConfig.message &&
      popupConfig.positiveResponse &&
      popupConfig.negativeResponse
    );
  };

  const isTriggerSetupCompleted = () => {
    if (!popupConfig.trigger) return false;
    if (popupConfig.trigger === "delay") {
      return popupConfig.delaySeconds > 0;
    }
    return true;
  };

  const isPositionSelectionCompleted = () => {
    return !!popupConfig.position;
  };

  // Use context for controlling ChatbotPreview display state
  const { chatbotState, toggleChatbotState } = useChatbotBuilder();

  // Toggle preview state using context
  const togglePreviewState = () => {
    toggleChatbotState();
  };

  // Helper function for popup positioning (supports synonyms like top_center)
  const getPopupPositionClasses = (pos: string) => {
    const p = (pos || "").replace("-", "_");
    switch (p) {
      case "center_top":
      case "top_center":
        return "top-[109px] left-1/2 -translate-x-1/2";
      case "center_bottom":
      case "bottom_center":
        return "bottom-8 left-1/2 -translate-x-1/2";
      case "center_center":
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      default:
        return "top-20 left-1/2 -translate-x-1/2";
    }
  };

  // Handle toggle for popup enabled/disabled
  const handleTogglePopup = (enabled: boolean) => {
    setPopupConfig({
      ...popupConfig,
      enabled,
    });
  };

  // Handle popup type change
  const handleTypeChange = (type: "binary_question" | "contact_options") => {
    setPopupConfig({
      ...popupConfig,
      type,
    });
  };

  // Handle message change
  const handleMessageChange = (message: string) => {
    setPopupConfig({
      ...popupConfig,
      message,
    });
  };

  // Handle positive response change
  const handlePositiveResponseChange = (positiveResponse: string) => {
    setPopupConfig({
      ...popupConfig,
      positiveResponse,
    });
  };

  // Handle negative response change
  const handleNegativeResponseChange = (negativeResponse: string) => {
    setPopupConfig({
      ...popupConfig,
      negativeResponse,
    });
  };

  // Handle trigger type change
  const handleTriggerChange = (trigger: "scroll" | "delay") => {
    setPopupConfig({
      ...popupConfig,
      trigger,
    });
  };

  // Handle delay seconds change
  const handleDelaySecondsChange = (delaySeconds: number) => {
    setPopupConfig({
      ...popupConfig,
      delaySeconds,
    });
  };

  // Handle position change
  const handlePositionChange = (
    position: "center_top" | "center_bottom" | "center_center"
  ) => {
    setPopupConfig({
      ...popupConfig,
      position,
    });
  };

  // Main container with popup toggle
  const popupContainer = (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Add Pop-up</h3>
          <p className="text-gray-500">
            Boost user engagement with a pop-up that grabs attention and starts
            the chat.
          </p>
        </div>
        <Switch
          checked={popupConfig.enabled}
          onCheckedChange={handleTogglePopup}
        />
      </div>
    </div>
  );

  // Type selection accordion
  const typeAccordion = (
    <div className="space-y-4 pt-4">
      <RadioGroup
        value={popupConfig.type}
        onValueChange={(value) =>
          handleTypeChange(value as "binary_question" | "contact_options")
        }
        className="space-y-4"
      >
        <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-4">
          <RadioGroupItem value="contact_options" id="contact_options" />
          <Label htmlFor="contact_options" className="flex-1 text-lg">
            Contact Options
          </Label>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-500">?</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-4">
          <RadioGroupItem value="binary_question" id="binary_question" />
          <Label htmlFor="binary_question" className="flex-1 text-lg">
            Binary question
          </Label>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-500">?</span>
          </div>
        </div>
      </RadioGroup>
    </div>
  );

  // Message customization accordion
  const messageAccordion = (
    <div className="space-y-4 pt-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <Input
          value={popupConfig.message}
          onChange={(e) => handleMessageChange(e.target.value)}
          placeholder="Enter your question here"
          className="mb-4"
        />

        <div className="space-y-3">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <Input
              value={popupConfig.positiveResponse}
              onChange={(e) => handlePositiveResponseChange(e.target.value)}
              placeholder="Yes, start chat"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-gray-500 ml-5">
            This answer will direct the user to the chat.
          </p>

          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <Input
              value={popupConfig.negativeResponse}
              onChange={(e) => handleNegativeResponseChange(e.target.value)}
              placeholder="No, thanks"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-gray-500 ml-5">
            This answer will close the pop-up.
          </p>
        </div>
      </div>
    </div>
  );

  // Trigger setup accordion
  const triggerAccordion = (
    <div className="space-y-4 pt-4">
      <RadioGroup
        value={popupConfig.trigger}
        onValueChange={(value) =>
          handleTriggerChange(value as "scroll" | "delay")
        }
        className="space-y-4"
      >
        <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-4">
          <RadioGroupItem value="scroll" id="scroll" />
          <Label htmlFor="scroll" className="flex-1">
            When user scrolls up
          </Label>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-500">?</span>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <RadioGroupItem value="delay" id="delay" />
            <Label htmlFor="delay" className="flex-1">
              After delay (sec)
            </Label>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500">?</span>
            </div>
          </div>

          {popupConfig.trigger === "delay" && (
            <div className="flex items-center justify-between">
              <button
                className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center"
                onClick={() =>
                  handleDelaySecondsChange(
                    Math.max(1, popupConfig.delaySeconds - 1)
                  )
                }
              >
                -
              </button>
              <span className="text-xl font-medium">
                {popupConfig.delaySeconds}
              </span>
              <button
                className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center"
                onClick={() =>
                  handleDelaySecondsChange(popupConfig.delaySeconds + 1)
                }
              >
                +
              </button>
            </div>
          )}
        </div>
      </RadioGroup>
    </div>
  );

  // Position selection accordion
  const positionAccordion = (
    <div className="space-y-4 pt-4">
      <RadioGroup
        value={popupConfig.position}
        onValueChange={(value) =>
          handlePositionChange(
            value as "center_top" | "center_bottom" | "center_center"
          )
        }
        className="grid grid-cols-2 gap-4"
      >
        <div className="col-span-1">
          <div className="relative bg-gray-100 aspect-video rounded-lg flex items-center justify-center mb-2 ">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-6 bg-blue-500 rounded"></div>
          </div>
          <div className="flex items-center justify-center">
            <RadioGroupItem value="center_center" id="center_center" />
          </div>
        </div>

        <div className="col-span-1">
          <div className="relative bg-gray-100 aspect-video rounded-lg flex items-center justify-center mb-2">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-blue-500 rounded"></div>
          </div>
          <div className="flex items-center justify-center">
            <RadioGroupItem value="center_top" id="center_top" />
          </div>
        </div>

        <div className="col-span-1">
          <div className="relative bg-gray-100 aspect-video rounded-lg flex items-center justify-center mb-2">
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-blue-500 rounded"></div>
          </div>
          <div className="flex items-center justify-center">
            <RadioGroupItem value="center_bottom" id="center_bottom" />
          </div>
        </div>
      </RadioGroup>

      <p className="text-sm text-gray-500 mt-4">
        Bot positioning determines how it will appear on the website.
      </p>
    </div>
  );
  const gradientStart = state.botAppearance.gradientColor?.color1;
  const gradientEnd = state.botAppearance.gradientColor?.color2;
  const hasGradient =
    state.botAppearance.themeType === "gradient" &&
    Boolean(gradientStart && gradientEnd);
  // Popup content component
  const popupContent = popupConfig.enabled ? (
    <div
      className={`max-w-sm bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 absolute ${getPopupPositionClasses(
        popupConfig.position
      )}`}
    >
      <div className="p-4">
        <p className="text-center mb-4">{popupConfig.message}</p>
        <div className="space-y-1 flex gap-2">
          <button
            style={{
              borderColor: hasGradient
                ? gradientStart
                : state.botAppearance.themeColor || "",
              color: hasGradient
                ? gradientStart
                : state.botAppearance.themeColor || "",
            }}
            className="w-full py-1 px-4 rounded-xl bg-gray-100 border border-gray-200"
          >
            {popupConfig.positiveResponse}
          </button>
          <button
            style={{
              backgroundImage: hasGradient
                ? `linear-gradient(90deg, ${gradientStart}, ${gradientEnd})`
                : undefined,
              backgroundColor: !hasGradient
                ? state.botAppearance.themeColor || ""
                : undefined,
            }}
            className="w-full py-1 px-4 rounded-xl text-white"
          >
            {popupConfig.negativeResponse}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // Preview component for the right side
  const preview = (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <div className="h-[600px] relative">
        <PreviewLandingPage position={position}>
          <ChatbotPreview initialState={"closed"} />
        </PreviewLandingPage>
        {/* Render popup outside the PreviewLandingPage to avoid positioning issues */}
        {popupConfig.enabled && popupContent}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* <div>
        <h2 className="text-xl sm:text-2xl font-bold">Talk to Us Pop-up</h2>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">Configure how the pop-up appears to engage users.</p>
      </div> */}

      {/* Mobile Preview Toggle Button */}
      <div className="block md:hidden mb-4">
        <button
          onClick={togglePreviewState}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium flex items-center justify-center gap-2"
        >
          {chatbotState === "open" ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      {/* Mobile Preview (Collapsible) */}
      {chatbotState === "open" && (
        <div className="block md:hidden mb-4 h-[400px] overflow-hidden rounded-lg">
          {preview}
        </div>
      )}

      <div
        className={
          showPreview
            ? `grid gap-4 ${selectedDevice === "web"
              ? "grid-cols-1 md:grid-cols-12"
              : selectedDevice === "tablet"
                ? "grid-cols-1"
                : "grid-cols-1"
            }`
            : "space-y-6"
        }
      >
        <div
          className={
            showPreview
              ? `space-y-6 ${selectedDevice === "web"
                ? "col-span-1 md:col-span-3"
                : selectedDevice === "tablet"
                  ? "col-span-1"
                  : "col-span-1"
              }`
              : "w-full space-y-6"
          }
        >
          {popupContainer}

          {popupConfig.enabled && (
            <Accordion
              type="single"
              collapsible
              value={openAccordionId}
              onValueChange={handleValueChange}
              className="w-full"
            >
              {/* Type selection accordion */}
              <AccordionItem
                value="type-selection"
                className="border-0 bg-white rounded-lg shadow-sm mb-4"
              >
                <AccordionTrigger className="px-4 py-3 text-base font-medium">
                  <div className="flex items-center gap-2.5 flex-1">
                    {isTypeSelectionCompleted() &&
                      openAccordionId !== "type-selection" &&
                      openedAccordions.has("type-selection") ? (
                      <IoCheckmarkCircle className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-full items-center bg-gray-100 text-gray-500">
                        1
                      </div>
                    )}
                    <span>Select type</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="space-y-4 pt-4">{typeAccordion}</div>
                </AccordionContent>
              </AccordionItem>

              {/* Message customization accordion */}
              <AccordionItem
                value="message-customization"
                className="border-0 bg-white rounded-lg shadow-sm mb-4"
              >
                <AccordionTrigger className="px-4 py-3 text-base font-medium">
                  <div className="flex items-center gap-2.5 flex-1">
                    {isMessageCustomizationCompleted() &&
                      openAccordionId !== "message-customization" &&
                      openedAccordions.has("message-customization") ? (
                      <IoCheckmarkCircle className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-full items-center bg-gray-100 text-gray-500">
                        2
                      </div>
                    )}
                    <span>Customise message</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="space-y-4 pt-4">{messageAccordion}</div>
                </AccordionContent>
              </AccordionItem>

              {/* Trigger setup accordion */}
              <AccordionItem
                value="trigger-setup"
                className="border-0 bg-white rounded-lg shadow-sm mb-4"
              >
                <AccordionTrigger className="px-4 py-3 text-base font-medium">
                  <div className="flex items-center gap-2.5 flex-1">
                    {isTriggerSetupCompleted() &&
                      openAccordionId !== "trigger-setup" &&
                      openedAccordions.has("trigger-setup") ? (
                      <IoCheckmarkCircle className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-full items-center bg-gray-100 text-gray-500">
                        3
                      </div>
                    )}
                    <span>Set up Trigger</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="space-y-4 pt-4">{triggerAccordion}</div>
                </AccordionContent>
              </AccordionItem>

              {/* Position selection accordion */}
              <AccordionItem
                value="position-selection"
                className="border-0 bg-white rounded-lg shadow-sm mb-4"
              >
                <AccordionTrigger className="px-4 py-3 text-base font-medium">
                  <div className="flex items-center gap-2.5 flex-1">
                    {isPositionSelectionCompleted() &&
                      openAccordionId !== "position-selection" &&
                      openedAccordions.has("position-selection") ? (
                      <IoCheckmarkCircle className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-full items-center bg-gray-100 text-gray-500">
                        4
                      </div>
                    )}
                    <span>Select Positioning</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="space-y-4 pt-4">{positionAccordion}</div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
        {showPreview && (
          <div
            className={`mt-6 ${selectedDevice === "web"
                ? "col-span-1 md:col-span-9 hidden md:block"
                : selectedDevice === "tablet"
                  ? "col-span-1"
                  : "col-span-1"
              }`}
          >
            {preview}
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupStep;
