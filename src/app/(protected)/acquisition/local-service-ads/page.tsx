"use client";

import { CompanyCard, MetricData } from "@/components/acquisition/CompanyCard";
import KPIByJobTypeChart from "@/components/charts/JobTypeChart";
import BaseStackedChart from "@/components/home/BaseStackedChart";
import { DateSelector } from "@/components/home/DateSelector";
import { MainMetricCard } from "@/components/home/MainMetricCard";
import { MainMetricCardSkeleton, SmallMetricCardSkeleton } from "@/components/home/Skeleton";
import PageHeader from "@/components/PageHeader";
import { useEffect, useState } from "react";

import {
  useHeatMap,
  useJobType,
  useLSALocationsQuery,
  useLSASummaryChangesQuery,
  useMonthlyChart,
  useSummary,
} from "@/services/googleLSA.api";

import GoogleLocalServiceAdsConnectScreen from "@/components/acquisition/LSAConnectScreen";
import { SummaryCard } from "@/components/common/SummaryCard";
import { useIntegrationConfigs } from "@/services/integrationsConfig.api";
import { useApp } from "@/store/appStore";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import LSAHeatMap from "./LSAHeatMap";
import { fmt } from "@/lib/utils";
import { CURRENCY_SYMBOL } from "@/constants";
import { useDateFilter } from "@/store/DateFilterContext";

