'use client'

import React from 'react';
import PageHeader from '@/components/PageHeader';
import TextWithCopy from '@/components/TextWithCopy';
import Image from 'next/image';
import ContactDetailsSidebar from '@/components/contactDetails/ContactDetailsSidebar';
import ContactTabs from '@/components/contactDetails/ContactTabs';
import { useContactById } from '@/services/contacts.api';
import { useSelectedCompanyStore } from '@/store/SelectedCompany';
import { Skeleton } from '../ui/skeleton';
import { Link, Monitor, Repeat, Search } from 'lucide-react';
import { MdOutlineChat } from 'react-icons/md';
import { getBaseUrl, truncateString } from '@/lib/utils';
import { IoArrowBack } from 'react-icons/io5';
import { useRouter } from 'next/navigation';

interface ContactDetailsContainerProps {
  id: string;
}

// Dummy review data
const dummyReview = {
  rating: 4.5,
  text: "Great service!",
  date: "2024-01-01",
  reviewer: "Jane Smith"
};

export default function ContactDetailsContainer({ id }: ContactDetailsContainerProps) {
  const router = useRouter();
  const { selectedCompany } = useSelectedCompanyStore();

  const { data: contact, isLoading, error } = useContactById(id, selectedCompany?.company?.id || "");

  // Use API data if available, otherwise use dummy data
  const contactData = contact;

  // Format the first interaction date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD.MM.YYYY format
  };

  // Get interaction type display text
  const getInteractionTypeText = (type: string) => {
    switch (type) {
      case 'call':
        return 'Call';
      case 'chat':
        return 'Chat';
      case 'form':
        return 'Form';
      default:
        return type;
    }
  };

  // Get channel display text
  const getChannelText = (channel: string) => {
    switch (channel) {
      case 'google_ads':
        return 'Google Ads';
      case 'facebook_ads':
        return 'Facebook Ads';
      case 'instagram':
        return 'Instagram';
      case 'youtube':
        return 'YouTube';
      case 'pinterest':
        return 'Pinterest';
      case 'organic':
        return 'Organic';
      case 'direct':
        return 'Direct';
      case 'referral':
        return 'Referral';
      case 'my_business':
        return 'My Business';
      case 'retargeting':
        return 'Retargeting';
      default:
        return truncateString(channel, 20);
    }
  };

  const getChannelIcon = (name: string) => {
    const cName = name.toLowerCase();
    switch (cName) {
      case "organic":
        return <Search />;
      case "direct":
        return <Link />;
      case "retargeting":
        return <Repeat />;
      case "referral":
        return <Monitor />;
      case "google ads":
        return '/GoogleAdsIcon.svg';
      case "mobile":
        return '/Mobile.svg';
      case "tablet":
        return '/Tablet.svg';
      default:
        return <Monitor />;
    }
  };
  const getLeadTypeIcon = (interaction: string) => {
    const intractionType = interaction.toUpperCase()
    if (intractionType === "FORM".toUpperCase()) {
      return '/Form.svg';
    } else if (intractionType === "CALL".toUpperCase()) {
      return '/PhoneIcon.svg';
    } else {
      return <MdOutlineChat className="mr-2 h-4 w-4 text-gray-500" />;
    }
  }

  const channelName = contactData?.timeline?.[contactData?.timeline?.length - 1]?.data?.channel ?? ''
  const intractionType = contactData?.timeline?.[contactData?.timeline?.length - 1]?.type ?? ''
  const jobType = contactData?.timeline?.[contactData?.timeline?.length - 1]?.data.job_type ?? ''
  const websiteUrl = contactData?.timeline?.[contactData?.timeline?.length - 1]?.data?.landing_page || contactData?.timeline?.[contactData?.timeline?.length - 1]?.data?.url || ''
  const totalRevenue = Number(contactData?.revenue) || 0;
  return (
    <div>
      <div className='flex flex-wrap flex-col lg:flex-row justify-between gap-4 lg:gap-0'>
        <div className='flex gap-1 items-start'>
          <button className='mt-0.5' onClick={() => router.back()}>
            <IoArrowBack />
          </button>
          <PageHeader
            title="Contact Details"
            breadcrumbs={
              [
                { label: "Contacts", href: "/contacts" },
                { label: "Contact Details", href: `/contacts/contactdetails` }
              ]
            }
            description={
              contactData?.email ?
                <TextWithCopy
                  text={isLoading ? 'Loading...' : contactData?.email}
                  toastTitle='The Email has been copied to your clipboard'
                  toastDescription='You can paste it wherever needed.'
                /> : undefined
            }
          />
        </div>

        <div className="flex flex-col flex-wrap md:flex-row gap-4 md:gap-8 items-start lg:items-center overflow-x-auto">
          {/* Type */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl flex items-center justify-center mb-1 border border-neutral-50 shadow-[0px_4px_16px_-2px_#0000000F]">
              <Image
                src="/DealIcon.svg"
                alt="Case Icon"
                width={22}
                height={22}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base leading-6 font-normal tracking-[-0.02em] text-neutral-500">Type</span>
              {isLoading ? (
                <Skeleton />
              ) : (
                <span className="text-base leading-6 font-normal tracking-normal text-black capitalize">
                  {contactData?.contact_type?.toLowerCase() === 'deal' ? 'CASE' : contactData?.contact_type}
                </span>)}
            </div>
          </div>
          {/* First date */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl flex items-center justify-center mb-1 border border-neutral-50 shadow-[0px_4px_16px_-2px_#0000000F]">
              <Image
                src="/CalendarIcon.svg"
                alt="Calendar Icon"
                width={22}
                height={22}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base leading-6 font-normal tracking-[-0.02em] text-neutral-500">First date</span>
              {isLoading ? (
                <Skeleton />
              ) : (
                <span className="text-base leading-6 font-normal tracking-normal text-black">
                  {formatDate(contactData?.timeline?.[contactData?.timeline?.length - 1]?.timestamp ?? '')}
                </span>)}
            </div>
          </div>
          {/* First interaction */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl flex items-center justify-center mb-1 border border-neutral-50 shadow-[0px_4px_16px_-2px_#0000000F]">
              {typeof getLeadTypeIcon(intractionType ?? '') === "string" ? (
                <Image
                  src={getLeadTypeIcon(intractionType ?? '') as string}
                  alt="Lead Icon"
                  width={22}
                  height={22}
                />
              ) : (
                <span>
                  {getLeadTypeIcon(intractionType ?? '')}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-base leading-6 font-normal tracking-[-0.02em] text-neutral-500">First interaction</span>
              {isLoading ? (
                <Skeleton />
              ) : (
                <span className="text-base leading-6 font-normal tracking-normal text-black">
                  {getInteractionTypeText(intractionType ?? '')}
                </span>
              )}
            </div>
          </div>
          {/* Lead creation */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl flex items-center justify-center mb-1 border border-neutral-50 shadow-[0px_4px_16px_-2px_#0000000F]">
              {typeof getChannelIcon(channelName ?? '') === "string" ? (
                <Image
                  src={getChannelIcon(channelName.toLowerCase() ?? '') as string}
                  alt="Channel Icon"
                  width={22}
                  height={22}
                />
              ) : (
                <span>
                  {getChannelIcon(channelName ?? '')}
                </span>
              )}

            </div>
            <div className="flex flex-col">
              <span className="text-base leading-6 font-normal tracking-[-0.02em] text-neutral-500">Lead creation</span>
              <span className="text-base leading-6 font-normal tracking-normal text-black break-all overflow-wrap-anywhere">
                {isLoading ? (
                  <Skeleton />
                ) : (<>
                  {getChannelText(channelName ?? '')}
                </>)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className='flex flex-col lg:flex-row gap-4 mt-4'>
        <div className='w-full lg:w-[23%]'>
          <ContactDetailsSidebar
            phone={contactData?.phone || ''}
            website={getBaseUrl(websiteUrl) ?? ''}
            location="Anytown, USA"
            revenue={totalRevenue || 0}
            review={dummyReview}
            jobType={jobType || ''}
            isLoading={isLoading}
            contactType={contactData?.contact_type || ''}
            contactId={contactData?.id || ''}
            callTracking={contactData?.call_tracking || []}
            formTracking={contactData?.form_tracking || []}
            sessionIPAddress={contactData?.visitor_sessions?.[0]?.ip_address || ''}
          />
        </div>
        <div className='w-full lg:w-[77%] bg-white p-4 rounded-2xl'>
          <ContactTabs contactData={contactData} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
} 