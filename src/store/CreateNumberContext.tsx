"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import {
  getAvailablePhoneNumbers,
  IPhoneNumberSearchParams,
  usePurchasePhoneNumber,
  IPhoneNumberPurchaseRequest,
  IPhoneNumberPurchaseResponse,
} from "@/services/phoneNumbers.api";
import { ITwilioPhoneNumber } from "@/services/phoneNumbers.api";
import {
  IPhoneNumberDraftCreateRequest,
  useCreatePhoneNumberDraft,
} from "@/services/phoneNumberDrafts.api";
import { IPhoneNumberDraft } from "@/services/phoneNumberDrafts.api";
import { useSelectedCompanyStore } from "./SelectedCompany";
import { useQueryClient } from "@tanstack/react-query";

// Define the context type
interface NumberContextType {
  createNumberModalOpen: boolean;
  setCreateNumberModalOpen: (open: boolean) => void;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  selectedNumberType: string | null;
  setSelectedNumberType: React.Dispatch<React.SetStateAction<string | null>>;
  selectedTrafficSource: string[];
  setSelectedTrafficSource: React.Dispatch<React.SetStateAction<string[]>>;
  phoneNumber: string;
  setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
  numberSpecification: string;
  setNumberSpecification: React.Dispatch<React.SetStateAction<string>>;
  areaCode: string;
  setAreaCode: React.Dispatch<React.SetStateAction<string>>;
  selectedGeneratedNumber: string;
  setSelectedGeneratedNumber: React.Dispatch<React.SetStateAction<string>>;
  numberName: string;
  setNumberName: React.Dispatch<React.SetStateAction<string>>;
  activeIds: string[];
  setActiveIds: React.Dispatch<React.SetStateAction<string[]>>;
  // Call settings
  callRecordingEnabled: boolean;
  setCallRecordingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  callRecordingMessage: string;
  setCallRecordingMessage: React.Dispatch<React.SetStateAction<string>>;
  callGreetingEnabled: boolean;
  setCallGreetingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  callGreetingMessage: string;
  setCallGreetingMessage: React.Dispatch<React.SetStateAction<string>>;
  whisperMessageEnabled: boolean;
  setWhisperMessageEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  whisperMessage: string;
  setWhisperMessage: React.Dispatch<React.SetStateAction<string>>;
  excludedTrafficTypes: string[];
  setExcludedTrafficTypes: React.Dispatch<React.SetStateAction<string[]>>;
  dailyVisitors: number;
  setDailyVisitors: React.Dispatch<React.SetStateAction<number>>;
  trackingNumbers: number;
  setTrackingNumbers: React.Dispatch<React.SetStateAction<number>>;
  areaCodeError: boolean;
  setAreaCodeError: React.Dispatch<React.SetStateAction<boolean>>;
  areaCodeAlternatives: string[];
  setAreaCodeAlternatives: React.Dispatch<React.SetStateAction<string[]>>;
  selectedNumbers: string[];
  setSelectedNumbers: React.Dispatch<React.SetStateAction<string[]>>;
  swapNumber: string;
  setSwapNumber: React.Dispatch<React.SetStateAction<string>>;
  forwardingNumber: string;
  setForwardingNumber: React.Dispatch<React.SetStateAction<string>>;
  availableNumbers: ITwilioPhoneNumber[];
  isLoadingNumbers: boolean;
  resetNumberCreation: () => void;
  purchaseNumber: () => Promise<IPhoneNumberPurchaseResponse | undefined>;
  isPurchasing: boolean;
  handleSavedNumberDraft: (draftName: string) => void;
  handleContinueFromDraft: (draft: IPhoneNumberDraft) => void;
}

// Create the context with default values
const NumberContext = createContext<NumberContextType | undefined>(undefined);