export default function LocalServiceAdsAcquisitionPage() {
  const { sidebarOpen } = useApp();
  const { timeRange, setTimeRange } = useDateFilter();
  const [selectedConfigurationId, setSelectedConfigurationId] = useState<string | null>(null);
  const { selectedCompany } = useSelectedCompanyStore();

  const { data: integrationConfigs, isLoading: isIntegrationConfigLoading } = useIntegrationConfigs(
    selectedCompany?.company?.id
  );

  const filteredConfigurations = integrationConfigs?.filter(
    (config) => config.integration_name === "google_lsa"
  );

  const hasActiveLSAIntegration =
    filteredConfigurations &&
    filteredConfigurations.length > 0 &&
    filteredConfigurations.some((config) => config.is_active === true);

  useEffect(() => {
    if (hasActiveLSAIntegration) {
      const activeConfig = filteredConfigurations.find((config) => config.is_active === true);
      setSelectedConfigurationId(activeConfig?.id || null);
    }
  }, [filteredConfigurations, hasActiveLSAIntegration]);

  const { data: heatmapData, isLoading: heatmapLoading } = useHeatMap(
    selectedConfigurationId ?? "",
    timeRange
  );
  const { data: jobTypeData, isLoading: jobTypeLoading } = useJobType(
    selectedConfigurationId ?? "",
    timeRange
  );

  const {
    data: summaryData,
    isLoading: summaryLoading,
    isSuccess: gotSummaryData,
  } = useSummary(selectedConfigurationId ?? "", timeRange);

  const { data: monthlyData, isLoading: monthlyDataLoading } = useMonthlyChart(
    selectedConfigurationId ?? "",
    selectedCompany?.company?.id
  );

  const { data: summaryChanges, isLoading: loadingSummaryChanges } = useLSASummaryChangesQuery({
    date_range: fmt(timeRange),
    configId: selectedConfigurationId,
    leads: summaryData?.leads?.value ?? 0,
    deals: summaryData?.deals?.value ?? 0,
    ad_spend: summaryData?.ad_spend?.value ?? 0,
    revenue: summaryData?.revenue?.value ?? 0,
    roas: summaryData?.roas?.value ?? 0,
    enabled: gotSummaryData,
  });

  const getTrend = (change: number) => {
    switch (true) {
      case change > 0:
        return "up";
      case change < 0:
        return "down";
      default:
        return "neutral";
    }
  }
  const { data, isLoading: isDataLoading } = useLSALocationsQuery({ config_id: selectedConfigurationId, timeRange: fmt(timeRange) });
  const companies =
    data && data.business_info && "business_name" in data.business_info
      ? [{ id: '1', name: (data.business_info as any).business_name }]
      : [];
  const addresses =
    data && typeof data.business_info === "object" && "location" in (data.business_info ?? {})
      ? [{ id: '1', address: (data.business_info as any).location }]
      : undefined;
  const metrics: MetricData[] = [
    { value: data?.kpi_summary?.leads || 0, label: "Leads", trend: getTrend(summaryChanges?.leads?.change_pct || 0) },
    { value: data?.kpi_summary?.deals || 0, label: "Cases", trend: getTrend(summaryChanges?.deals?.change_pct || 0) },
    { value: data?.kpi_summary?.revenue || 0, label: "Revenue", trend: getTrend(summaryChanges?.revenue?.change_pct || 0) },
    { value: data?.kpi_summary?.ad_spend || 0, label: "Ad Spend", trend: getTrend(summaryChanges?.ad_spend?.change_pct || 0) },
    { value: data?.kpi_summary?.roas || 0, label: "ROAS", trend: getTrend(summaryChanges?.roas?.change_pct || 0) },

  ];

  if (isIntegrationConfigLoading) {
    return <div className="flex items-center justify-center py-16">Loading...</div>;
  }
  if (!hasActiveLSAIntegration) {
    return (
      <div data-tour="lsa-connect-screen">
        <GoogleLocalServiceAdsConnectScreen />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-2">
        <PageHeader
          title="Local Service Ads"
          breadcrumbs={[
            { label: "Acquisition" },
            { label: "Local Service Ads", href: "/acquisition/local-service-ads" },
          ]}
          data-tour="lsa-page-header"
        />
        <div className="self-end sm:self-auto" data-tour="lsa-date-selector">
          <DateSelector
            selected={timeRange}
            onChange={setTimeRange}
          />
        </div>
      </div>

      {/* metric cards */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${sidebarOpen ? "xl:grid-cols-4" : "xl:grid-cols-2"
          } grid-cols-1`}
        data-tour="lsa-content"
      >
        {summaryLoading || false ? (
          <>
            <MainMetricCardSkeleton bgColor="bg-white" />
            <MainMetricCardSkeleton bgColor="bg-white" />
            <MainMetricCardSkeleton bgColor="bg-white" />
            <div className="space-y-4">
              <SmallMetricCardSkeleton />
              <SmallMetricCardSkeleton />
            </div>
          </>
        ) : (
          <>
            <MainMetricCard
              title="Leads"
              backgroundImage="/assets/background.png"
              value={summaryData?.leads?.value}
              change={summaryChanges?.leads?.change_pct}
              loadingChanges={loadingSummaryChanges}
              bgColor="bg-lime-400"
              variant="lime"
            />
            <MainMetricCard
              title="Cases"
              value={summaryData?.deals?.value}
              change={summaryChanges?.deals?.change_pct}
              loadingChanges={loadingSummaryChanges}
              bgColor="bg-neutral-50"
            />
            <MainMetricCard
              title="Revenue"
              backgroundImage="/assets/lines.png"
              value={summaryData?.revenue?.value ? `${summaryData?.revenue?.value}` : "0"}
              change={summaryData?.revenue?.change_pct}
              loadingChanges={loadingSummaryChanges}
              symbol={CURRENCY_SYMBOL}
            />
            <div className="space-y-4">
              <SummaryCard
                value={summaryData?.ad_spend?.value}
                change={summaryChanges?.ad_spend?.change_pct}
                loadingChanges={loadingSummaryChanges}
                heading="Leads Spend"
                icon={CURRENCY_SYMBOL}
              />
              <SummaryCard
                value={summaryData?.roas?.value}
                change={summaryChanges?.roas?.change_pct}
                loadingChanges={loadingSummaryChanges}
                heading="ROAS"
                icon={CURRENCY_SYMBOL}
              />
            </div>
          </>
        )}
      </div>

      {/* monthly chart */}
      <div data-tour="lsa-stacked-chart">
        <BaseStackedChart
          data={monthlyData ?? []}
          loading={monthlyDataLoading}
        />
      </div>

      {/* company card + job‑type chart */}
      <div className="grid grid-cols-12 gap-4" data-tour="lsa-company-card">
        <div
          className={`col-span-12 ${sidebarOpen ? "md:col-span-12" : "md:col-span-7"
            } xl:col-span-7`}
        >
          <CompanyCard
            title="Locations"
            selectedConfigurationId={selectedConfigurationId}
            companyName={typeof data?.business_info === "object" && "business_name" in (data?.business_info ?? {}) ? (data?.business_info as any).business_name : ''}
            address={typeof data?.business_info === "object" && "location" in (data?.business_info ?? {}) ? (data?.business_info as any).location : ''}
            metrics={metrics}
            companies={companies}
            addresses={addresses}
            onCompanyChange={() => { }}
            onAddressChange={() => { }}
            isLoading={isDataLoading}
          />
        </div>

        <div
          className={`col-span-12 ${sidebarOpen ? "md:col-span-12" : "md:col-span-5"
            } flex justify-center md:justify-start xl:col-span-5`}
        >
          <KPIByJobTypeChart
            data={jobTypeData}
            loading={jobTypeLoading}
          />
        </div>
      </div>

      <div className="mt-4" >
        <LSAHeatMap
          data={heatmapData}
          loading={heatmapLoading}
        />
      </div>
    </div>
  );
}
