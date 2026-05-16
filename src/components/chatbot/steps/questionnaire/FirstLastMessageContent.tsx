import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useChatbotBuilder } from '@/store/ChatbotBuilderContext';
import { StatusTag } from '@/components/StatusTag';
import { Tooltip } from '@/components/Tooltip';

export const FirstLastMessageStatusTag: React.FC = () => {
    const { state } = useChatbotBuilder();
    const { firstMessage, lastMessage } = state.firstLastMessages;

    if (!firstMessage && !lastMessage) {
        return null;
    }

    const messages = [];
    if (firstMessage) messages.push({ type: 'First', text: firstMessage.substring(0, 45) + '...' });
    if (lastMessage) messages.push({ type: 'Last', text: lastMessage.substring(0, 45) + '...' });

    return (
        <>
            {messages.map((message) => (
                <StatusTag key={message.type} type="default" className="mr-1 last:mr-0">
                    {message.text}
                </StatusTag>
            ))}
        </>
    );
};

const FirstLastMessageContent: React.FC = () => {
    const { state, setFirstLastMessages } = useChatbotBuilder();

    const handleMessageChange = (type: 'first' | 'last', value: string) => {
        setFirstLastMessages({
            ...state.firstLastMessages,
            [type === 'first' ? 'firstMessage' : 'lastMessage']: value
        });
    };

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
            <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                    <label className='text-sm font-medium'>First Message</label>
                    <Tooltip tooltipText='Enter opening message...' />
                </div>
                <Textarea
                    value={state.firstLastMessages.firstMessage || ''}
                    onChange={(e) => handleMessageChange('first', e.target.value)}
                    placeholder='Enter opening message...'
                    className='min-h-[120px] w-full'
                />
                <p className='text-xs text-gray-500 mt-1'>This is the first message users will see when they start a conversation.</p>
            </div>
            <div className='space-y-2 mt-4 md:mt-0'>
                <div className='flex items-center gap-2'>
                    <label className='text-sm font-medium'>Last Message</label>
                    <Tooltip tooltipText='Enter closing message...' />
                </div>
                <Textarea
                    value={state.firstLastMessages.lastMessage || ''}
                    onChange={(e) => handleMessageChange('last', e.target.value)}
                    placeholder='Enter closing message...'
                    className='min-h-[120px] w-full'
                />
                <p className='text-xs text-gray-500 mt-1'>This message will be shown when the conversation ends.</p>
            </div>
        </div>
    );
};

export default FirstLastMessageContent;