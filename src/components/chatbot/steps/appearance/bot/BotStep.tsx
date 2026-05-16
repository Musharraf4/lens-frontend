// src/components/chatbot/steps/appearance/bot/BotStep.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChatbotBuilder } from "@/store/ChatbotBuilderContext";
import ImageUploader from "@/components/chatbot/ImageUploader";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PreviewLandingPage from "@/components/chatbot/PreviewLandingPage";
import ChatbotPreview from "@/components/chatbot/ChatbotPreview";
import { uploadAttachment } from "@/services/chatbot.api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IoCheckmarkCircle } from "react-icons/io5";

interface BotStepProps {
  showPreview?: boolean;
}

const BotStep: React.FC<BotStepProps> = ({ showPreview = true }) => {
  const [openAccordionId, setOpenAccordionId] = useState<string | undefined>(
    "create-bot-name"
  );
  const handleValueChange = (value: string | undefined) => {
    setOpenAccordionId(value);
  };
  const { state, setBotAppearance } = useChatbotBuilder();
  const [errors, setErrors] = React.useState({
    botName: "",
    greeting: "",
  });
  const { botName, botPhoto, botPreviewPhoto, photoType, greeting, position } =
    state.botAppearance;
  const { selectedDevice } = state;

  // State for controlling ChatbotPreview display state
  const [previewState, setPreviewState] = useState<"open" | "closed">("closed");

  // Toggle preview state
  const togglePreviewState = () => {
    setPreviewState((prev) => (prev === "open" ? "closed" : "open"));
  };
  // Loading state for preview image upload
  const [isPreviewUploading, setIsPreviewUploading] = useState<boolean>(false);

  // Handle bot name change
  const handleBotNameChange = (name: string) => {
    setBotAppearance((prev) => ({
      ...prev,
      botName: name,
    }));
    if (errors.botName) {
      setErrors((prev) => ({
        ...prev,
        botName: "",
      }));
    }
  };

  // Handle photo upload with actual file data
  const handlePhotoUpload = (imageDataUrl: string) => {
    setBotAppearance((prev) => ({
      ...prev,
      photoType: "custom",
      botPhoto: imageDataUrl,
    }));
  };
  // Handle photo upload with actual file data
  const handlePreviewUpload = async (imageDataUrl: string) => {
    try {
      setIsPreviewUploading(true);
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], "bot-photo.jpg", { type: "image/jpeg" });
      const uploadResponse = await uploadAttachment(file, "image");
      setBotAppearance((prev) => ({
        ...prev,
        photoType: "custom",
        botPreviewPhoto: uploadResponse.url,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsPreviewUploading(false);
    }
  };

  // Handle photo deletion
  const handlePhotoDelete = () => {
    setBotAppearance((prev) => ({
      ...prev,
      photoType: "default",
      botPhoto: null,
    }));
  };

  // Handle photo deletion
  const handlePreviewDelete = () => {
    setBotAppearance((prev) => ({
      ...prev,
      photoType: "default",
      botPreviewPhoto: null,
    }));
  };

  // Handle greeting message change
  const handleGreetingChange = (message: string) => {
    setBotAppearance((prev) => ({
      ...prev,
      greeting: message,
    }));
    if (errors.greeting) {
      setErrors((prev) => ({
        ...prev,
        greeting: "",
      }));
    }
  };

  // Handle position selection
  const handlePositionChange = (value: string) => {
    setBotAppearance((prev) => ({
      ...prev,
      position: value,
    }));
  };

  // Preview component
  const preview = (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <div className="h-[600px] relative">
        <PreviewLandingPage position={position}>
          <ChatbotPreview initialState={previewState} />
        </PreviewLandingPage>
      </div>
    </div>
  );

  return (
    <div className="">
      {/* <div>
        <h2 className="text-xl sm:text-2xl font-bold">Bot Appearance</h2>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">Customize how your bot appears to users. Set a name and choose an avatar.</p>
      </div> */}

      {/* Mobile Preview Toggle Button */}
      <div className="block md:hidden mb-4">
        <button
          onClick={togglePreviewState}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium flex items-center justify-center gap-2"
        >
          {previewState === "closed" ? "Show Preview" : "Hide Preview"}
        </button>
      </div>

      {/* Mobile Preview (Collapsible) */}
      {previewState === "open" && (
        <div className="block md:hidden mb-4 h-[400px] overflow-hidden rounded-lg">
          {preview}
        </div>
      )}

      <div
        className={
          showPreview
            ? `grid gap-4 md:gap-6 ${selectedDevice === "web"
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
              ? `${selectedDevice === "web"
                ? "col-span-1 md:col-span-3"
                : selectedDevice === "tablet"
                  ? "col-span-1"
                  : "col-span-1"
              }`
              : "w-full"
          }
        >
          <div className="space-y-4">
            <Accordion
              type="single"
              collapsible
              value={openAccordionId}
              onValueChange={handleValueChange}
              className="w-full"
            >
              {/* Create Bot Name Accordion */}
              <AccordionItem
                value="create-bot-name"
                className="border-0 bg-white rounded-lg shadow-sm mb-4"
              >
                <AccordionTrigger className="px-4 py-3 text-base font-medium">
                  <div className="flex items-center gap-2.5 flex-1">
                    {openAccordionId !== "create-bot-name" && botName ? (
                      <IoCheckmarkCircle className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-full items-center bg-gray-100 text-gray-500">
                        1
                      </div>
                    )}
                    <span>
                      Create Bot Name
                      <span className="text-destructive ml-1 mt-1">*</span>
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="py-3">
                    <Input
                      id="bot-name"
                      value={botName}
                      onChange={(e) => handleBotNameChange(e.target.value)}
                      placeholder="Enter name"
                      className="mt-2"
                      required
                    />
                    {errors.botName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.botName}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Setting a bot name makes interactions personal, engaging,
                      and easy to recognize.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Add Photo Accordion */}
              <AccordionItem
                value="add-photo"
                className="border-0 bg-white rounded-lg shadow-sm mb-4"
              >
                <AccordionTrigger className="px-4 py-3 text-base font-medium">
                  <div className="flex items-center gap-2.5 flex-1">
                    {openAccordionId !== "add-photo" && botPhoto ? (
                      <IoCheckmarkCircle className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-full items-center bg-gray-100 text-gray-500">
                        2
                      </div>
                    )}
                    <span>Add Photo</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="py-3">
                    <ImageUploader
                      currentImage={botPhoto}
                      onImageUpload={handlePhotoUpload}
                      onImageDelete={handlePhotoDelete}
                    />
                    <p className="text-xs text-gray-500 mt-4 text-center">
                      Choose a friendly, simple image that matches your bot's
                      purpose and brand.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Create Greeting Accordion */}
              <AccordionItem
                value="create-greeting"
                className="border-0 bg-white rounded-lg shadow-sm mb-4"
              >
                <AccordionTrigger className="px-4 py-3 text-base font-medium">
                  <div className="flex items-center gap-2.5 flex-1">
                    {openAccordionId !== "create-greeting" && greeting ? (
                      <IoCheckmarkCircle className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-full items-center bg-gray-100 text-gray-500">
                        3
                      </div>
                    )}
                    <span>
                      Create Greeting
                      <span className="text-destructive ml-1 mt-1">*</span>
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="py-3">
                    <Input
                      id="greeting-message"
                      value={greeting || ""}
                      onChange={(e) => handleGreetingChange(e.target.value)}
                      placeholder="Enter message"
                      className="mt-0"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      The greeting message appears before the bot opens and
                      should be no longer than 50 characters.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Select Positioning Accordion */}
              <AccordionItem
                value="select-positioning"
                className="border-0 bg-white rounded-lg shadow-sm mb-4"
              >
                <AccordionTrigger className="px-4 py-3 text-base font-medium">
                  <div className="flex items-center gap-2.5 flex-1">
                    {openAccordionId !== "select-positioning" && position ? (
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
                  <div className="py-3">
                    <RadioGroup
                      value={position || "bottom-right"}
                      onValueChange={handlePositionChange}
                      className="grid grid-cols-2 gap-3 sm:gap-6"
                    >
                      <div className="flex flex-col items-center">
                        <img
                          src="/assets/lead-concierge/chatbot/positions/bottom-left.png"
                          alt="Bottom Left Position"
                          className="w-full rounded-lg border border-gray-200 mb-2"
                        />
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value="bottom-left"
                            id="position-bottom-left"
                          />
                          <Label htmlFor="position-bottom-left">
                            Bottom Left
                          </Label>
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <img
                          src="/assets/lead-concierge/chatbot/positions/bottom-right.png"
                          alt="Bottom Right Position"
                          className="w-full rounded-lg border border-gray-200 mb-2"
                        />
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value="bottom-right"
                            id="position-bottom-right"
                          />
                          <Label htmlFor="position-bottom-right">
                            Bottom Right
                          </Label>
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <img
                          src="/assets/lead-concierge/chatbot/positions/center-left.png"
                          alt="Center Left Position"
                          className="w-full rounded-lg border border-gray-200 mb-2"
                        />
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value="center-left"
                            id="position-center-left"
                          />
                          <Label htmlFor="position-center-left">
                            Center Left
                          </Label>
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <img
                          src="/assets/lead-concierge/chatbot/positions/center-right.png"
                          alt="Center Right Position"
                          className="w-full rounded-lg border border-gray-200 mb-2"
                        />
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value="center-right"
                            id="position-center-right"
                          />
                          <Label htmlFor="position-center-right">
                            Center Right
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                      Bot positioning determines how it will appear on the
                      website.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Add Preview Accordion */}
              <AccordionItem
                value="preview-bot"
                className="border-0 bg-white rounded-lg shadow-sm mb-4"
              >
                <AccordionTrigger className="px-4 py-3 text-base font-medium">
                  <div className="flex items-center gap-2.5 flex-1">
                    {openAccordionId !== "preview-bot" && botPreviewPhoto ? (
                      <IoCheckmarkCircle className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-full items-center bg-gray-100 text-gray-500">
                        5
                      </div>
                    )}
                    <span>Preview Bot</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="py-3 relative">
                    <ImageUploader
                      currentImage={botPreviewPhoto}
                      onImageUpload={handlePreviewUpload}
                      onImageDelete={handlePreviewDelete}
                      isPreviewStep={true}
                    />
                    {isPreviewUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
                        <div className="h-8 w-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-4 text-center">
                      Choose a friendly, simple image that matches your bot's
                      purpose and brand.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {showPreview && (
          <div
            className={`${selectedDevice === "web"
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

export default BotStep;
