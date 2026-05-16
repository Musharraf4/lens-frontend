import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IPhoneNumberUpdateRequest, useUpdatePhoneNumber } from "@/services/phoneNumbers.api";
import { useEditNumberContext } from "@/store/EditNumberContext";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Dropdown } from "../Dropdown";
import { StatusTag } from "../StatusTag";
import { showToast } from "../Toast";
import { PreviewMessageButton } from "../ui/PreviewMessageButton";

const TRAFFIC_SOURCES = [
  {
    key: "google_ads",
    label: "Google Ads",
    icon: (
      <Image
        src="/GoogleAdsIcon.svg"
        alt="Google Ads"
        width={16}
        height={16}
      />
    ),
  },
  {
    key: "custom",
    label: "Custom Static Tracking",
    icon: (
      <Image
        src="/CustomStaticTrackingIcon.svg"
        alt="Custom Static Tracking"
        width={16}
        height={16}
      />
    ),
  },
  {
    key: "google_my_business",
    label: "Google My Business",
    icon: (
      <Image
        src="/GoogleBusinessIcon.svg"
        alt="Google My Business"
        width={16}
        height={16}
      />
    ),
  },
  {
    key: "local_service_ads",
    label: "Local Service Ads",
    icon: (
      <Image
        src="/GoogleAdsIcon.svg"
        alt="Local Service Ads"
        width={16}
        height={16}
      />
    ),
  },
  {
    key: "bing_ads",
    label: "Microsoft Ads (Bing Ads)",
    icon: (
      <Image
        src="/MicrosoftAdsIcon.svg"
        alt="Microsoft Ads (Bing Ads)"
        width={16}
        height={16}
      />
    ),
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: (
      <Image
        src="/FacebookIcon.svg"
        alt="Facebook"
        width={16}
        height={16}
      />
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: (
      <Image
        src="/InstagramIcon.svg"
        alt="Instagram"
        width={16}
        height={16}
      />
    ),
  },
  {
    key: "print_ad",
    label: "Print Ad",
    icon: (
      <Image
        src="/PrintAdIcon.svg"
        alt="Print Ad"
        width={16}
        height={16}
      />
    ),
  },
  {
    key: "tv",
    label: "TV",
    icon: (
      <Image
        src="/TVIcon.svg"
        alt="TV"
        width={16}
        height={16}
      />
    ),
  },
  {
    key: "billboard",
    label: "Billboard",
    icon: (
      <Image
        src="/BillboardIcon.svg"
        alt="Billboard"
        width={16}
        height={16}
      />
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: (
      <Image
        src="/YouTubeIcon.svg"
        alt="YouTube"
        width={16}
        height={16}
      />
    ),
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: (
      <Image
        src="/LinkedInIcon.svg"
        alt="LinkedIn"
        width={16}
        height={16}
      />
    ),
  },
  {
    key: "x",
    label: "X",
    icon: (
      <Image
        src="/XIcon.svg"
        alt="X"
        width={16}
        height={16}
      />
    ),
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: (
      <Image
        src="/TiktokIcon.svg"
        alt="TikTok"
        width={16}
        height={16}
      />
    ),
  },
];

const NUMBER_SPEC_TYPES = [
  { key: "area-code", label: "Area Code-Specific Number" },
  { key: "local", label: "Local Number" },
  { key: "toll-free", label: "Toll-Free Number" },
];

const GENERATED_NUMBERS = ["420-123-4567", "420-398-5578", "420-378-5435", "420-678-9098"];

export default function EditStaticNumberModal({
  open,
  onOpenChange,
  phoneData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneData?: any;
}) {
  const { selectedCompany } = useSelectedCompanyStore();
  const {
    numberName,
    setNumberName,
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
    isLoading,
  } = useEditNumberContext();

  // The context should already be populated via the parent component's useEffect

  // Get tracking number if available
  const queryClient = useQueryClient();

  const { mutateAsync: updateStaticPhoneNumber, isPending } = useUpdatePhoneNumber();
  const handleSave = () => {
    const data: IPhoneNumberUpdateRequest = {
      name: numberName,
      source: selectedTrafficSource[0],
      traffic_filter: selectedTrafficSource[0],
      pool_type: "static",
      call_whisper_message: whisperMessage,
      status: phoneData?.status,
      call_whisper_enabled: whisperMessageEnabled,
      call_greeting_message: callGreetingMessage,
      call_greeting_enabled: callGreetingEnabled,
      call_recording_message: callRecordingMessage,
      call_recording_enabled: callRecordingEnabled,
      forwarding_number: phoneNumber,
      company_id: selectedCompany?.company?.id,
    };
    updateStaticPhoneNumber(
      { phoneNumberId: phoneData?.id, data },
      {
        onSuccess: () => {
          showToast({ title: "Phone Record Updated Successfully", type: "success" });
          queryClient.invalidateQueries({ queryKey: ["get-phone-numbers"] });
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="p-0 overflow-y-auto max-h-[90vh] w-full min-w-[700px] lg:max-w-[700px]">
        <DialogHeader className="px-8 pt-8 pb-2">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            Edit {numberName} <StatusTag>Static</StatusTag>
          </DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-8 px-8 pb-8 pt-2">
          {/* 1. General Setup */}
          <div>
            <div className="font-medium mb-2">1. General Setup</div>
            <div className="flex flex-col gap-4">
              <Input
                label="Name"
                placeholder="Name"
                value={numberName}
                onChange={(e) => setNumberName(e.target.value)}
              />
              <Dropdown
                options={TRAFFIC_SOURCES.map((source) => ({
                  id: source.key,
                  option: source.label,
                  icon: source.icon,
                }))}
                value={selectedTrafficSource[0]}
                onChange={(value) => setSelectedTrafficSource([value as string])}
                label="Source"
                width="w-full"
              />
              <Input
                label="Direct calls to"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                type="tel"
              />
            </div>
          </div>
          {/* 2. Number specification */}
          <div>
            <div className="font-medium mb-2">2. Number specification</div>
            <div className="flex flex-col gap-4">
              {/* <Select value={numberSpecification} onValueChange={setNumberSpecification}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {NUMBER_SPEC_TYPES.map(type => (
                    <SelectItem key={type.key} value={type.key}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
              <Dropdown
                options={NUMBER_SPEC_TYPES.map((type) => ({
                  id: type.key,
                  option: type.label,
                }))}
                value={numberSpecification}
                label="Number type"
                width="w-full"
                onChange={(value) => setNumberSpecification(value as string)}
              />
              <Input
                label="Code"
                placeholder="Code"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value)}
                disabled={true}
              />
              {/* <Select value={selectedGeneratedNumber} onValueChange={setSelectedGeneratedNumber}>
                <SelectTrigger>
                  <SelectValue placeholder="Generated number" />
                </SelectTrigger>
                <SelectContent>
                  {GENERATED_NUMBERS.map(num => (
                    <SelectItem key={num} value={num}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
              <Dropdown
                options={GENERATED_NUMBERS.map((num) => ({
                  id: num,
                  option: num,
                }))}
                value={selectedGeneratedNumber}
                label="Generated number"
                width="w-full"
                onChange={(value) => setSelectedGeneratedNumber(value as string)}
                disabled={true}
              />
            </div>
          </div>
          {/* 3. Detailed Settings */}
          <div>
            <div className="font-medium mb-2">3. Detailed Settings</div>
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center gap-2 ">
                <div className="w-1/4 flex items-center gap-2">
                  <Checkbox
                    checked={callRecordingEnabled}
                    onCheckedChange={(v) => setCallRecordingEnabled(!!v)}
                    id="call-recording"
                    className="cursor-pointer"
                  />
                  <label
                    htmlFor="call-recording"
                    className="text-sm"
                  >
                    Enable call recording
                  </label>
                </div>
                <Input
                  className="flex-1 ml-2 w-3/4"
                  placeholder="Call recording message"
                  value={callRecordingMessage}
                  onChange={(e) => setCallRecordingMessage(e.target.value)}
                  disabled={!callRecordingEnabled}
                />
                <PreviewMessageButton
                  message={callRecordingMessage}
                  disabled={!callRecordingEnabled}
                  className={!callRecordingEnabled ? 'invisible' : ''}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1/4 flex items-center gap-2">
                  <Checkbox
                    checked={callGreetingEnabled}
                    onCheckedChange={(v) => setCallGreetingEnabled(!!v)}
                    id="call-greeting"
                    className="cursor-pointer"
                  />
                  <label
                    htmlFor="call-greeting"
                    className="text-sm"
                  >
                    Call greeting
                  </label>
                </div>
                <Input
                  className="flex-1 ml-2 w-3/4"
                  placeholder="Type message"
                  value={callGreetingMessage}
                  onChange={(e) => setCallGreetingMessage(e.target.value)}
                  disabled={!callGreetingEnabled}
                />
                <PreviewMessageButton
                  message={callGreetingMessage}
                  disabled={!callGreetingEnabled}
                  className={!callGreetingEnabled ? 'invisible' : ''}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1/4 flex items-center gap-2">
                  <Checkbox
                    checked={whisperMessageEnabled}
                    onCheckedChange={(v) => setWhisperMessageEnabled(!!v)}
                    id="whisper-message"
                    className="cursor-pointer"
                  />
                  <label
                    htmlFor="whisper-message"
                    className="text-sm"
                  >
                    Whisper message
                  </label>
                </div>
                <Input
                  className="flex-1 ml-2 w-3/4"
                  placeholder="Type message"
                  value={whisperMessage}
                  onChange={(e) => setWhisperMessage(e.target.value)}
                  disabled={!whisperMessageEnabled}
                />
                <PreviewMessageButton
                  message={whisperMessage}
                  disabled={!whisperMessageEnabled}
                  className={!whisperMessageEnabled ? 'invisible' : ''}
                />
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="flex justify-between gap-3 mt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoading || isPending}
              className="ml-auto"
            >
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
