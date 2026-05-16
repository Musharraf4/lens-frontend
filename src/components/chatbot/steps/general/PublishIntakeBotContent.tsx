import React, { useState, useEffect } from 'react';
import { useChatbotBuilder } from '@/store/ChatbotBuilderContext';
import { StatusTag } from '@/components/StatusTag';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, Link as LinkIcon } from 'lucide-react';
import { BiChevronDown } from 'react-icons/bi';
import TextWithCopy from '@/components/TextWithCopy';
import { useGetAllDomains } from '@/services/chatbot.api';
import { useSelectedCompanyStore } from '@/store/SelectedCompany';

interface ConnectedDomain {
  domain: string;
  isVerified?: boolean;
}

export const PublishIntakeBotStatusTag: React.FC = () => {
  const { state } = useChatbotBuilder();
  const { mainDomain } = state.publishInfo;

  if (!mainDomain) {
    return null;
  }

  // Convert to array for consistent pattern
  const domains = [mainDomain];

  return (
    <>
      {domains.map((domain) => (
        <StatusTag key={domain} type="default" className="mr-1 last:mr-0">
          {domain}
        </StatusTag>
      ))}
    </>
  );
};

const PublishIntakeBotContent: React.FC = () => {
  const { selectedCompany } = useSelectedCompanyStore();
  const { state, setPublishInfo } = useChatbotBuilder();
  const { data } = useGetAllDomains(selectedCompany?.company?.id || '');
  const filteredData = data?.filter((domain: ConnectedDomain) => !domain.domain.includes('localhost') && !domain.domain.includes('127.0.0.1') && !domain.domain.includes('daniyal'));
  const [mainDomain, setMainDomain] = useState<string>(state.publishInfo.mainDomain || filteredData?.[0]?.domain || '');
  // Update global state when local state changes
  useEffect(() => {
    setPublishInfo({
      mainDomain
    });
  }, [mainDomain]);

  useEffect(() => {
    if (data && data.length > 0 && !mainDomain) {
      setMainDomain(filteredData?.[0]?.domain);
    }
  }, [data]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 gap-y-8">
      {/* Bot Icon and Domain Connection */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className=" flex items-center flex-col gap-2 justify-center flex-shrink-0">
          <img src='/BotAvatar.png' alt='Bot Avatar' className="object-cover w-full h-full" />
          <div className="text-sm text-blue-500">Lead Concierge Bot</div>
        </div>
        <div className="flex-1  relative w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="hidden sm:block border-b border-dashed border-gray-300 flex-1 mx-4"></div>
          <div className='relative flex items-center justify-center'>
            <img
              src="/circles-bg-icon.svg"
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -26%)',
                width: 307,
                maxWidth: 'none',
                zIndex: 0
              }}
              alt=""
            />
            <LinkIcon size={16} className="hidden sm:block text-gray-400 mx-2 relative z-10" />
          </div>
          <div className="hidden sm:block border-b border-dashed border-gray-300 flex-1 mx-4"></div>
          <div className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-full text-sm w-full sm:w-auto overflow-hidden text-ellipsis">
            <img src='/website.svg' alt='Website Icon' className="hidden sm:block" />
            https://yourwebsite.com
          </div>
        </div>
      </div>

      {/* Connected Site Info */}
      <div className="bg-white p-4">
        {data && data.length > 0 && (
          <>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700">Connected to site</h3>
            </div>
            <div className="text-gray-700 py-2 text-sm flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center flex-grow min-w-0">
                <div className='border rounded-full mr-2 border-gray-200 p-1'>
                  <LinkIcon size={12} className="text-gray-400 flex-shrink-0 " />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="border-2 rounded-full focus:border-green-300 p-1 flex items-center gap-2 max-w-full">
                    <span className=" truncate">{mainDomain}</span>
                    <BiChevronDown size={16} className="text-gray-500 flex-shrink-0" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='bg-gray-50 border border-gray-200 shadow-md'>
                    {filteredData?.map((domain: ConnectedDomain) => (
                      <DropdownMenuItem
                        key={domain.domain}
                        onSelect={() => {
                          setMainDomain(domain.domain);
                        }}
                        className="flex justify-between items-center"
                      >
                        <span className="truncate max-w-[200px] sm:max-w-[250px]">{domain.domain}</span>
                        {domain.domain === mainDomain && <Check size={16} className="text-green-500 ml-2 flex-shrink-0" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
              {data?.length === 1 && <TextWithCopy text={mainDomain} />}
            </div>
          </>
        )}
        <div className="text-sm text-gray-600 mt-4 mb-6">
          Once the Lenz code is embedded on the website, it will automatically detect and populate all the linked domains associated with it here. This ensures that the integration is seamless and requires no manual effort to list the connected domains.
        </div>
      </div>
    </div>
  );
};

export default PublishIntakeBotContent;
