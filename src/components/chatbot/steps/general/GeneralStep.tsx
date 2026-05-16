"use client";

import React, { useState } from "react";
import PublishIntakeBotContent, {
  PublishIntakeBotStatusTag,
} from "./PublishIntakeBotContent";
import UserInfoInputsContent, {
  UserInfoInputsStatusTag,
} from "./UserInfoInputsContent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useChatbotBuilder } from "@/store/ChatbotBuilderContext";
import { IoCheckmarkCircle } from "react-icons/io5";

export interface GeneralStepProps {
  onNext?: () => void;
  onClose?: () => void;
}

const GeneralStep: React.FC<GeneralStepProps> = ({ onNext, onClose }) => {
  const { state } = useChatbotBuilder();
  const { mainDomain } = state.publishInfo;
  const steps = [
    { id: 1, name: "General", isActive: true },
    { id: 2, name: "Questionnaire" },
    { id: 3, name: "Detailed Settings" },
    { id: 4, name: "Review" },
  ];
  const [accordionStates, setAccordionStates] = useState<
    Record<string, boolean>
  >({
    "publish-intake-bot": true,
    "user-info-inputs": false,
  });

  // Track which accordion is currently open
  const [openAccordionId, setOpenAccordionId] = useState<string | undefined>(
    "publish-intake-bot"
  );

  const handleValueChange = (value: string | undefined) => {
    setOpenAccordionId(value);
    // Update accordion states based on value
    setAccordionStates((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        newState[key] = key === value;
      });
      return newState;
    });
  };
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 overflow-auto">
        <div className="mx-auto space-y-6">
          <Accordion
            type="single"
            collapsible
            value={openAccordionId}
            onValueChange={handleValueChange}
            className="w-full"
          >
            <AccordionItem
              value="publish-intake-bot"
              className="border-0 bg-white rounded-lg shadow-sm mb-4"
            >
              <AccordionTrigger className="px-4 py-3 text-base font-medium">
                <div className="flex items-center gap-2.5 flex-1">
                  {!accordionStates["publish-intake-bot"] && mainDomain ? (
                    <IoCheckmarkCircle className="w-6 h-6" />
                  ) : (
                    <div className="w-6 h-6 rounded-full items-center bg-gray-100 text-gray-500">
                      1
                    </div>
                  )}
                  <span>Publish Intake Bot on</span>
                  {!accordionStates["publish-intake-bot"] && (
                    <div>
                      <PublishIntakeBotStatusTag />
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <PublishIntakeBotContent />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="user-info-inputs"
              className="border-0 bg-white rounded-lg shadow-sm mb-4"
            >
              <AccordionTrigger className="px-4 py-3 text-base font-medium">
                <div className="flex items-center gap-2.5 flex-1">
                  {!accordionStates["user-info-inputs"] && !accordionStates["publish-intake-bot"] && mainDomain ? (
                    <IoCheckmarkCircle className="w-6 h-6" />
                  ) : (
                    <div className="w-6 h-6 rounded-full items-center bg-gray-100 text-gray-500">
                      2
                    </div>
                  )}
                  <span>Set up User Info Inputs</span>
                  {!accordionStates["user-info-inputs"] && (
                    <div>
                      <UserInfoInputsStatusTag />
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <UserInfoInputsContent />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default GeneralStep;
