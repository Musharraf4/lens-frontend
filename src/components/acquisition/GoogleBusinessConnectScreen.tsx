"use client";

import { Button } from "@/components/ui/button";
import { useProviderLogin } from "@/services/auth.api";
import { useIntegrations } from "@/services/integrations.api";
import { useAuth } from "@/store/AuthContext";
import { useIntegrationContext } from "@/store/IntegrationContext";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import Image from "next/image";
import { IoIosLink } from "react-icons/io";
import PageHeader from "../PageHeader";
import { DateSelector } from "../home/DateSelector";
import { Role } from "@/enums";

interface GoogleBusinessConnectScreenProps {
  onConnect?: () => void;
}

export default function GoogleBusinessConnectScreen({
  onConnect,
}: GoogleBusinessConnectScreenProps) {
  const { data: integrations } = useIntegrations();
  const selectedIntegration = integrations?.find(
    (integration) => integration.name === "google_business"
  );
  const providerLoginMutation = useProviderLogin();
  const { user } = useAuth();
  const { selectedCompany } = useSelectedCompanyStore();

  const { refreshIntegrations } = useIntegrationContext();

  const handleConnect = () => {
    if (!selectedIntegration) {
      console.error("No integration data available");
      return;
    }

    providerLoginMutation.mutate(
      {
        integration_id: selectedIntegration.id,
        company_id: selectedCompany?.company?.id || "",
      },
      {
        onSuccess: () => {
          refreshIntegrations();
        },
        onError: (error) => {
          console.error("Provider login failed:", error);
        },
      }
    );
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-2">
        <PageHeader
          title="Google My Business"
          breadcrumbs={[
            { label: "Acquisition" },
            { label: "Google My Business", href: "/acquisition/google-my-business" },
          ]}
        />
        <div className="self-end sm:self-auto">
          <DateSelector selected={'Last Month'} onChange={() => { }} disabled />
        </div>
      </div>
      <div className="flex mt-12 flex-col lg:flex-row gap-8 justify-between  items-center p-4 lg:pl-35 lg:pr-35">
        <div className="flex items-center justify-center" data-tour="account-connect-section">
          <div className="flex flex-col gap-6">
            <div className="flex items-center relative" >
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <Image
                  src="/GoogleBusinessIcon.svg"
                  alt="Google Buisness Logo"
                  width={48}
                  height={48}
                />
              </div>
              <div className="flex items-center ml-2 gap-2">
                <div className="w-12 h-0.5 border-b border-dashed border-gray-300"></div>
                <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center ml-2">
                  <IoIosLink size={24} />
                </div>
              </div>
              <img style={{
                top: '-80px',
                right: '0px',
              }} src="/rectangles.svg" alt="" className="absolute object-cover z-0 ml-4 pointer-events-none" />
            </div>
            <div>
              <h3 className="font-medium text-lg">Google My Business not connected</h3>
              <p className="text-gray-500 mt-1">
                Connect My Business service to get full analytics data.
              </p>
              <Button
                onClick={handleConnect}
                className="mt-4 bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                disabled={((selectedCompany?.role !== Role.Admin) && (selectedCompany?.role !== Role.Owner))}
              >
                Connect
              </Button>
            </div>
          </div>
        </div >

        <div className="bg-white p-6 rounded-2xl shadow-sm w-full lg:w-1/2 xl:w-2/5">
          <div className="flex mb-4">
            <div className="p-2 border rounded-lg">
              <Image
                src="/GoogleBusinessIcon.svg"
                alt="Google Business Logo"
                width={48}
                height={48}
              />
            </div>
          </div>

          <h3 className="font-medium text-lg  mb-1">
            Turn people who find you into new customers with My Business
          </h3>
          <p className="text-gray-500 text-sm mb-6 ">
            With Google Ads in Lenz, targeting your customers with highly relevant ads and reporting
            on the true ROI of your campaigns is simple.
          </p>

          <h4 className="font-medium text-gray-600 text-sm mb-3">Features</h4>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <img src='/Sync.svg' alt="Sync" />
              <span>Sync business information</span>
            </div>

            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <img src='/Phone-star.svg' alt="Sync" />
              <span>Track call and form submission</span>
            </div>
          </div>

          <div className="flex justify-end mt-4 disabled-div">
            <button className="text-gray-500 text-sm hover:text-gray-700">Learn more</button>
          </div>
        </div>
      </div >
    </>
  );
}
