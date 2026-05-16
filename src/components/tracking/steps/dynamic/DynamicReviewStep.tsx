import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNumberContext } from "@/store/CreateNumberContext";
import { Play, PhoneCall, Mic, MessageSquare } from "lucide-react";
import { StatusTag } from "@/components/StatusTag";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { formatPhoneNumberUniversal } from "@/lib/utils";

const DynamicReviewStepBody = () => {
  const {
    selectedNumberType,
    selectedTrafficSource,
    dailyVisitors,
    trackingNumbers,
    areaCode,
    selectedNumbers,
    phoneNumber,
    numberName,
    swapNumber,
    callRecordingEnabled,
    callRecordingMessage,
    callGreetingEnabled,
    callGreetingMessage,
    whisperMessageEnabled,
    whisperMessage,
    forwardingNumber,
  } = useNumberContext();

  return (
    <div className="space-y-6">
      {/* 1. General Setup */}
      <Card>
        <CardHeader>
          <CardTitle>1. General Setup</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-10">
          <div className="flex flex-col gap-2">
            <span className="font-normal text-base text-neutral-500">Number Type:</span>
            <StatusTag>
              {selectedNumberType === "dynamic" ? "Dynamic Number" : "Static Number"}
            </StatusTag>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-normal text-base text-neutral-500">Traffic Source:</span>
            <StatusTag>
              {selectedTrafficSource.join(", ")}
            </StatusTag>
          </div>
        </CardContent>
      </Card>

      {/* 2. Number Pool Generator */}
      <Card>
        <CardHeader>
          <CardTitle>2. Number Pool Generator</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div>
            <span className="font-normal text-base text-neutral-500">Number Pool Settings:</span>
            <div className="flex flex-wrap gap-2 mt-3 mb-2">
              <StatusTag>
                {dailyVisitors} – {trackingNumbers} {trackingNumbers > 1 ? "Tracking numbers" : "Tracking number"}
              </StatusTag>
              <StatusTag>
                Area code – {areaCode}
              </StatusTag>
            </div>
          </div>
          <div>
            <span className="font-normal text-base text-neutral-500">Selected Generated Numbers ({selectedNumbers.length}):</span>
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedNumbers.map((num) => (
                <StatusTag
                  key={num}
                  icon={
                    <Image src="/PhoneIcon.svg" alt="Phone Call" width={16} height={16} />
                  }
                  showIcon
                >
                  {formatPhoneNumberUniversal(num)}
                </StatusTag>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Call Configuration Settings */}
      <Card>
        <CardHeader>
          <CardTitle>3. Call Configuration Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-10">
          <div className="flex flex-col gap-2">
            <span className="font-normal text-base text-neutral-500">Direct Calls to:</span>
            <StatusTag icon={
              <Image src="/PhoneIcon.svg" alt="Phone Call" width={16} height={16} />
            } showIcon>
              {formatPhoneNumberUniversal(forwardingNumber)}
            </StatusTag>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-normal text-base text-neutral-500">Number Name:</span>
            <StatusTag>
              {numberName}
            </StatusTag>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-normal text-base text-neutral-500">Number to Swap:</span>
            <StatusTag icon={
              <Image src="/PhoneIcon.svg" alt="Phone Call" width={16} height={16} />
            } showIcon>
              {formatPhoneNumberUniversal(swapNumber)}
            </StatusTag>
          </div>
        </CardContent>
      </Card>

      {/* 4. Detailed Settings */}
      <Card>
        <CardHeader>
          <CardTitle>4. Detailed Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Call Recording */}
          <div className="grid grid-cols-[200px_1fr_150px] gap-4 items-center">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Call Recording</span>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="call-recording-review"
                checked={callRecordingEnabled}
                disabled
              />
              <Input
                value={callRecordingMessage}
                className="opacity-75"
                disabled
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${!callRecordingEnabled ? 'invisible' : ''}`}
            >
              <div className="bg-black rounded-full p-2">
                <Play className="h-4 w-4 text-white" />
              </div>
              Preview message
            </Button>
          </div>

          {/* Call Greeting */}
          {callGreetingEnabled && (
            <div className="grid grid-cols-[200px_1fr_150px] gap-4 items-center">
              <div className="flex items-center gap-2">
                <PhoneCall className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Call Greeting</span>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="call-greeting-review"
                  checked={callGreetingEnabled}
                  disabled
                />
                <Input
                  value={callGreetingMessage}
                  className="opacity-75"
                  disabled
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <div className="bg-black rounded-full p-2">
                  <Play className="h-4 w-4 text-white" />
                </div>
                Preview message
              </Button>
            </div>
          )}

          {/* Whisper Message */}
          {whisperMessageEnabled && (
            <div className="grid grid-cols-[200px_1fr_150px] gap-4 items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Whisper Message</span>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="whisper-message-review"
                  checked={whisperMessageEnabled}
                  disabled
                />
                <Input
                  value={whisperMessage}
                  className="opacity-75"
                  disabled
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <div className="bg-black rounded-full p-2">
                  <Play className="h-4 w-4 text-white" />
                </div>
                Preview message
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export function useDynamicReviewStep() {
  return [
    {
      id: 1,
      label: 'Review',
      body: <DynamicReviewStepBody />,
    },
  ];
}

export default DynamicReviewStepBody;
