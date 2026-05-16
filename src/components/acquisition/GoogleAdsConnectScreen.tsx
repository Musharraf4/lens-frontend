"use client";

import { Button } from "@/components/ui/button";
import { useProviderLogin } from "@/services/auth.api";
import { useIntegrations } from "@/services/integrations.api";
import { useAuth } from "@/store/AuthContext";
import { useIntegrationContext } from "@/store/IntegrationContext";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import Image from "next/image";
import { IoIosLink } from "react-icons/io";
import { DateSelector } from "../home/DateSelector";
import { Tabs } from "../Tabs";
import { Role } from "@/enums";

interface GoogleAdsConnectScreenProps {
  onConnect: () => void;
}
const tabOptions = [
  { label: "Overview", value: "overview", isDisabled: true },
  { label: "Insights", value: "insights", isDisabled: true },
  { label: "Competitors", value: "competitors", isDisabled: true },
  { label: "Projection", value: "projection", isDisabled: true },
];
export default function GoogleAdsConnectScreen({ onConnect }: GoogleAdsConnectScreenProps) {
  const { data: integrations } = useIntegrations();
  const { selectedCompany } = useSelectedCompanyStore();
  const selectedIntegration = integrations?.find(integration => integration.name === "google_ads");

  const providerLoginMutation = useProviderLogin();
  const { user } = useAuth();
  const { refreshIntegrations } = useIntegrationContext();

  const handleConnect = () => {
    if (!selectedIntegration) {
      console.error('No integration data available');
      return;
    }

    providerLoginMutation.mutate({
      integration_id: selectedIntegration.id,
      company_id: selectedCompany?.company?.id || "",
    }, {
      onSuccess: () => {
        refreshIntegrations();
      },
      onError: (error) => {
        console.error('Provider login failed:', error);
      }
    });
  };

  return (
    <>
      <div className="flex flex-wrap justify-between items-center w-full overflow-x-auto" data-tour="google-ads-tabs">
        <Tabs
          tabs={tabOptions}
          activeTab={'overview'}
          onTabChange={() => { }}
        />
        <DateSelector selected={'Last Month'} onChange={() => { }} disabled />
      </div>
      <div className="flex mt-12 flex-col lg:flex-row gap-8 justify-between  items-center p-4 lg:pl-35 lg:pr-35" >
        <div className="flex items-center justify-center" data-tour="account-connect-section">
          <div className="flex flex-col  gap-6">
            <div className="flex items-center relative">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4 z-50">
                <Image src="/GoogleAdsIcon.svg" alt="Google Ads Logo" width={48} height={48} />
              </div>
              <div className="flex items-center ml-2 gap-2">
                <div className="w-12 h-0.5 border-b border-dashed border-gray-300"></div>
                <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center ml-2">
                  <IoIosLink size={24} className="bg-white rounded-2xl" />
                </div>
              </div>
              <img style={{
                top: '-80px',
                right: '0px',
              }} src="/rectangles.svg" alt="" className="absolute object-cover z-0 ml-4 pointer-events-none" />
            </div>
            <div>
              <h3 className="font-medium text-lg">Google Ads not connected</h3>
              <p className="text-gray-500 mt-1">
                Connect Google Ads service to get full analytics data.
              </p>
              <Button
                onClick={handleConnect}
                className="mt-4 bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 dis"
                disabled={((selectedCompany?.role !== Role.Admin) && (selectedCompany?.role !== Role.Owner))}
              >
                Connect
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm w-full lg:w-1/2 xl:w-2/5">
          <div className="flex mb-4">
            <div className="p-2 border rounded-lg">
              <Image
                src="/GoogleAdsIcon.svg"
                alt="Google Ads Logo"
                width={48}
                height={48}
              />
            </div>
          </div>

          <h3 className="font-medium text-lg mb-1">Drive high-quality leads<br />and conversions with Google Ads</h3>
          <p className="text-gray-500 text-sm mb-6 ">
            With Google Ads in Lenz, targeting your customers with
            <br />
            highly relevant ads and reporting on the true ROI of your
            <br />
            campaigns is simple.
          </p>

          <h4 className="font-medium text-gray-600 text-sm mb-3">Features</h4>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 16V8C3 5.79086 4.79086 4 7 4H17C19.2091 4 21 5.79086 21 8V16C21 18.2091 19.2091 20 17 20H7C4.79086 20 3 18.2091 3 16Z" stroke="#000000" strokeWidth="2" />
                <path d="M3 8L12 14L21 8" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Import campaign data</span>
            </div>

            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="#000000" strokeWidth="2" />
                <path d="M16.5 12L10.5 16.3301L10.5 7.66987L16.5 12Z" fill="#000000" />
              </svg>
              <span>Track conversions</span>
            </div>

            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16.92V19.92C22 20.4704 21.7893 20.9983 21.4142 21.3733C21.0391 21.7484 20.5113 21.9591 19.96 21.9591C19.3373 21.9591 18.7173 21.8851 18.11 21.7401C17.5566 21.6058 17.0226 21.4015 16.52 21.1301C16.0172 20.8586 15.5472 20.5224 15.12 20.1301C14.7077 19.7029 14.3714 19.2329 14.1 18.7301C13.8286 18.2275 13.6243 17.6935 13.49 17.1401C13.345 16.5328 13.271 15.9128 13.271 15.2901C13.271 14.7388 13.4817 14.211 13.8567 13.8359C14.2318 13.4608 14.7597 13.2501 15.31 13.2501H18.31C18.8297 13.2501 19.3283 13.4385 19.7033 13.7735C20.0783 14.1085 20.3018 14.5765 20.34 15.0901C20.4 15.9101 20.55 16.7201 20.78 17.5001C20.9255 17.9728 20.8955 18.4804 20.6956 18.9338C20.4957 19.3872 20.1399 19.7563 19.69 19.9801L18.95 20.3701" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.7099 13.25C11.6799 11.19 13.2899 9.58 15.3499 8.61" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.56 5.56L5.5 8.5L3.5 6.5" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.5 2.44V5.56H11.62" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Push call tracking data</span>
            </div>
          </div>

          <div className="flex justify-end mt-4 disabled-div">
            <button className="text-gray-500 text-sm hover:text-gray-700">Learn more</button>
          </div>
        </div>
      </div>
    </>
  );
}
