"use client";

import { useNumberContext } from "@/store/CreateNumberContext";
import Image from "next/image";
import React, { useState } from "react";
import { ActionDialog } from "../ActionDialog";
import { ControlledAccordion } from "../ControlledAccordion";
import ChatBotHeader from "../chatbot/ChatBotHeader";
import ChatbotAccordion from "../chatbot/ChatbotAccordion";
import { Button } from "../ui/button";
import { useGeneralSetupSteps } from "./steps/GeneralSetupSteps";
import { useCallConfigurationSettingsStep } from "./steps/dynamic/CallConfigurationSettingsStep";
import { useDynamicDetailedSettingsStep } from "./steps/dynamic/DynamicDetailedSettingsStep";
import { useDynamicReviewStep } from "./steps/dynamic/DynamicReviewStep";
import { useNumberPoolGeneratorSteps } from "./steps/dynamic/NumberPoolGeneratorSteps";
import { useDetailedSettingsSteps } from "./steps/static/DetailedSettingsSteps";
import { useNumberGeneratorSteps } from "./steps/static/NumberGeneratorSteps";
import { useReviewStep } from "./steps/static/ReviewStep";
import { useRouter } from 'next/navigation';

const staticSteps = [
  { id: 1, name: "General Setup" },
  { id: 2, name: "Number Generator" },
  { id: 3, name: "Detailed Settings" },
  { id: 4, name: "Review" },
];

const dynamicSteps = [
  { id: 1, name: "General Setup" },
  { id: 2, name: "Number Pool Generator" },
  { id: 3, name: "Call Configuration Settings" },
  { id: 4, name: "Detailed Settings" },
  { id: 5, name: "Review" },
];

