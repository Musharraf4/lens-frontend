import React, { useState, useMemo } from 'react';
import Timeline from '@/components/Timeline';
import Image from 'next/image';
import WaveSurferPlayer from '@/components/WaveSurferPlayer';
import { IContactWithTracking } from '@/services/contacts.api';
import NotesTab from './NotesTab';
import { formatPhoneNumberUniversal, getBaseUrl } from '@/lib/utils';

interface ContactTabsProps {
  contactData?: IContactWithTracking;
  isLoading: boolean
}

export default function ContactTabs({ contactData, isLoading }: ContactTabsProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'calls' | 'notes'>('timeline');

  // Format date to display in timeline
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  };

  // Combine and sort call_tracking and form_tracking data
  const timelineItems = useMemo(() => {
    // Combine both arrays into one
    const combinedItems = [
      // Map call_tracking items to timeline format
      ...(contactData?.call_tracking || []).map(call => ({
        id: call.id,
        type: 'call',
        title: `${call.direction} Call`,
        description: call.transcription_text || "",
        datetime: formatDate(call.updated_at),
        status: "Mobile",
        statusIcon: <Image
          src="/PhoneIcon.svg"
          alt="Phone Icon"
          width={16}
          height={16}
        />,
        statusType: "default" as const,
        icon: <Image
          src="/PhoneIcon.svg"
          alt="Phone Icon"
          width={20}
          height={20}
        />,
        updated_at: new Date(call.updated_at).getTime(),
        body: (
          <div>
            <div className="flex gap-8 text-sm flex-wrap">
              <div>
                <div className="text-neutral-500 text-sm font-light leading-5 tracking-[-0.03em]">Caller #</div>
                <div className="text-black text-sm font-normal leading-5 tracking-[0]">{formatPhoneNumberUniversal(call.caller_number)}</div>
              </div>
              <div>
                <div className="text-neutral-500 text-sm font-light leading-5 tracking-[-0.03em]">Source</div>
                <div className={`text-black text-sm font-normal leading-5 tracking-[0] ${call.source && (call.source.includes('https') || call.source.includes('localhost')) ? '' : 'capitalize'} break-all overflow-wrap-anywhere`}>
                  {call.source || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-neutral-500 text-sm font-light leading-5 tracking-[-0.03em]">Medium</div>
                <div className="text-black text-sm font-normal leading-5 tracking-[0]">{call.medium || "N/A"}</div>
              </div>
              <div>
                <div className="text-neutral-500 text-sm font-light leading-5 tracking-[-0.03em]">Number called</div>
                <div className="text-black text-sm font-normal leading-5 tracking-[0]">{formatPhoneNumberUniversal(call.tracking_number)}</div>
              </div>
              {call.duration ? (
                <div>
                  <div className="text-neutral-500 text-sm font-light leading-5 tracking-[-0.03em]">Duration</div>
                  <div className="text-black text-sm font-normal leading-5 tracking-[0]">{call.duration}s</div>
                </div>
              ) : null}
            </div>
            {call.recording_url && (
              <div className="mt-3">
                <WaveSurferPlayer audioUrl={call.recording_url} callTrackingId={call.id} />

                {/* <WaveSurferPlayer audioUrl="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" callTrackingId={call.id} /> */}
              </div>
            )}
          </div>
        ),
      })),
      // Map call_tracking items to timeline format
      ...(contactData?.chat_tracking || []).map((chat, index) => ({
        id: chat.id,
        type: 'chat',
        title: `chat ${index === 0 ? 'Started' : ''}`,
        description: chat.topic_name || "",
        datetime: formatDate(chat.updated_at),
        status: "Desktop",
        statusIcon: <Image
          src="/ChatIcon.svg"
          alt="Chat Icon"
          width={16}
          height={16}
        />,
        statusType: "default" as const,
        icon: <Image
          src="/ChatIcon.svg"
          alt="Chat Icon"
          width={20}
          height={20}
        />,
        updated_at: new Date(chat.updated_at).getTime(),
        body: (
          <div>
            <div className="flex gap-8 text-sm flex-wrap">

              <div>
                <div className="text-neutral-500 text-sm font-light leading-5 tracking-[-0.03em]">Source</div>
                <div className={`text-black text-sm font-normal leading-5 tracking-[0] ${chat.extra_metadata?.attribution?.source && (chat.extra_metadata?.attribution?.source.includes('https') || chat.extra_metadata?.attribution?.source.includes('localhost')) ? '' : 'capitalize'} break-all overflow-wrap-anywhere`}>
                  {chat.extra_metadata?.attribution?.source || "Direct"}
                </div>
              </div>
              <div>
                <div className="text-neutral-500 text-sm font-light leading-5 tracking-[-0.03em]">Keyword</div>
                <div className={`text-black text-sm font-normal leading-5 tracking-[0] ${chat.source && (chat.source.includes('https') || chat.source.includes('localhost')) ? '' : 'capitalize'} break-all overflow-wrap-anywhere`}>
                  {chat?.answer_json?.text || "N/A"}
                </div>
              </div>
            </div>
          </div>
        ),
      })),
      // Map form_tracking items to timeline format
      ...(contactData?.form_tracking || []).map(form => ({
        id: form.id,
        type: 'form',
        title: "Form filled",
        description: getBaseUrl(form.url) || "",
        datetime: formatDate(form.updated_at),
        status: "Desktop",
        statusIcon: <Image
          src="/DesktopIcon.svg"
          alt="Desktop Icon"
          width={16}
          height={16}
        />,
        statusType: "default" as const,
        icon: <Image
          src="/FormFilledIcon.svg"
          alt="Form Filled Icon"
          width={20}
          height={20}
        />,
        updated_at: new Date(form.updated_at).getTime(),
        body: (
          <div className="flex gap-8 text-sm flex-wrap">
            {form.source && (
              <div>
                <div className="text-neutral-500 text-sm font-light leading-5 tracking-[-0.03em]">Source</div>
                <div className={`text-black text-sm font-normal leading-5 tracking-[0] ${form.source && (form.source.includes('https') || form.source.includes('localhost')) ? '' : 'capitalize'} break-all overflow-wrap-anywhere`}>
                  {form.source || "N/A"}
                </div>

              </div>
            )}
            {form.medium && (
              <div>
                <div className="text-neutral-500 text-sm font-light leading-5 tracking-[-0.03em]">Medium</div>
                <div className="text-black text-sm font-normal leading-5 tracking-[0]">{form.medium}</div>
              </div>
            )}
            {form.campaign && (
              <div>
                <div className="text-neutral-500 text-sm font-light leading-5 tracking-[-0.03em]">Campaign</div>
                <div className="text-black text-sm font-normal leading-5 tracking-[0]">{form.campaign}</div>
              </div>
            )}
            {form.keywords && form.keywords.length > 0 && (
              <div>
                <div className="text-neutral-500 text-sm font-light leading-5 tracking-[-0.03em]">Keywords</div>
                <div className="text-black text-sm font-normal leading-5 tracking-[0]">{form.keywords.join(', ')}</div>
              </div>
            )}
          </div>
        ),
      }))
    ];

    // Sort by updated_at date in descending order (newest first)
    return combinedItems.sort((a, b) => b.updated_at - a.updated_at);
  }, [contactData]);

  // Filter only call items for the calls tab
  const callItems = useMemo(() => {
    return timelineItems.filter(item => item.type === 'call');
  }, [timelineItems]);
  return (
    <div>
      <div className="flex mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'timeline' ? 'border-b-2 border-black font-semibold' : 'text-neutral-500'}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'calls' ? 'border-b-2 border-black font-semibold' : 'text-neutral-500'}`}
          onClick={() => setActiveTab('calls')}
        >
          Calls
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'notes' ? 'border-b-2 border-black font-semibold' : 'text-neutral-500'}`}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
      </div>
      <div>
        {activeTab === 'timeline' && <Timeline items={timelineItems} isLoading={isLoading} />}
        {activeTab === 'calls' && <Timeline items={callItems} isLoading={isLoading} />}
        {activeTab === 'notes' && <NotesTab contactId={contactData?.id || ''} />}
      </div>
    </div>
  );
} 