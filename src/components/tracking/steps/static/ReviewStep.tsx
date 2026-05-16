import React from 'react';
import { useNumberContext } from '@/store/CreateNumberContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mic, PhoneCall, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusTag } from '@/components/StatusTag';
import { formatPhoneNumberUniversal } from '@/lib/utils';

export function useReviewStep() {
  const {
    selectedNumberType,
    selectedTrafficSource,
    phoneNumber,
    numberSpecification,
    areaCode,
    selectedGeneratedNumber,
    numberName,
    callRecordingEnabled,
    callRecordingMessage,
    callGreetingEnabled,
    callGreetingMessage,
    forwardingNumber
  } = useNumberContext();

  // Function to get the traffic source display name
  const getTrafficSourceLabel = (key: string) => {
    const sources: Record<string, string> = {
      'google_ads': 'Google Ads',
      'facebook': 'Facebook',
      'instagram': 'Instagram',
      // Add other mappings as needed
    };
    return sources[key] || key;
  };

  // Function to format the number specification for display
  const getNumberSpecificationLabel = () => {
    if (numberSpecification === 'area-code') {
      return `Area Code-Specific Number${areaCode ? ` – ${areaCode}` : ''}`;
    } else {
      return 'Toll-Free Number';
    }
  };

  // This function would handle message previewing (text-to-speech)
  const previewMessage = (message: string) => {
    // In a real implementation, this would trigger text-to-speech
    // Could use Web Speech API or other TTS service
  };

  const reviewContent = (
    <div className="space-y-8">
      {/* 1. General Setup Review */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">1. General Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Number Type</p>
              <StatusTag>{selectedNumberType === 'static' ? 'Static Number' : 'Dynamic Number Pool'}</StatusTag>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Traffic Source</p>
              <div className="flex items-center">
                <img
                  src={`/${selectedTrafficSource}Icon.svg`}
                  alt=""
                  className="w-5 h-5 mr-2"
                  onError={(e) => {
                    // If image fails to load, hide it
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <StatusTag>{getTrafficSourceLabel(selectedTrafficSource[0])}</StatusTag>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Direct Calls to</p>
              {/* <p className="font-medium">{phoneNumber}</p> */}
              <StatusTag>{formatPhoneNumberUniversal(forwardingNumber)}</StatusTag>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Number Generator Review */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">2. Number Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Number Specifications</p>
              <StatusTag>{getNumberSpecificationLabel()}</StatusTag>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Selected Generated Number</p>
              <StatusTag>{formatPhoneNumberUniversal(selectedGeneratedNumber)}</StatusTag>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Number Name</p>
              <StatusTag>{numberName}</StatusTag>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Detailed Settings Review - Updated to match Figma design */}
      {(callRecordingEnabled || callGreetingEnabled) && (
        <div>
          <h3 className="text-lg font-medium mb-4">3. Detailed Settings</h3>

          <div className="space-y-4">
            {callRecordingEnabled && (
              <div className="flex items-center gap-4">
                <div className="w-8">
                  <Mic className="w-5 h-5 text-gray-500" />
                </div>
                <div className="w-28">
                  <p className="font-medium">Call Recording</p>
                </div>
                <div className="flex-1 bg-gray-100 rounded-md px-4 py-2">
                  {callRecordingMessage}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 ml-2"
                  onClick={() => previewMessage(callRecordingMessage)}
                >
                  <div className="bg-black rounded-full p-2">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm">Preview message</span>
                </Button>
              </div>
            )}

            {callGreetingEnabled && (
              <div className="flex items-center gap-4">
                <div className="w-8">
                  <PhoneCall className="w-5 h-5 text-gray-500" />
                </div>
                <div className="w-28">
                  <p className="font-medium">Call Greeting</p>
                </div>
                <div className="flex-1 bg-gray-100 rounded-md px-4 py-2">
                  {callGreetingMessage}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 ml-2"
                  onClick={() => previewMessage(callGreetingMessage)}
                >
                  <div className="bg-black rounded-full p-2">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm">Preview message</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return [
    {
      id: 1,
      label: 'Review',
      body: reviewContent,
    },
  ];
} 