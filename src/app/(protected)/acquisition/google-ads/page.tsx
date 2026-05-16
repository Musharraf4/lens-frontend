"use client";

import { Dropdown } from "@/components/Dropdown";
import PageHeader from "@/components/PageHeader";
import GoogleAdsConnectScreen from "@/components/acquisition/GoogleAdsConnectScreen";
import GoogleAdsContainer from "@/components/acquisition/GoogleAdsContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { useIntegrationConfigs } from "@/services/integrationsConfig.api";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { useEffect, useState } from "react";

export default function GoogleAdsAcquisitionPage() {
  const [selectedConfigurationId, setSelectedConfigurationId] = useState<string | null>(null);
  const { selectedCompany } = useSelectedCompanyStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: IntegrationConfig, isLoading: isIntegrationConfigLoading } = useIntegrationConfigs(
    selectedCompany?.company?.id
  );
  const filteredConfigurations = IntegrationConfig?.filter(
    ({ integration_name, is_active }) => integration_name === "google_ads" && is_active
  );

  // Updated condition to check if:
  // 1. There are no Google Ads configurations at all, OR
  // 2. All existing Google Ads configurations have is_active set to false
  const hasActiveGoogleAdsIntegration =
    filteredConfigurations &&
    filteredConfigurations.length > 0 &&
    filteredConfigurations.some((config) => config.is_active === true);

  useEffect(() => {
    if (hasActiveGoogleAdsIntegration) {
      // Find the first active configuration
      const activeConfig = filteredConfigurations.find((config) => config.is_active === true);
      setSelectedConfigurationId(activeConfig?.id || null);
    }
  }, [hasActiveGoogleAdsIntegration]);

  const handleConnectGoogleAds = () => {
  };
  const selectedConfig = filteredConfigurations?.find(
    (config) => config.id === selectedConfigurationId
  );
  return (
    <div className="mx-auto p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="items-center mb-2 flex justify-between">
        <PageHeader 
          title="Google Ads" 
          breadcrumbs={[
            { label: 'Acquisition' },
            { label: 'Google Ads', href: '/acquisition/google-ads' }
          ]}
          data-tour="google-ads-page-header"
        />
        <div
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          <Dropdown
            options={filteredConfigurations?.map(config => ({
              id: config.id,
              option: dropdownOpen ? config.user_email : config.user_email.charAt(0).toUpperCase()
            })) || []}
            value={selectedConfigurationId || ""}
            onChange={(value) => {
              setSelectedConfigurationId(value as string)
            }}
            placeholder="Select a configuration"
            triggerClassName="rounded-full bg-white text-sm"
            disabled={!hasActiveGoogleAdsIntegration}
          />
        </div>

      </div>
      {isIntegrationConfigLoading ? (
        <Skeleton className="w-full h-96" />
      ) : !hasActiveGoogleAdsIntegration ? (
        <div data-tour="google-ads-connect-screen">
          <GoogleAdsConnectScreen onConnect={handleConnectGoogleAds} />
        </div>
      ) : (
        <div data-tour="google-ads-content">
          <GoogleAdsContainer selectedConfigurationId={selectedConfigurationId} />
        </div>
      )}
    </div>
  );
}
