import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useEditNumberContext } from '@/store/EditNumberContext';
import { StatusTag } from '../StatusTag';
import Image from 'next/image';
import { Dropdown } from '../Dropdown';
import { formatString } from '@/lib/utils';
import { PreviewMessageButton } from '../ui/PreviewMessageButton';
import { IPhoneNumberUpdateRequest, useUpdatePhoneNumber } from '@/services/phoneNumbers.api';
import { useSelectedCompanyStore } from '@/store/SelectedCompany';
import { showToast } from '../Toast';
import { useQueryClient } from '@tanstack/react-query';

const DYNAMIC_TRAFFIC_SOURCES = [
  { key: 'all_traffic', label: 'All Traffic', icon: <Image src="/dynamic-traffic-icons/AllTrafficIcon.svg" alt="All Traffic" width={16} height={16} /> },
  { key: 'search', label: 'Search', icon: <Image src="/dynamic-traffic-icons/SearchIcon.svg" alt="Search" width={16} height={16} /> },
  { key: 'web_referral', label: 'Web Referral', icon: <Image src="/dynamic-traffic-icons/WebReferralIcon.svg" alt="Web Referral" width={16} height={16} /> },
  { key: 'source_medium', label: 'Source and Medium', icon: <Image src="/dynamic-traffic-icons/SourceAndMediumIcon.svg" alt="Source and Medium" width={16} height={16} /> },
  { key: 'direct_visit', label: 'Direct Visit', icon: <Image src="/dynamic-traffic-icons/DirectVisitIcon.svg" alt="Direct Visit" width={16} height={16} /> },
];

const SIDEBAR_STEPS = [
  { id: 1, label: 'General Setup' },
  { id: 2, label: 'Number Pool Generator' },
  { id: 3, label: 'Call Configuration Settings' },
  { id: 4, label: 'Detailed Settings' },
];

