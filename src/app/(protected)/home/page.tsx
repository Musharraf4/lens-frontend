"use client";

import ChannelsChart from "@/components/charts/ChannelsChart";
import ConversionRateChart from "@/components/charts/ConversionRateChart";
import { SummaryCard } from "@/components/common/SummaryCard";
import { ChannelTable } from "@/components/home/ChannelTable";
import { CPACard } from "@/components/home/CPACard";
import { DateSelector } from "@/components/home/DateSelector";
import { MainMetricCard } from "@/components/home/MainMetricCard";
import {
  CPACardSkeleton,
  MainMetricCardSkeleton,
  MarketingInsightCardSkeleton,
  SkeletonBarChart,
  SkeletonHorizontalBarChart,
  SmallMetricCardSkeleton,
} from "@/components/home/Skeleton";
import StackedChart from "@/components/home/StackedChart";
import {
  fmt,
  useChannelRevenue,
  useChannelSales,
  useChannelsList,
  useDealsConversions,
  useGeAnalyticsChange,
  useGetTopPerformer,
  useLeadsConversions,
  useMonthlyPerformance,
  useReportOverview,
} from "@/services/home.api";
import { useIntegrationConfigs } from "@/services/integrationsConfig.api";
import { useApp } from "@/store/appStore";
import { useAuth } from "@/store/AuthContext";
import { useEffect, useRef, useState } from "react";
import { EmptyState } from "./EmptyState";
import { useRouter, useSearchParams } from "next/navigation";
import { showToast } from "@/components/Toast";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { CURRENCY_SYMBOL } from "@/constants";
import { formatCompactNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useDateFilter } from "@/store/DateFilterContext";

