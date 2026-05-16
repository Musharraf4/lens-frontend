"use client";

import CompanyCard, { MetricData } from "@/components/acquisition/CompanyCard";
import { DateSelector } from "@/components/home/DateSelector";
import { MainMetricCard } from "@/components/home/MainMetricCard";
import {
  CPACardSkeleton,
  MainMetricCardSkeleton,
  StatsCardSkeleton,
} from "@/components/home/Skeleton";
import StackedChart from "@/components/home/StackedChart";
import PageHeader from "@/components/PageHeader";
import { useEffect, useState, useMemo } from "react";

import GoogleBusinessConnectScreen from "@/components/acquisition/GoogleBusinessConnectScreen";
import { useIntegrationConfigs } from "@/services/integrationsConfig.api";
import {
  IGBPLocationsActionsResponse,
  ILocationAction,
  useGBPAnalyticsMetrics,
  useGBPLocationsActions,
  useGBPLocationsActionsAnalytics,
} from "@/services/googleBusinessProfile.api";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { useDateFilter } from "@/store/DateFilterContext";
import { useApp } from "@/store/appStore";
import { SummaryCard } from "@/components/common/SummaryCard";
import { Dropdown } from "@/components/Dropdown";
import { formatAddress, isNonEmptyObject } from "@/lib/utils";