export default function EditDynamicNumberModal({
  open,
  onOpenChange,
  phoneData
}: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  phoneData?: any
}) {
  const {
    currentStep,
    setCurrentStep,
    numberName,
    setNumberName,
    selectedTrafficSource,
    setSelectedTrafficSource,
    excludedTrafficTypes,
    setExcludedTrafficTypes,
    dailyVisitors,
    setDailyVisitors,
    trackingNumbers,
    setTrackingNumbers,
    areaCode,
    setAreaCode,
    selectedNumbers,
    setSelectedNumbers,
    phoneNumber,
    setPhoneNumber,
    swapNumber,
    setSwapNumber,
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

  type TrackingNumber = {
    id: number;
    country: string;
    number: string;
    location: string;
    voice: boolean;
    messaging: boolean;
    status: string;
  };
  const { selectedCompany } = useSelectedCompanyStore();
  const { mutateAsync: updateStaticPhoneNumber, isPending } = useUpdatePhoneNumber();
  const queryClient = useQueryClient();


  const formattedTrackingNumbers = phoneData?.tracking_numbers?.map((tn: { phone_number: string; status: string }, index: number): TrackingNumber => ({
    id: index + 1,
    country: 'USA', // Default, could be extracted from phone data if available
    number: tn.phone_number,
    location: 'N/A', // Not in API data
    voice: true, // Default
    messaging: true, // Default
    status: tn.status
  })) || [];

  const handleSave = () => {
    // TODO: Implement save logic (API call)
    const data: IPhoneNumberUpdateRequest = {
      name: numberName,
      source: selectedTrafficSource[0],
      traffic_filter: selectedTrafficSource[0],
      pool_type: "dynamic",
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

  const handleExclusionChange = (key: string) => {
    setExcludedTrafficTypes(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col gap-4">
            <Input label="Name" placeholder="Name" value={numberName} onChange={e => setNumberName(e.target.value)} />
            <Dropdown
              options={DYNAMIC_TRAFFIC_SOURCES.map(source => ({
                id: source.key,
                option: source.label,
                icon: source.icon,
              }))}
              value={selectedTrafficSource[0]}
              onChange={value => setSelectedTrafficSource([value as string])}
              label="Source"
              width='w-full'
            />
            {selectedTrafficSource[0] === 'all_traffic' && (
              <div className="flex flex-col gap-2 pl-2">
                <Checkbox checked={excludedTrafficTypes.includes('organic')} onCheckedChange={() => handleExclusionChange('organic')} id="exclude-organic" />
                <label htmlFor="exclude-organic" className="text-sm">Exclude Organic Traffic</label>
                <Checkbox checked={excludedTrafficTypes.includes('paid')} onCheckedChange={() => handleExclusionChange('paid')} id="exclude-paid" />
                <label htmlFor="exclude-paid" className="text-sm">Exclude Paid Traffic</label>
                <Checkbox checked={excludedTrafficTypes.includes('direct')} onCheckedChange={() => handleExclusionChange('direct')} id="exclude-direct" />
                <label htmlFor="exclude-direct" className="text-sm">Exclude Direct Traffic</label>
              </div>
            )}
            {selectedTrafficSource[0] === 'web_referral' && (
              <Input label="Visitors from" placeholder="Paste website link" />
            )}
            {phoneData?.traffic_filter && (
              <div className="mt-2">
                <div className="text-sm font-medium">Current Traffic Filter:</div>
                <div className="text-sm">{formatString(phoneData.traffic_filter)}</div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm">Daily visitors</label>
                <div className="flex items-center gap-2 mt-1">
                  <Button type="button" variant="outline" onClick={() => setDailyVisitors(Math.max(0, dailyVisitors - 1))}>-</Button>
                  <Input value={dailyVisitors} onChange={e => setDailyVisitors(Number(e.target.value))} className="w-20 text-center" />
                  <Button type="button" variant="outline" onClick={() => setDailyVisitors(dailyVisitors + 1)}>+</Button>
                </div>
              </div>
              <div className="flex-1">
                <label className="text-sm">Pool size</label>
                <div className="flex items-center gap-2 mt-1">
                  <Button type="button" variant="outline" onClick={() => setTrackingNumbers(Math.max(1, trackingNumbers - 1))}>-</Button>
                  <Input value={trackingNumbers} onChange={e => setTrackingNumbers(Number(e.target.value))} className="w-20 text-center" />
                  <Button type="button" variant="outline" onClick={() => setTrackingNumbers(trackingNumbers + 1)}>+</Button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="font-medium mb-2">Generated numbers</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border rounded">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2">Country</th>
                      <th className="p-2">Number</th>
                      <th className="p-2">Location</th>
                      <th className="p-2">Voice</th>
                      <th className="p-2">Messaging</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formattedTrackingNumbers.length > 0 ? (
                      formattedTrackingNumbers.map((num: TrackingNumber) => (
                        <tr key={num.number}>
                          <td className="p-2">{num.country}</td>
                          <td className="p-2">{num.number}</td>
                          <td className="p-2">{num.location}</td>
                          <td className="p-2">{num.voice ? 'On' : 'Off'}</td>
                          <td className="p-2">{num.messaging ? 'On' : 'Off'}</td>
                          <td className="p-2">{num.status}</td>
                          <td className="p-2">
                            <Checkbox
                              checked={selectedNumbers.includes(num.number)}
                              onCheckedChange={() => {
                                setSelectedNumbers(prev =>
                                  prev.includes(num.number)
                                    ? prev.filter(n => n !== num.number)
                                    : prev.length < trackingNumbers
                                      ? [...prev, num.number]
                                      : prev
                                );
                              }}
                              disabled={
                                !selectedNumbers.includes(num.number) &&
                                selectedNumbers.length >= trackingNumbers
                              }
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-4 text-center">No tracking numbers available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="text-xs text-muted-foreground mt-2">{selectedNumbers.length} / {trackingNumbers} numbers selected</div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col gap-4">
            <Input label="Direct calls to" placeholder="Phone number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} type="tel" />
            <Input label="Number to swap with tracking numbers" placeholder="Phone number" value={swapNumber} onChange={e => setSwapNumber(e.target.value)} type="tel" />
            <Input label="Destination number" placeholder="Phone number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} type="tel" />
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1/4 flex items-center gap-2">
                <Checkbox checked={callRecordingEnabled} onCheckedChange={v => setCallRecordingEnabled(!!v)} id="call-recording" />
                <label htmlFor="call-recording" className="text-sm">Enable call recording</label>
              </div>
              <Input className="flex-1 ml-2 w-3/4" placeholder="Call recording message" value={callRecordingMessage} onChange={e => setCallRecordingMessage(e.target.value)} disabled={!callRecordingEnabled} />
              <PreviewMessageButton
                message={callRecordingMessage}
                disabled={!callRecordingEnabled}
                className={!callRecordingEnabled ? 'invisible' : ''}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1/4 flex items-center gap-2">

                <Checkbox checked={callGreetingEnabled} onCheckedChange={v => setCallGreetingEnabled(!!v)} id="call-greeting" />
                <label htmlFor="call-greeting" className="text-sm">Call greeting</label>
              </div>
              <Input className="flex-1 ml-2 w-3/4" placeholder="Type message" value={callGreetingMessage} onChange={e => setCallGreetingMessage(e.target.value)} disabled={!callGreetingEnabled} />
              <PreviewMessageButton
                message={callGreetingMessage}
                disabled={!callGreetingEnabled}
                className={!callGreetingEnabled ? 'invisible' : ''}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1/4 flex items-center gap-2">

                <Checkbox checked={whisperMessageEnabled} onCheckedChange={v => setWhisperMessageEnabled(!!v)} id="whisper-message" />
                <label htmlFor="whisper-message" className="text-sm">Whisper message</label>
              </div>
              <Input className="flex-1 ml-2 w-3/4" placeholder="Type message" value={whisperMessage} onChange={e => setWhisperMessage(e.target.value)} disabled={!whisperMessageEnabled} />
              <PreviewMessageButton
                message={whisperMessage}
                disabled={!whisperMessageEnabled}
                className={!whisperMessageEnabled ? 'invisible' : ''}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full min-w-[1200px] max-h-[800px] flex flex-row p-0 h-full">
        {/* Sidebar navigation */}
        <div className="w-56 border-r bg-muted/50 flex flex-col py-8 px-4 h-full">
          {SIDEBAR_STEPS.map(step => (
            <button
              key={step.id}
              className={`text-left py-2 px-3 rounded transition-all mb-1 ${currentStep === step.id ? 'bg-white font-semibold shadow' : 'hover:bg-white/70'}`}
              onClick={() => setCurrentStep(step.id)}
              type="button"
            >
              {step.id}. {step.label}
            </button>
          ))}
        </div>
        {/* Main content */}
        <div className="flex flex-col h-full w-full">
          <div className="flex-1 overflow-y-auto px-12 py-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold mb-6 flex items-center gap-2">Edit {numberName} <StatusTag>Dynamic</StatusTag></DialogTitle>
            </DialogHeader>
            {renderStepContent()}
          </div>
          <div className="border-t bg-white px-12 py-6 flex justify-between gap-3 mt-auto">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="button" onClick={handleSave} disabled={isLoading} className="ml-auto">Save changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 