function CreateNumberModal() {
  const {
    setCreateNumberModalOpen,
    selectedNumberType,
    selectedTrafficSource,
    phoneNumber,
    currentStep,
    setCurrentStep,
    numberSpecification,
    selectedGeneratedNumber,
    numberName,
    swapNumber,
    dailyVisitors,
    trackingNumbers,
    areaCode,
    selectedNumbers,
    forwardingNumber,
    resetNumberCreation,
    handleSavedNumberDraft,
    purchaseNumber,
    activeIds,
    setActiveIds,
  } = useNumberContext();
  const router = useRouter();
  const generalSetupSteps = useGeneralSetupSteps();
  const isDynamic = selectedNumberType === "dynamic";
  const steps = isDynamic ? dynamicSteps : staticSteps;
  const numberGeneratorSteps = isDynamic
    ? useNumberPoolGeneratorSteps()
    : useNumberGeneratorSteps();
  const detailedSettingsSteps = useDetailedSettingsSteps();
  const reviewStep = isDynamic ? useDynamicReviewStep() : useReviewStep();
  const numberPoolGeneratorSteps = useNumberPoolGeneratorSteps();
  const callConfigurationSettingsStep = useCallConfigurationSettingsStep();
  const dynamicDetailedSettingsSteps = useDynamicDetailedSettingsStep();

  const [saveDraftDialogOpen, setSaveDraftDialogOpen] = useState(false);
  const [draftName, setDraftName] = useState("");

  const renderSteps = () => {
    if (isDynamic) {
      switch (currentStep) {
        case 1:
          return (
            <ControlledAccordion
              activeIds={activeIds}
              setActiveIds={setActiveIds}
              steps={generalSetupSteps}
            />
          );
        case 2:
          return (
            <ControlledAccordion
              activeIds={activeIds}
              setActiveIds={setActiveIds}
              steps={numberGeneratorSteps}
            />
          );
        case 3:
          return callConfigurationSettingsStep.map((step) => (
            <ChatbotAccordion
              key={step.id}
              id={step.id.toString()}
              stepNumber={step.id}
              title={step.label}
              children={step.body}
            />
          ));
        case 4:
          return dynamicDetailedSettingsSteps.map((step) => (
            <ChatbotAccordion
              key={step.id}
              id={step.id.toString()}
              stepNumber={step.id}
              title={step.label}
              children={step.body}
            />
          ));
        case 5:
          return reviewStep.map((step) => <div key={step.id}>{step.body}</div>);
        default:
          return null;
      }
    } else {
      switch (currentStep) {
        case 1:
          return (
            <ControlledAccordion
              activeIds={activeIds}
              setActiveIds={setActiveIds}
              steps={generalSetupSteps}
            />
          );
        case 2:
          return <ControlledAccordion
            activeIds={activeIds}
            setActiveIds={setActiveIds}
            steps={numberGeneratorSteps}
          />
        case 3:
          return detailedSettingsSteps.map((step) => <div key={step.id}>{step.body}</div>);
        case 4:
          return reviewStep.map((step) => <div key={step.id}>{step.body}</div>);
        default:
          return null;
      }
    }
  };
  const isNextButtonDisabled = () => {
    switch (currentStep) {
      case 1:
        if (selectedNumberType === "dynamic") {
          // For dynamic, require number type and at least one traffic source
          return !(selectedNumberType && selectedTrafficSource.length > 0);
        } else {
          // For static, require number type, traffic source, and phone number
          return !(
            selectedNumberType === "static" &&
            selectedTrafficSource.length > 0 &&
            /^\+?\d{8,15}$/.test(forwardingNumber)
          );
        }
      case 2:
        if (selectedNumberType === "dynamic") {
          // For dynamic, require number pool generator settings
          return !(
            dailyVisitors &&
            trackingNumbers &&
            areaCode &&
            selectedNumbers.length > 0 &&
            selectedNumbers.length === trackingNumbers
          );
        } else {
          // For static, require number generator settings
          return !(numberSpecification && selectedGeneratedNumber && numberName.trim() !== '');
        }
      case 3:
        if (selectedNumberType === "dynamic") {
          // For dynamic, require call configuration settings
          return !(forwardingNumber && numberName && swapNumber);
        } else {
          // For static, detailed settings are optional
          return false;
        }
      case 4:
        if (selectedNumberType === "dynamic") {
          // For dynamic, detailed settings are optional
          return false;
        } else {
          // For static, this is the review step
          return false;
        }
      case 5:
        // This is only for dynamic flow, review step
        return false;
      default:
        return false;
    }
  };

  const handleCreateNumber = () => {
    // This would handle the API call to create the number
    setCreateNumberModalOpen(false);
    // After successful creation, you could redirect or show a success message
    purchaseNumber();
  };

  return (
    <div className="flex flex-col h-screen bg-white rounded-xl shadow-lg overflow-auto">
      <ChatBotHeader
        title="Create Number"
        steps={steps}
        currentStep={currentStep}
        onClose={() => {
          resetNumberCreation();
          setCreateNumberModalOpen(false);
        }}
      />
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="space-y-4">{renderSteps()}</div>

        {/* Footer Buttons */}
        <div className="flex justify-between gap-3 mt-8">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Previous step
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button
              variant="outline"
              onClick={() => setSaveDraftDialogOpen(true)}
            >
              Save as Draft
            </Button>
            {(isDynamic ? currentStep === 5 : currentStep === 4) ? (
              <Button
                variant="default"
                onClick={handleCreateNumber}
              >
                Create number
              </Button>
            ) : (
              <Button
                variant="default"
                disabled={isNextButtonDisabled()}
                onClick={() => {
                  setCurrentStep(currentStep + 1);
                  setActiveIds(["1"]);
                }}
              >
                Next Step
              </Button>
            )}
          </div>
        </div>
      </div>
      {/* Save as Draft ActionDialog */}
      <ActionDialog
        open={saveDraftDialogOpen}
        onOpenChange={setSaveDraftDialogOpen}
        type="edit"
        title="Save as Draft"
        description="Rename your draft, or it will be automatically labeled as 'Draft'"
        confirmLabel="Save"
        cancelLabel="Cancel"
        onConfirm={() => {
          handleSavedNumberDraft(draftName || "Draft");
          router.push('/tracking/saved-drafts')
          setSaveDraftDialogOpen(false);
          setDraftName("");
        }}
        fields={[
          {
            id: "draftName",
            label: "Name",
            placeholder: "Draft",
            required: false,
          },
        ]}
        formValues={{ draftName }}
        onFieldChange={(id, value) => setDraftName(value)}
        icon={
          <Image
            src="/file.svg"
            alt="Save Draft"
            width={36}
            height={36}
          />
        }
      />
    </div>
  );
}

export default CreateNumberModal;