// Provider component
export const NumberProvider = ({ children }: { children: ReactNode }) => {
  const [createNumberModalOpen, setCreateNumberModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeIds, setActiveIds] = React.useState<string[]>([]);
  const { selectedCompany } = useSelectedCompanyStore();
  const [selectedNumberType, setSelectedNumberType] = useState<string | null>(null);
  const [selectedTrafficSource, setSelectedTrafficSource] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [forwardingNumber, setForwardingNumber] = useState("");
  // Number generator states
  const [numberSpecification, setNumberSpecification] = useState("area-code");
  const [areaCode, setAreaCode] = useState("");
  const [selectedGeneratedNumber, setSelectedGeneratedNumber] = useState("");
  const [numberName, setNumberName] = useState("");
  // Call settings
  const [callRecordingEnabled, setCallRecordingEnabled] = useState(false);
  const [callRecordingMessage, setCallRecordingMessage] = useState(
    "This call will be recorded for quality assurance."
  );
  const [callGreetingEnabled, setCallGreetingEnabled] = useState(false);
  const [callGreetingMessage, setCallGreetingMessage] = useState("Hello, my name is Andrea");
  const [whisperMessageEnabled, setWhisperMessageEnabled] = useState(false);
  const [whisperMessage, setWhisperMessage] = useState("Message");
  const [excludedTrafficTypes, setExcludedTrafficTypes] = useState<string[]>([]);
  const [dailyVisitors, setDailyVisitors] = useState(0);
  const [trackingNumbers, setTrackingNumbers] = useState(0);
  const [areaCodeError, setAreaCodeError] = useState(false);
  const [areaCodeAlternatives, setAreaCodeAlternatives] = useState(["800", "320", "908"]);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [swapNumber, setSwapNumber] = useState("");
  const [availableNumbers, setAvailableNumbers] = useState<ITwilioPhoneNumber[]>([]);
  const [isLoadingNumbers, setIsLoadingNumbers] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Use the purchase phone number mutation hook
  const { mutateAsync: purchasePhoneNumberMutation } = usePurchasePhoneNumber({
    onSuccess: () => {
      resetNumberCreation();
    },
  });
  const queryClient = useQueryClient();

  const { mutateAsync: createNumberDraftMutation } = useCreatePhoneNumberDraft();

  // Debounce timer reference
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to purchase phone number
  const purchaseNumber = async (): Promise<IPhoneNumberPurchaseResponse | undefined> => {
    // If already purchasing, return early
    if (isPurchasing) return;

    try {
      setIsPurchasing(true);

      // Get the phone numbers to purchase
      const phonesToPurchase =
        selectedNumberType === "static"
          ? [selectedGeneratedNumber] // For static, use the single selected number
          : selectedNumbers; // For dynamic, use all selected numbers

      // If no numbers selected, return early
      if (phonesToPurchase.length === 0) {
        console.error("No phone numbers selected for purchase");
        setIsPurchasing(false);
        return;
      }

      // Create traffic filter string from selected traffic sources
      const trafficFilter = selectedTrafficSource.length > 0 ? selectedTrafficSource.join(",") : "";
      // Create the payload based on the number type
      const payload: IPhoneNumberPurchaseRequest = {
        phone_numbers: phonesToPurchase,
        number_name: numberName,
        name: numberName,
        source: selectedTrafficSource.length > 0 ? selectedTrafficSource[0] : "all_traffic",
        pool_type: selectedNumberType === "static" ? "static" : "dynamic", // The API interface seems to only support 'static' currently
        forwarding_number: forwardingNumber,
        call_recording_enabled: callRecordingEnabled,
        call_recording_message: callRecordingMessage,
        call_greeting_enabled: callGreetingEnabled,
        call_greeting_message: callGreetingMessage,
        call_whisper_enabled: whisperMessageEnabled,
        call_whisper_message: whisperMessage,
        status: "active",
        company_id: selectedCompany?.company?.id,
        traffic_filter: trafficFilter,
      };

      // If it's a dynamic number pool, we need to adjust the payload
      // (This would need backend support for dynamic pool_type)
      if (selectedNumberType === "dynamic") {
        // Modify payload for dynamic number pools if your API supports it
        // payload.pool_type = 'dynamic';
      }

      // Call the purchase mutation
      const response = await purchasePhoneNumberMutation(payload);
      queryClient.invalidateQueries({ queryKey: ["get-phone-numbers"] });

      setIsPurchasing(false);
      return response;
      // return response;
    } catch (error) {
      console.error("Error purchasing phone number:", error);
      setIsPurchasing(false);
      throw error;
    }
  };

  // Reset function to clear all states
  const resetNumberCreation = () => {
    setCurrentStep(1);
    setActiveIds([]);
    setSelectedNumberType("static");
    setSelectedTrafficSource([]);
    setPhoneNumber("");
    setForwardingNumber("");
    setNumberSpecification("area-code");
    setAreaCode("");
    setSelectedGeneratedNumber("");
    setNumberName("");
    setCallRecordingEnabled(false);
    setCallRecordingMessage("This call will be recorded for quality assurance.");
    setCallGreetingEnabled(false);
    setCallGreetingMessage("Hello, my name is Andrea");
    setWhisperMessageEnabled(false);
    setWhisperMessage("Message");
    setExcludedTrafficTypes([]);
    setDailyVisitors(0);
    setTrackingNumbers(0);
    setAreaCodeError(false);
    setAreaCodeAlternatives(["800", "320", "908"]);
    setSelectedNumbers([]);
    setSwapNumber("");
    setAvailableNumbers([]);
    setIsLoadingNumbers(false);
    setIsPurchasing(false);

    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  };

  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Clear available numbers immediately when area code changes
    setAvailableNumbers([]);
    setSelectedNumbers([]);

    // Check if area code is at least 3 characters
    if (areaCode.length >= 3 || numberSpecification === "toll-free") {
      // Set loading state
      setIsLoadingNumbers(true);

      // Start a new timer
      debounceTimerRef.current = setTimeout(async () => {
        try {
          // Call the API to fetch available numbers
          let params: IPhoneNumberSearchParams = {
            country_code: "US", // Default to US, can be made dynamic if needed
            voice_enabled: true,
            limit: selectedNumberType === "dynamic" ? 10 : 4, // Use 10 for dynamic, 4 for static
            is_toll_free: numberSpecification === "toll-free",
            company_id: selectedCompany?.company?.id,
          };

          // Only add area_code parameter if we're not requesting toll-free numbers
          if (numberSpecification !== "toll-free") {
            params.area_code = areaCode;
          }

          const numbers = await getAvailablePhoneNumbers(params);
          setAvailableNumbers(numbers);

          // Update error state if no numbers found
          setAreaCodeError(numbers.length === 0);

          // Reset loading state
          setIsLoadingNumbers(false);
        } catch (error) {
          console.error("Error fetching available numbers:", error);
          setAreaCodeError(true);
          setIsLoadingNumbers(false);
        }
      }, 1000); // 1 second debounce delay
    } else {
      // Reset loading state if criteria not met
      setIsLoadingNumbers(false);
    }

    // Cleanup function to clear the timer when component unmounts or area code changes again
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [areaCode, numberSpecification, selectedNumberType]);

  const handleSavedNumberDraft = (draftName: string) => {
    let draftPayload: IPhoneNumberDraftCreateRequest = {
      name: draftName,
      step_number: currentStep,
      total_steps: 0,
      step_name: "",
      data: {},
    };
    if (selectedNumberType === "static") {
      let currentStepName = ["General Step", "Number Generator", "Detailed Settings", "Review"]?.[
        currentStep
      ];
      draftPayload.total_steps = 4;
      draftPayload.step_name = currentStepName;
      if (currentStep >= 1) {
        draftPayload.data = {
          numberType: selectedNumberType,
          steps: [
            {
              step_number: 1,
              step_name: "General Step",
              data: {
                numberType: selectedNumberType,
                trafficSource: selectedTrafficSource,
                forwardingNumber: forwardingNumber,
              },
            },
          ],
        };
      }
      if (currentStep >= 2) {
        draftPayload.data.steps.push({
          step_number: 2,
          step_name: "Number Generator",
          data: {
            areaCode: areaCode,
            isTollFree: numberSpecification === "toll-free",
            selectedGeneratedNumber: selectedGeneratedNumber,
            numberName: numberName,
          },
        });
      }
      if (currentStep >= 3) {
        draftPayload.data.steps.push({
          step_number: 3,
          step_name: "Detailed Settings",
          data: {
            callRecordingEnabled: callRecordingEnabled,
            callRecordingMessage: callRecordingMessage,
            callGreetingEnabled: callGreetingEnabled,
            callGreetingMessage: callGreetingMessage,
            whisperMessageEnabled: whisperMessageEnabled,
            whisperMessage: whisperMessage,
          },
        });
      }
      if (currentStep >= 4) {
        draftPayload.data.steps.push({
          step_number: 4,
          step_name: "Review",
          data: {
            numberType: selectedNumberType,
            trafficSource: selectedTrafficSource,
            forwardingNumber: forwardingNumber,
            areaCode: areaCode,
            isTollFree: numberSpecification === "toll-free",
            selectedGeneratedNumber: selectedGeneratedNumber,
            numberName: numberName,
            isCallRecordingEnabled: callRecordingEnabled,
            callRecordingMessage: callRecordingMessage,
            isCallGreetingEnabled: callGreetingEnabled,
            callGreetingMessage: callGreetingMessage,
            isWhisperMessageEnabled: whisperMessageEnabled,
            whisperMessage: whisperMessage,
          },
        });
      }
    } else {
      let currentStepName = [
        "General Step",
        "Number Pool Generator",
        "Call Configuration Settings",
        "Detailed Settings",
        "Review",
      ]?.[currentStep];
      draftPayload.total_steps = 5;
      draftPayload.step_name = currentStepName;
      if (currentStep >= 1) {
        draftPayload.data = {
          numberType: selectedNumberType,
          steps: [
            {
              step_number: 1,
              step_name: "General Step",
              data: {
                numberType: selectedNumberType,
                trafficSource: selectedTrafficSource,
                excludedTrafficTypes: excludedTrafficTypes,
              },
            },
          ],
        };
      }
      if (currentStep >= 2) {
        draftPayload.data.steps.push({
          step_number: 2,
          step_name: "Number Pool Generator",
          data: {
            dailyVisitors: dailyVisitors,
            trackingNumbers: trackingNumbers,
            areaCode: areaCode,
            generateNumbers: selectedGeneratedNumber,
          },
        });
      }
      if (currentStep >= 3) {
        draftPayload.data.steps.push({
          step_number: 3,
          step_name: "Call Configuration Settings",
          data: {
            forwardingNumber: forwardingNumber,
            numberName: numberName,
            swapNumber: swapNumber,
          },
        });
      }
      if (currentStep >= 4) {
        draftPayload.data.steps.push({
          step_number: 4,
          step_name: "Detailed Settings",
          data: {
            callRecordingEnabled: callRecordingEnabled,
            callRecordingMessage: callRecordingMessage,
            callGreetingEnabled: callGreetingEnabled,
            callGreetingMessage: callGreetingMessage,
            whisperMessageEnabled: whisperMessageEnabled,
            whisperMessage: whisperMessage,
          },
        });
      }
      if (currentStep >= 5) {
        draftPayload.data.steps.push({
          step_number: 5,
          step_name: "Review",
          data: {
            numberType: selectedNumberType,
            trafficSource: selectedTrafficSource,
            forwardingNumber: forwardingNumber,
            areaCode: areaCode,
            generateNumbers: selectedGeneratedNumber,
            numberName: numberName,
            swapNumber: swapNumber,
            isCallRecordingEnabled: callRecordingEnabled,
            callRecordingMessage: callRecordingMessage,
            isCallGreetingEnabled: callGreetingEnabled,
            callGreetingMessage: callGreetingMessage,
            isWhisperMessageEnabled: whisperMessageEnabled,
            whisperMessage: whisperMessage,
          },
        });
      }
    }

    createNumberDraftMutation(draftPayload, {
      onSuccess: () => {
        resetNumberCreation();
        setCreateNumberModalOpen(false);
      },
      onError: (error) => {
        console.error("Error creating draft:", error);
      },
    });
  };

  const handleContinueFromDraft = (draft: IPhoneNumberDraft) => {
    // Reset any existing state
    resetNumberCreation();

    // Set the number type first
    setSelectedNumberType(draft.data.numberType);

    // Set the current step
    setCurrentStep(draft.step_number);

    // Populate data from each completed step
    draft.data.steps.forEach((step: any) => {
      switch (step.step_name) {
        case "General Step":
          setSelectedTrafficSource(step.data.trafficSource || []);
          setForwardingNumber(step.data.forwardingNumber || "");
          if (draft.data.numberType === "dynamic") {
            setExcludedTrafficTypes(step.data.excludedTrafficTypes || []);
          }
          break;
        case "Number Generator":
          setAreaCode(step.data.areaCode || "");
          setNumberSpecification(step.data.isTollFree ? "toll-free" : "area-code");
          setSelectedGeneratedNumber(step.data.selectedGeneratedNumber || "");
          setNumberName(step.data.numberName || "");
          break;
        case "Number Pool Generator":
          setDailyVisitors(step.data.dailyVisitors || 240);
          setTrackingNumbers(step.data.trackingNumbers || 4);
          setAreaCode(step.data.areaCode || "");
          setSelectedGeneratedNumber(step.data.generateNumbers || "");
          break;
        case "Call Configuration Settings":
          setForwardingNumber(step.data.forwardingNumber || "");
          setNumberName(step.data.numberName || "");
          setSwapNumber(step.data.swapNumber || "");
          break;
        case "Detailed Settings":
          setCallRecordingEnabled(step.data.callRecordingEnabled || false);
          setCallRecordingMessage(step.data.callRecordingMessage || "");
          setCallGreetingEnabled(step.data.callGreetingEnabled || false);
          setCallGreetingMessage(step.data.callGreetingMessage || "");
          setWhisperMessageEnabled(step.data.whisperMessageEnabled || false);
          setWhisperMessage(step.data.whisperMessage || "");
          break;
      }
    });

    // Open the modal
    setCreateNumberModalOpen(true);
  };

  return (
    <NumberContext.Provider
      value={{
        createNumberModalOpen,
        activeIds,
        setActiveIds,
        setCreateNumberModalOpen,
        currentStep,
        setCurrentStep,
        selectedNumberType,
        setSelectedNumberType,
        selectedTrafficSource,
        setSelectedTrafficSource,
        phoneNumber,
        setPhoneNumber,
        numberSpecification,
        setNumberSpecification,
        areaCode,
        setAreaCode,
        selectedGeneratedNumber,
        setSelectedGeneratedNumber,
        numberName,
        setNumberName,
        callRecordingEnabled,
        setCallRecordingEnabled,
        callRecordingMessage,
        setCallRecordingMessage,
        callGreetingEnabled,
        setCallGreetingEnabled,
        callGreetingMessage,
        setCallGreetingMessage,
        whisperMessageEnabled,
        setWhisperMessageEnabled,
        whisperMessage,
        setWhisperMessage,
        excludedTrafficTypes,
        setExcludedTrafficTypes,
        dailyVisitors,
        setDailyVisitors,
        trackingNumbers,
        setTrackingNumbers,
        areaCodeError,
        setAreaCodeError,
        areaCodeAlternatives,
        setAreaCodeAlternatives,
        selectedNumbers,
        setSelectedNumbers,
        swapNumber,
        setSwapNumber,
        forwardingNumber,
        setForwardingNumber,
        availableNumbers,
        isLoadingNumbers,
        resetNumberCreation,
        purchaseNumber,
        isPurchasing,
        handleSavedNumberDraft,
        handleContinueFromDraft,
      }}
    >
      {children}
    </NumberContext.Provider>
  );
};

// Custom hook for consuming the context
export const useNumberContext = () => {
  const context = useContext(NumberContext);
  if (!context) {
    throw new Error("useNumberContext must be used within a NumberProvider");
  }
  return context;
};
