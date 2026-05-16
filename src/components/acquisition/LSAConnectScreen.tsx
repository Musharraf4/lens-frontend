"use client";

import { Button } from "@/components/ui/button";
import { useProviderLogin } from "@/services/auth.api";
import { useIntegrations } from "@/services/integrations.api";
import { useIntegrationContext } from "@/store/IntegrationContext";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import Image from "next/image";
import { IoIosLink } from "react-icons/io";
import PageHeader from "../PageHeader";
import { DateSelector } from "../home/DateSelector";
import { Role } from "@/enums";
import { useDateFilter } from "@/store/DateFilterContext";

export default function GoogleLocalServiceAdsConnectScreen() {
  const { timeRange, setTimeRange } = useDateFilter();

  const { data: integrations, isLoading: isIntegrationsLoading } = useIntegrations();
  const selectedIntegration = integrations?.find(
    (integration) => integration.name === "google_lsa"
  );
  const providerLoginMutation = useProviderLogin();
  const { selectedCompany } = useSelectedCompanyStore();
  const { refreshIntegrations } = useIntegrationContext();
  const handleConnect = () => {
    if (isIntegrationsLoading || !selectedIntegration) {
      console.error("Integration not ready yet");
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
          title="Local Service Ads"
          breadcrumbs={[
            { label: "Acquisition" },
            { label: "Local Service Ads", href: "/acquisition/local-service-ads" },
          ]}
        />
        <div className="self-end sm:self-auto">
          <DateSelector
            disabled
            selected={timeRange}
            onChange={setTimeRange}
          />
        </div>
      </div>
      <div className="flex mt-12 flex-col lg:flex-row gap-8 justify-between  items-center p-4 lg:pl-35 lg:pr-35">
        <div className="flex items-center justify-center" data-tour="account-connect-section">
          <div className="flex flex-col gap-6">
            <div className="flex items-center relative">
              {/* <img
                src="/circles-bg-icon.svg"
                className="absolute inset-0 top-6 left-19 w-40"
              /> */}
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4 z-50">
                <Image
                  src="/GoogleIcon.svg"
                  alt="Google Logo"
                  width={48}
                  height={48}
                />
              </div>
              <div className="flex items-center">
                <img
                  src="/line.svg"
                  alt="line"
                  className="pointer-events-none"
                />
                <div
                  className="w-10 h-10 rounded-full border border-neutral-300/20
                bg-white p-2 flex items-center justify-center"
                >
                  <IoIosLink size={24} />
                </div>
              </div>
              <img style={{
                top: '-75px',
                right: '7px',
              }} src="/rectangles.svg" alt="" className="absolute object-cover -z-10 ml-4 pointer-events-none" />
            </div>
            <div className="relative z-10">
              <h3 className="font-medium text-lg">Local Service Ads not connected</h3>
              <p className="text-gray-500 mt-1">
                Connect Local Service Ads to get full analytics data.
              </p>
              <Button
                onClick={handleConnect}
                className="mt-4 bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                disabled={isIntegrationsLoading || !selectedIntegration || ((selectedCompany?.role !== Role.Admin) && (selectedCompany?.role !== Role.Owner))}
              >
                Connect
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm w-full lg:w-1/2 xl:w-2/5">
          <div className="mb-4">
            <Image
              src="/GoogleIcon.svg"
              alt="Google Logo"
              width={58}
              height={58}
              className="p-3 mb-4 border border-neutral-50 rounded-xl"
            />
          </div>

          <h3 className="font-medium mb-1 text-black">
            Boost your law firm’s lead generation
            <br />
            with the pay-per-lead ad product
          </h3>
          <p className="text-neutral-500 text-sm mb-6">
            With Google Ads in Lenz, targeting your customers with
            <br />
            highly relevant ads and reporting on the true ROI of your
            <br />
            campaigns is simple.
          </p>

          <h4 className="text-neutral-500 mb-3">Features</h4>

          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 text-black border border-neutral-50 rounded-xl">
              <img src="/track.svg" />
              <span>Track lead sources</span>
            </div>

            <div className="flex items-center gap-2 p-3 text-black border border-neutral-50 rounded-xl">
              <img src="/monitor.svg" />
              <span>Monitor ad performance</span>
            </div>
          </div>

          <div className="flex justify-end mt-4 disabled-div">
            <button className="text-neutral-500 hover:text-gray-700">Learn more</button>
          </div>
        </div>
      </div>
    </>
  );
}
