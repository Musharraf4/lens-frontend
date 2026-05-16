import React from 'react';
import { useNumberContext } from '@/store/CreateNumberContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, PhoneCall, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PreviewMessageButton } from '@/components/ui/PreviewMessageButton';

export function useDetailedSettingsSteps() {
  const {
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
  } = useNumberContext();

  // Remove the old previewMessage function as we're using PreviewMessageButton now

  return [
    {
      id: 1,
      label: 'Customize Call Settings',
      isOptional: true,
      body: (
        <Card>
          <CardHeader>
            <CardTitle>Customize Call Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-[200px_1fr_150px] gap-4 items-center">
                <div className="font-medium text-gray-500 text-sm">Setting name</div>
                <div className="font-medium text-gray-500 text-sm">Add a message (Leave empty if no message is needed)</div>
                <div className="font-medium text-gray-500 text-sm"></div>
              </div>
              
              {/* Call Recording */}
              <div className="grid grid-cols-[200px_1fr_150px] gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Call Recording</span>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="call-recording" 
                    checked={callRecordingEnabled}
                    onCheckedChange={(checked) => setCallRecordingEnabled(checked as boolean)}
                  />
                  <Input
                    value={callRecordingMessage}
                    onChange={(e) => setCallRecordingMessage(e.target.value)}
                    className={!callRecordingEnabled ? 'opacity-50' : ''}
                    disabled={!callRecordingEnabled}
                  />
                </div>
                <PreviewMessageButton
                  message={callRecordingMessage}
                  disabled={!callRecordingEnabled}
                  className={!callRecordingEnabled ? 'invisible' : ''}
                />
              </div>
              
              {/* Call Greeting */}
              <div className="grid grid-cols-[200px_1fr_150px] gap-4 items-center">
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Call Greeting</span>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="call-greeting" 
                    checked={callGreetingEnabled}
                    onCheckedChange={(checked) => setCallGreetingEnabled(checked as boolean)}
                  />
                  <Input
                    value={callGreetingMessage}
                    onChange={(e) => setCallGreetingMessage(e.target.value)}
                    className={!callGreetingEnabled ? 'opacity-50' : ''}
                    disabled={!callGreetingEnabled}
                  />
                </div>
                <PreviewMessageButton
                  message={callGreetingMessage}
                  disabled={!callGreetingEnabled}
                  className={!callGreetingEnabled ? 'invisible' : ''}
                />
              </div>
              
              {/* Whisper Message */}
              <div className="grid grid-cols-[200px_1fr_150px] gap-4 items-center">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Whisper Message</span>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="whisper-message" 
                    checked={whisperMessageEnabled}
                    onCheckedChange={(checked) => setWhisperMessageEnabled(checked as boolean)}
                  />
                  <Input
                    value={whisperMessage}
                    onChange={(e) => setWhisperMessage(e.target.value)}
                    className={!whisperMessageEnabled ? 'opacity-50' : ''}
                    disabled={!whisperMessageEnabled}
                  />
                </div>
                <PreviewMessageButton
                  message={whisperMessage}
                  disabled={!whisperMessageEnabled}
                  className={!whisperMessageEnabled ? 'invisible' : ''}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];
} 