export default function GoogleMyBusinessAcquisitionPage() {
  const { sidebarOpen } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { timeRange, setTimeRange } = useDateFilter();
  const [hasData, setHasData] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedConfigurationId, setSelectedConfigurationId] = useState<
    string | null
  >(null);
  const { selectedCompany } = useSelectedCompanyStore();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  const { data: integrationConfigs, isLoading: isIntegrationConfigLoading } =
    useIntegrationConfigs(selectedCompany?.company?.id);

  const filteredConfigurations = integrationConfigs?.filter(
    (config) => config.integration_name === "google_business" && config.is_active
  );
  const hasActiveGoogleBusinessIntegration =
    filteredConfigurations &&
    filteredConfigurations.length > 0 &&
    filteredConfigurations.some((config) => config.is_active === true);
  useEffect(() => {
    if (hasActiveGoogleBusinessIntegration) {
      const activeConfig = filteredConfigurations.find(config =>
        config.is_active && (!selectedConfigurationId || config.id === selectedConfigurationId)
      );

      if (!selectedConfigurationId)
        setSelectedConfigurationId(activeConfig?.id || null);
      setSelectedCompanyId(
        activeConfig?.config_data?.accounts?.[0]?.account_id || null
      );
      setSelectedAddressId(
        activeConfig?.config_data?.accounts?.[0]?.locations?.[0]
          ?.location_id || null
      );
    }
  }, [
    hasActiveGoogleBusinessIntegration,
    selectedConfigurationId,
  ]);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedAddressId(
      filteredConfigurations
        ?.find((config) => config.id === selectedConfigurationId)
        ?.config_data?.accounts?.find(
          (account: any) => account.account_id === companyId
        )?.locations?.[0]?.location_id || null
    );
  };

  const handleAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  const selectedConfig = filteredConfigurations?.find(
    (config) => config.id === selectedConfigurationId
  )?.config_data;

  // Collect all location IDs from all accounts in the selected configuration
  const allLocationIds = useMemo(() => {
    if (!selectedConfig?.accounts) return [];
    const locationIds: string[] = [];
    selectedConfig.accounts.forEach((account: any) => {
      if (account.locations && Array.isArray(account.locations)) {
        account.locations.forEach((location: any) => {
          if (location.location_id) {
            locationIds.push(location.location_id);
          }
        });
      }
    });
    return locationIds;
  }, [selectedConfig]);

  const getMetricValue = (
    key: keyof ILocationAction,
    selectedAddressId: string | null,
    gbpLocationsData?: IGBPLocationsActionsResponse
  ): string => {
    if (!selectedAddressId) return "0";
    return String(
      gbpLocationsData?.locations?.[selectedAddressId]?.[key] ?? "0"
    );
  };
  // Fetch GBP locations actions data
  const { data: gbpLocationsData, isLoading: isGBPLocationsLoading } = useGBPLocationsActions(
    selectedCompany?.company?.id,
    timeRange,
    selectedConfigurationId,
    allLocationIds,
    hasActiveGoogleBusinessIntegration && allLocationIds.length > 0
  );

  // Fetch GBP locations Matrics
  const { data: gbpAnalyticsMetricsData, isLoading: isGBPAnalyticsMetricsLoading } = useGBPAnalyticsMetrics(
    selectedCompany?.company?.id,
    timeRange,
    selectedConfigurationId,
    allLocationIds,
    hasActiveGoogleBusinessIntegration && allLocationIds.length > 0
  );

  // Fetch GBP locations actions data
  const { data: gbpAnalyticsData, isLoading: isGBPLocationsChangesLoading } = useGBPLocationsActionsAnalytics(
    selectedCompany?.company?.id,
    timeRange,
    selectedConfigurationId,
    allLocationIds,
    hasActiveGoogleBusinessIntegration && allLocationIds.length > 0 && Boolean(gbpLocationsData),
    {
      website_clicks: gbpLocationsData?.aggregated?.total_website_clicks || 0,
      messages: gbpLocationsData?.aggregated?.total_messages || 0,
      directions: gbpLocationsData?.aggregated?.total_direction_requests || 0,
      phone_calls: gbpLocationsData?.aggregated?.total_calls || 0,
      bookings: gbpLocationsData?.aggregated?.total_bookings || 0,
      leads: gbpLocationsData?.aggregated?.leads || 0,
      deals: gbpLocationsData?.aggregated?.deals || 0,
      total_interactions:
        gbpLocationsData?.aggregated?.total_actions || 0,
    }

  );

  const { data: locationAnalyticsChange, } = useGBPLocationsActionsAnalytics(
    selectedCompany?.company?.id,
    timeRange,
    selectedConfigurationId,
    [selectedAddressId || ''],
    hasActiveGoogleBusinessIntegration && allLocationIds.length > 0 && Boolean(gbpLocationsData),
    {
      website_clicks: Number(getMetricValue("website_clicks", selectedAddressId, gbpLocationsData)) || 0,
      messages: Number(getMetricValue("messages", selectedAddressId, gbpLocationsData)) || 0,
      directions: Number(getMetricValue("directions", selectedAddressId, gbpLocationsData)) || 0,
      phone_calls: Number(getMetricValue("phone_calls", selectedAddressId, gbpLocationsData)) || 0,
      bookings: Number(getMetricValue("bookings", selectedAddressId, gbpLocationsData)) || 0,
      leads: Number(getMetricValue("leads", selectedAddressId, gbpLocationsData)) || 0,
      deals: Number(getMetricValue("deals", selectedAddressId, gbpLocationsData)) || 0,
      total_interactions:
        Number(getMetricValue(
          "total_interactions",
          selectedAddressId,
          gbpLocationsData
        )) || 0,
    },
    true
  );
  // Update loading state based on API call
  useEffect(() => {
    if (gbpLocationsData !== undefined) {
      setLoading(false);
      setHasData(true);
    }
  }, [gbpLocationsData]);

  const checkTrend = (change: number | null) => {
    if (!change) return "neutral";
    return change >= 0 ? "up" : "down";
  }
  const metrics = [
    {
      label: "Interactions",
      value: getMetricValue(
        "total_interactions",
        selectedAddressId,
        gbpLocationsData
      ),
      trend: selectedAddressId ? checkTrend(locationAnalyticsChange?.aggregated?.total_interactions?.change_pct ?? null) : "neutral",
    },
    {
      label: "Leads",
      value: gbpLocationsData?.aggregated?.leads || "0",
      trend: selectedAddressId ? checkTrend(locationAnalyticsChange?.aggregated?.leads?.change_pct ?? null) : "neutral",
    },
    {
      label: "Messages",
      value: getMetricValue("messages", selectedAddressId, gbpLocationsData),
      trend: selectedAddressId ? checkTrend(locationAnalyticsChange?.aggregated?.messages?.change_pct ?? null) : "neutral",
    },
    {
      label: "Booking",
      value: getMetricValue("bookings", selectedAddressId, gbpLocationsData),
      trend: selectedAddressId ? checkTrend(locationAnalyticsChange?.aggregated?.bookings?.change_pct ?? null) : "neutral",
    },
    {
      label: "Directions",
      value: getMetricValue("directions", selectedAddressId, gbpLocationsData),
      trend: selectedAddressId ? checkTrend(locationAnalyticsChange?.aggregated?.directions?.change_pct ?? null) : "neutral",
    },
    {
      label: "Website Clicks",
      value: getMetricValue(
        "website_clicks",
        selectedAddressId,
        gbpLocationsData
      ),
      trend: selectedAddressId ? checkTrend(locationAnalyticsChange?.aggregated?.website_clicks?.change_pct ?? null) : "neutral",
    },
  ];
  if (isIntegrationConfigLoading) {
    return (
      <div className="flex items-center justify-center py-16">Loading...</div>
    );
  }
  if (!hasActiveGoogleBusinessIntegration) {
    return (
      <div data-tour="gmb-connect-screen">
        <GoogleBusinessConnectScreen />
      </div>
    );
  }

  const selectedBusinessAccount = selectedConfig?.accounts?.find(
    (account: any) => account.account_id === selectedCompanyId
  );
  return (
    <div className="mx-auto p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="items-center mb-2 flex justify-between">
        <PageHeader
          title="Google My Business"
          breadcrumbs={[
            { label: "Acquisition" },
            {
              label: "Google My Business",
              href: "/acquisition/google-my-business",
            },
          ]}
          data-tour="gmb-page-header"
        />
        <div
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          <Dropdown
            options={
              filteredConfigurations?.map((config) => ({
                id: config.id,
                option: dropdownOpen
                  ? config.user_email
                  : config.user_email.charAt(0).toUpperCase(),
              })) || []
            }
            value={selectedConfigurationId || ""}
            onChange={(value) => {
              setSelectedConfigurationId(value as string);
            }}
            placeholder="Select a configuration"
            triggerClassName="rounded-full bg-white text-sm"
            disabled={!hasActiveGoogleBusinessIntegration}
          />
        </div>
      </div>
      <div className="flex justify-end w-fit sm:w-auto mb-6" >
        <DateSelector selected={timeRange} onChange={setTimeRange} />
      </div>

      <div className="grid grid-cols-4 gap-4" data-tour="gmb-content">
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${sidebarOpen ? "lg:col-span-4" : "lg:col-span-2"
            } xl:col-span-2 col-span-4`}
        >
          {loading || isGBPLocationsLoading ? (
            <>
              <MainMetricCardSkeleton bgColor="bg-white" />
              <MainMetricCardSkeleton bgColor="bg-white" />
            </>
          ) : (
            <>
              <MainMetricCard
                title="Leads"
                backgroundImage="/assets/background.png"
                value={gbpLocationsData?.aggregated?.leads || "0"}
                change={gbpAnalyticsData?.aggregated?.leads?.change_pct}
                bgColor="bg-lime-400"
                variant="lime"
              />
              <MainMetricCard
                title="Cases"
                value={gbpLocationsData?.aggregated?.deals || "0"}
                change={gbpAnalyticsData?.aggregated?.deals?.change_pct}
                bgColor="bg-neutral-50"
              />
            </>
          )}
        </div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${sidebarOpen ? "lg:col-span-4" : "lg:col-span-2"
            } xl:col-span-2 col-span-4`}
        >
          {loading || isGBPLocationsLoading ? (
            <>
              <CPACardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <SummaryCard
                value={gbpLocationsData?.aggregated?.total_actions || "0"}
                change={gbpAnalyticsData?.aggregated?.total_interactions?.change_pct ?? 0}
                heading="Interactions"
                loadingChanges={isGBPLocationsChangesLoading}
                tooltipText="Total interactions on Google My Business"
              />
              <SummaryCard
                value={gbpLocationsData?.aggregated?.total_messages || "0"}
                change={gbpAnalyticsData?.aggregated?.messages?.change_pct ?? 0}
                heading="Messages"
                loadingChanges={isGBPLocationsChangesLoading}
                tooltipText="Total messages received"
              />
              <SummaryCard
                value={
                  gbpLocationsData?.aggregated?.total_direction_requests || "0"
                }
                change={gbpAnalyticsData?.aggregated?.directions?.change_pct ?? 0}
                heading="Directions"
                loadingChanges={isGBPLocationsChangesLoading}
                tooltipText="Total direction requests"
              />
              <SummaryCard
                value={
                  gbpLocationsData?.aggregated?.total_website_clicks || "0"
                }
                change={gbpAnalyticsData?.aggregated?.website_clicks?.change_pct ?? 0}
                heading="Website Clicks"
                loadingChanges={isGBPLocationsChangesLoading}
                tooltipText="Total website clicks"
              />
            </>
          )}
        </div>
      </div>
      <div className="mt-4" data-tour="gmb-company-card">
        <CompanyCard
          title="Locations"
          companyName={selectedBusinessAccount?.account_name || ""}
          companyId={selectedCompanyId}
          address={
            formatAddress(
              selectedBusinessAccount?.locations?.find(
                (location: any) => location.location_id === selectedAddressId
              )?.address
            ) || ""
          }
          selectedAddressId={selectedAddressId}
          metrics={metrics as MetricData[]}
          companies={
            selectedConfig?.accounts?.map((account: any) => ({
              id: account.account_id,
              name: account.account_name,
            })) || []
          }
          selectedConfigurationId={selectedConfigurationId}
          addresses={
            selectedBusinessAccount?.locations
              ?.filter((location: any) => isNonEmptyObject(location?.address))
              ?.map((location: any) => ({
                id: location.location_id,
                // Pass both name and formatted address so the dropdown can show two lines
                name: location.location_name,
                address: formatAddress(location.address),
              })) || []
          }
          onCompanyChange={handleCompanyChange}
          onAddressChange={handleAddressChange}
          isLoading={loading || isGBPLocationsLoading}
          gmb
        />
      </div>
      <div className="mt-4" data-tour="gmb-stacked-chart">
        <StackedChart data={gbpAnalyticsMetricsData?.items || []} loading={isGBPAnalyticsMetricsLoading} hideRevenue />
      </div>
    </div>
  );
}