export default function Home() {
  const { sidebarOpen } = useApp();
  const { user } = useAuth();
  const { selectedCompany } = useSelectedCompanyStore();
  const searchParams = useSearchParams();
  const cpToastShownRef = useRef(false);
  const router = useRouter();

  const { data: IntegrationConfig, isLoading: isIntegrationConfigLoading } =
    useIntegrationConfigs(selectedCompany?.company?.id);
  const { timeRange, setTimeRange } = useDateFilter();
  const [cpaToggle, setCpaToggle] = useState("Leads");
  const [selectedChartType, setSelectedChartType] = useState("monthly");
  const [conversionToggle, setConversionToggle] = useState("Lead to Case");
  const [selectedChannelToggle, setSelectedChannelToggle] = useState("Revenue");

  const selectedUser = IntegrationConfig?.filter(item => item.user_email === user?.email)
  const googleAdsConfigs = IntegrationConfig?.filter(
    ({ integration_name, is_active }) => integration_name === "google_ads" && is_active
  );
  const gAdsConfigurations = googleAdsConfigs?.length === 1 ? googleAdsConfigs[0] : IntegrationConfig?.find(
    ({ integration_name, is_active, is_selected }) => integration_name === "google_ads" && is_active && is_selected
  );
  const lsaConfigurations = IntegrationConfig?.find(
    (config) => config.integration_name === "google_lsa" && config.is_active
  );

  const { data: overview, isLoading: overviewLoading } = useReportOverview(
    fmt(timeRange),
    !isIntegrationConfigLoading,
    selectedCompany?.company?.id ?? '',
    gAdsConfigurations?.id ?? '',
    lsaConfigurations?.id ?? '',
  );
  const channelParams = {
    date_range: fmt(timeRange),
    company_id: selectedCompany?.company?.id ?? '',
    google_ads_config_id: gAdsConfigurations?.id ?? '',
    lsa_config_id: lsaConfigurations?.id ?? '',
  };

  const { data: channels, isLoading: channelsLoading } =
    useChannelsList(channelParams, Boolean(overview));
  const dashboardKeys = [
    "revenue", "deals", "cpa_leads", "cpa_deals", "spend", "traffic", 'roas'
  ] as const;

  // const { data: topPerformer, isLoading: topPerformerLoading } = useGetTopPerformer(
  //   fmt(timeRange),
  //   selectedCompany?.company?.id ?? '',
  // )
  type DashboardKey = typeof dashboardKeys[number];

  const transformed: Record<DashboardKey, string | number | undefined> = {
    revenue: overview?.revenue.value,
    deals: overview?.deals.value,
    cpa_leads: overview?.cpa.cpa_leads.value,
    cpa_deals: overview?.cpa.cpa_deals.value,
    spend: overview?.spend.value,
    traffic: overview?.traffic.value,
    roas: overview?.roas.value,
  };

  const result = dashboardKeys
    .map((key) => `${key}=${transformed[key] ?? ""}`)
    .join("&");

  const { data: changePct, isLoading: changePctLoading } = useGeAnalyticsChange(
    fmt(timeRange),
    selectedCompany?.company?.id ?? '',
    Boolean(overview),
    gAdsConfigurations?.id ?? '',
    lsaConfigurations?.id ?? '',
    result
  )
  const { data: convRate, isLoading: convLoading } = useLeadsConversions(
    fmt(timeRange),
    selectedCompany?.company?.id ?? '',
    gAdsConfigurations?.id ?? '',
    lsaConfigurations?.id ?? '',
  );
  const { data: convDealRate, isLoading: convDealLoading } =
    useDealsConversions(fmt(timeRange), selectedCompany?.company?.id ?? '');
  const { data: monthly, isLoading: monthlyLoading } = useMonthlyPerformance(fmt(timeRange), selectedCompany?.company?.id ?? '', selectedChartType);
  const { data: channelRevenueData, isLoading: channelRevenueLoading } =
    useChannelRevenue(fmt(timeRange), selectedCompany?.company?.id ?? '');
  const { data: channelSalesData, isLoading: channelSalesLoading } =
    useChannelSales(fmt(timeRange), selectedCompany?.company?.id ?? '');

  const allowedNames = ["google_ads", "google_lsa", "google_business"];
  const filteredConfigurations = IntegrationConfig?.filter((config) =>
    allowedNames.includes(config.integration_name)
  );
  const hasActiveGoogleIntegration =
    filteredConfigurations &&
    filteredConfigurations.length > 0 &&
    filteredConfigurations.some((config) => config.is_active === true);

  const showEmptyState =
    !isIntegrationConfigLoading && !hasActiveGoogleIntegration;

  // Show warning toast if redirected from /create-password while authenticated
  useEffect(() => {
    const cpWarn = searchParams.get("cp_warn");
    if (cpWarn && !cpToastShownRef.current && user?.email) {
      cpToastShownRef.current = true;
      showToast({
        title: "Already logged in",
        description: `You are currently logged in as ${user.email}. Please log out to create a new account.`,
        type: "warning",
      });
      // Remove cp_warn from URL after showing the toast
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("cp_warn");
        const queryString = url.searchParams.toString();
        router.replace(queryString ? `${url.pathname}?${queryString}` : url.pathname);
      } catch { }
    }
  }, [searchParams, user?.email]);

  useEffect(() => {
    if (overview?.currency) {
      localStorage.setItem('currency', overview?.currency)
    } else {
      localStorage.setItem('currency', 'USD')
    }
  }, [overview, selectedCompany, overviewLoading])
  return (
    <div className="bg-gray-50 min-h-screen space-y-4 w-full">
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black">
            Welcome, {user?.first_name}
          </h1>
          {/* {!showEmptyState && ( */}
          <div className="ml-auto">
            <DateSelector selected={timeRange} onChange={setTimeRange} disabled={showEmptyState} />
          </div>
          {/* )} */}
        </div>
        {/* <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Let's check main metrics
        </p> */}
      </div>

      {/* Main Content */}
      {showEmptyState ? (
        <EmptyState />
      ) : (
        <>
          {/* Marketing Insights */}
          {/* {(overviewLoading || topPerformerLoading || !overview) ? (
            <div className="bg-white rounded-lg shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4">
              <MarketingInsightCardSkeleton />
              <MarketingInsightCardSkeleton />
              <MarketingInsightCardSkeleton />
            </div>
          ) : (
            <div
              data-tour="marketing-insights"
              className={`bg-white rounded-3xl grid grid-cols-1 sm:grid-cols-2 ${sidebarOpen ? "md:grid-cols-1" : "md:grid-cols-2"
                } lg:grid-cols-3 gap-4 p-4`}
            >
              <div className="space-y-2 lg:border-r">
                <p className="text-neutral-500">Your Marketing Pulse:</p>
                <p className="font-semibold text-black">
                  <span className={(!overview?.revenue?.value || (Number(overview?.revenue?.value) == 0)) ? 'text-gray-400' : Number(overview?.revenue?.value) > 0 ? `text-success-400` : 'text-error-400'}>
                    {CURRENCY_SYMBOL}{formatCompactNumber(overview?.revenue?.value)}
                  </span>{" "}
                  revenue {timeRange.toLowerCase()} with a{" "}
                  <span className={(!overview?.roas?.value || (Number(overview?.roas?.value) == 0)) ? 'text-gray-400' : Number(overview?.roas?.value) > 0 ? `text-success-400` : 'text-error-400'}>
                    {formatCompactNumber(overview?.roas?.value)}x
                  </span>{" "}
                  ROAS across channels
                </p>
              </div>

              <div className="space-y-2 lg:border-r">
                <p className="text-neutral-500">Top performer:</p>
                <p className="font-semibold text-black">
                  {topPerformer?.data?.channel} (<span className="text-success-400">{topPerformer?.data?.revenue}%</span> from {timeRange.toLowerCase()})
                </p>
              </div>

              <div className="space-y-2 disabled-div">
                <p className="text-neutral-500">Notice:</p>
                <p className="font-semibold text-black">
                  <span className="text-warning-400">3</span> high-value leads
                  require attention in your CRM
                </p>
              </div>
            </div>
          )} */}

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4">
            {/* Left */}
            <div
              data-tour="main-metrics"
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${sidebarOpen ? "lg:col-span-4" : "lg:col-span-2"
                } xl:col-span-2 col-span-4`}
            >
              {(overviewLoading || !overview) ? (
                <>
                  <MainMetricCardSkeleton bgColor="bg-white" />
                  <MainMetricCardSkeleton bgColor="bg-white" />
                </>
              ) : (
                <>
                  <MainMetricCard
                    title="Revenue"
                    backgroundImage="/assets/background.png"
                    value={overview?.revenue?.value}
                    change={changePct?.data?.revenue?.change_percentage}
                    bgColor="bg-lime-400"
                    variant="lime"
                    symbol={CURRENCY_SYMBOL}
                    loadingChanges={changePctLoading}
                    tooltipText='Reveue accross the lenz'
                    tooltipClass='text-neutral-500'
                  />
                  <MainMetricCard
                    title="Cases"
                    value={overview?.deals?.value}
                    change={changePct?.data?.deals?.change_percentage}
                    bgColor="bg-neutral-50"
                    loadingChanges={changePctLoading}
                    tooltipText='Cases across the lenz'
                  />
                </>
              )}
            </div>

            {/* Right */}
            <div
              data-tour="secondary-metrics"
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${sidebarOpen ? "lg:col-span-4" : "lg:col-span-2"
                } xl:col-span-2 col-span-4`}
            >
              {(overviewLoading || !overview) ? (
                <>
                  <CPACardSkeleton />
                  <SmallMetricCardSkeleton />
                  <SmallMetricCardSkeleton />
                  <SmallMetricCardSkeleton />
                </>
              ) : (
                <>
                  <CPACard
                    selectedOption={cpaToggle}
                    onOptionChange={setCpaToggle}
                    value={
                      cpaToggle === "Leads"
                        ? (overview?.cpa?.cpa_leads?.value || '')
                        : (overview?.cpa?.cpa_deals?.value || '')
                    }
                    change={
                      cpaToggle === "Leads"
                        ? String(changePct?.data?.cpa_leads?.change_percentage)
                        : String(changePct?.data?.cpa_deals?.change_percentage)
                    }
                    loadingChanges={changePctLoading}
                  />
                  <SummaryCard
                    value={overview?.spend?.value}
                    change={changePct?.data?.spend?.change_percentage}
                    heading="Spend"
                    loadingChanges={changePctLoading}
                    icon={CURRENCY_SYMBOL}
                    tooltipText="Spend accross the lenz"
                  />
                  <SummaryCard
                    value={overview?.traffic?.value}
                    change={changePct?.data?.traffic?.change_percentage}
                    loadingChanges={changePctLoading}
                    heading="Traffic"
                    tooltipText="Traffic accross the lenz"
                  />
                  <SummaryCard
                    value={overview?.roas?.value}
                    change={changePct?.data?.roas?.change_percentage}
                    loadingChanges={changePctLoading}
                    heading="ROAS"
                    tooltipText="Return on Ad Spend (ROAS) measures the revenue generated for every dollar spent on advertising."
                  />
                </>
              )}
            </div>
          </div>

          {/* Charts */}
          {/* Chart 1: Monthly Performance */}
          <div data-tour="monthly-performance-chart">
            {monthlyLoading ? (
              <div className="bg-white rounded-3xl w-full p-4 sm:p-6 overflow-auto">
                <div className="flex gap-2 mb-5">
                  <Skeleton className="h-12 w-20 rounded" />
                  <Skeleton className="h-12 w-20 rounded" />
                  <Skeleton className="h-12 w-20 rounded" />
                  <Skeleton className="h-12 w-20 rounded" />
                </div>
                <SkeletonBarChart />
              </div>
            ) : (
              <StackedChart data={monthly ?? []} loading={monthlyLoading} isHomePage setSelectedChartType={setSelectedChartType} selectedChartType={selectedChartType} />
            )}
          </div>

          {/* Chart 2 & 3: Channels & Conversion Rate */}
          <div
            className={`grid grid-cols-1 ${sidebarOpen ? "lg:grid-cols-1" : "lg:grid-cols-2"
              } gap-4 xl:grid-cols-2`}
          >
            {(channelRevenueLoading || channelSalesLoading) ? (
              <div className="bg-white rounded-3xl w-full p-4 sm:p-6 overflow-auto">
                <div className="flex gap-2 mb-5">
                  <Skeleton className="h-12 w-20 rounded" />
                </div>
                <div>
                  <SkeletonHorizontalBarChart size={5} />
                </div>
              </div>
            ) : (
              <ChannelsChart
                data={
                  selectedChannelToggle === "Revenue"
                    ? channelRevenueData?.items?.map((item) => {
                      return {
                        channel: item.channel,
                        sales: item.revenue,
                      };
                    }) ?? []
                    : channelSalesData?.items ?? []
                }
                setSelectedChannelToggle={setSelectedChannelToggle}
                selectedChannelToggle={selectedChannelToggle}
                maxValue={
                  selectedChannelToggle === "Revenue"
                    ? Math.max(
                      ...(channelRevenueData?.items?.map((item) => item.revenue) ??
                        [0])
                    )
                    : Math.max(
                      ...(channelSalesData?.items?.map((item) => item.sales) ??
                        [0])
                    )
                }
                tooltipText='Revenue channels'
              />
            )}

            {(convLoading || convDealLoading) ? (
              <div className="bg-white rounded-3xl w-full p-4 sm:p-6 overflow-auto">
                <div className="flex gap-2 mb-5">
                  <Skeleton className="h-12 w-20 rounded" />
                </div>
                <div>
                  <SkeletonBarChart />
                </div>
              </div>
            ) : (
              <ConversionRateChart
                data={
                  conversionToggle === "Lead to Case"
                    ? convRate ?? { months: [], rates: [] }
                    : convDealRate ?? { months: [], rates: [] }
                }
                loading={(convLoading || convDealLoading)}
                selectedOption={conversionToggle}
                setSelectedOption={setConversionToggle}
                tooltipText='Leads to Case conversion'
              />
            )}
          </div>

          <div data-tour="channel-table">
            <ChannelTable data={channels?.items ?? []} channelsLoading={channelsLoading} />
          </div>
        </>
      )}
    </div>
  );
}
