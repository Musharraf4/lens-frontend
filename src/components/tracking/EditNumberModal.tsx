import React, { useEffect } from "react";
import { useEditNumberContext } from "@/store/EditNumberContext";
import EditStaticNumberModal from "./EditStaticNumberModal";
import EditDynamicNumberModal from "./EditDynamicNumberModal";
import { usePhoneNumberById } from "@/services/phoneNumbers.api";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";

export default function EditNumberModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    selectedNumberType,
    isLoading,
    setNumberName,
    setSelectedTrafficSource,
    setPhoneNumber,
    setCallRecordingEnabled,
    setCallRecordingMessage,
    setCallGreetingEnabled,
    setCallGreetingMessage,
    setWhisperMessageEnabled,
    setWhisperMessage,
    selectedNumberId,
    setTrackingNumbers,
    setSelectedNumbers,
  } = useEditNumberContext();
  const { selectedCompany } = useSelectedCompanyStore();

  const { data: numberData } = usePhoneNumberById({
    phoneNumberId: selectedNumberId || "",
    company_id: selectedCompany?.company?.id,
  });

  // Populate context with API data when it's available
  useEffect(() => {
    if (numberData) {
      setNumberName(numberData.name || "");
      setSelectedTrafficSource([numberData.source || ""]);
      setPhoneNumber(numberData.forwarding_number || "");

      // Set call settings
      setCallRecordingEnabled(numberData.call_recording_enabled || false);
      setCallRecordingMessage(numberData.call_recording_message || "");
      setCallGreetingEnabled(numberData.call_greeting_enabled || false);
      setCallGreetingMessage(numberData.call_greeting_message || "");
      setWhisperMessageEnabled(numberData.call_whisper_enabled || false);
      setWhisperMessage(numberData.call_whisper_message || "");

      // Set tracking numbers if available
      if (numberData.tracking_numbers?.length) {
        setTrackingNumbers(numberData.tracking_numbers.length);
        setSelectedNumbers(numberData.tracking_numbers.map((tn) => tn.phone_number));
      }
    }
  }, [numberData]);

  if (isLoading) {
    return null;
  }

  // Determine the pool type from API data or fallback to context
  const poolType = numberData?.pool_type || selectedNumberType;

  if (poolType === "dynamic") {
    return (
      <EditDynamicNumberModal
        open={open}
        onOpenChange={onOpenChange}
        phoneData={numberData}
      />
    );
  }
  return (
    <EditStaticNumberModal
      open={open}
      onOpenChange={onOpenChange}
      phoneData={numberData}
    />
  );
}
