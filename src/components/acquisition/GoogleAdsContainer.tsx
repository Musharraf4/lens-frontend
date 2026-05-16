"use client";

import { useEffect, useState } from "react";
import { DateSelector } from "@/components/home/DateSelector";
import RevenueChart from "@/components/charts/RevenueChart";
import CampaignPerformanceCharts from "@/components/charts/CampaignPerformanceCharts";
import { Tabs } from "@/components/Tabs";
import { Handshake } from "lucide-react";
import ImagesBarChart from "@/components/charts/ImagesBarChart";
import PerformanceHeatmapChart from "@/components/charts/PerformanceHeatmapChart";
import HorizontalHalfFunnelChart from "@/components/acquisition/HorizontalHalfFunnelChart";
import {
  useDashboardChangeOverview,
  useDashboardOverview,
  usegetCompetitorsValues,
  useHourOfDayPerformance,
} from "@/services/googleAds.api";
import CampaignsTable from "@/components/acquisition/CampaignsTable";
import CampaignRevenuePieChart from "@/components/charts/CampaignRevenuePieChart";
import NegativeKeywordsTable from "@/components/acquisition/NegativeKeywordsTable";
import DevicePerformanceChart from "@/components/acquisition/DevicePerformanceChart";
import MatchTypePerformancePieChart from "@/components/acquisition/MatchTypePerformancePieChart";
import NetworkPerformancePieChart from "@/components/acquisition/NetworkPerformancePieChart";
import { Skeleton } from "../ui/skeleton";
import { StatsCardSkeleton } from "../home/Skeleton";
import { TopCompetitorsTable } from "./TopCompetitorsTable";
import { fmt } from "@/services/activity.api";
import { RiHandHeartLine } from "react-icons/ri";
import { useDateFilter } from "@/store/DateFilterContext";

export default function GoogleAdsContainer({
  selectedConfigurationId,
}: {
  selectedConfigurationId: string | null;
}) {
  const { timeRange, setTimeRange } = useDateFilter();
  const [hasData, setHasData] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [metricsData, setMetricsData] = useState<
    Array<{
      name: string;
      value: number;
      change: number;
      changeValue: number;
      color: any;
    }>
  >([]);

  const { data: dashboardOverview, isLoading: isDashboardOverviewLoading } =
    useDashboardOverview(selectedConfigurationId ?? "", timeRange);
  const { data: heatMapData, isLoading: isLoadingHeatMap } =
    useHourOfDayPerformance(
      activeTab === "insights" ? selectedConfigurationId ?? "" : "",
      fmt(timeRange)
    );
  const { data: competitorsData, isLoading: isLoadingCompetitors } =
    usegetCompetitorsValues(
      activeTab === "competitors" ? selectedConfigurationId ?? "" : "",
      fmt(timeRange)
    );
  const combinedCustomerDashboardOverview = dashboardOverview?.results?.[0];
  const combinedCompetitorsOverview = competitorsData?.results?.[0]?.insights;
  const dashboardKeys = [
    "ad_spend", "revenue", "deals", "leads", "roas", "conversion_rate_deal", 'conversion_rate_lead', "cpa_lead", "cpa_deal", "cpc", "ctr", "impressions", "clicks"
  ] as const;

  type DashboardKey = typeof dashboardKeys[number];

  const result = dashboardKeys
    .map((key) => `${key}=${(combinedCustomerDashboardOverview?.overview?.[key as DashboardKey]?.value ?? "")}`)
    .join('&');

  const { data: dashboardChangeOverview, isLoading: isDashboardChangeOverviewLoading } =
    useDashboardChangeOverview(dashboardOverview && !isDashboardOverviewLoading ? selectedConfigurationId ?? "" : '', timeRange, `${result}&customer_id=${combinedCustomerDashboardOverview?.customer_id}`);
  const tabOptions = [
    { label: "Overview", value: "overview" },
    { label: "Insights", value: "insights" },
    { label: "Competitors", value: "competitors" },
    { label: "Projection", value: "projection", isDisabled: true },
  ];

  // Simulate data loading with 2 second delay
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [hasData]);

  const showTrend = (value?: number | null) => {
    if (!value) return "neutral";
    return value > 0 ? "up" : "down";
  };

  // Initialize metrics with patterns on the client side only
  useEffect(() => {
    // Dynamic import to avoid SSR issues
    const initializeMetrics = async () => {
      // Only import and use patternomaly on the client side
      const patternomaly = await import("patternomaly");

      setMetricsData([
        {
          name: "Impressions",
          value:
            combinedCustomerDashboardOverview?.overview.impressions.value || 0,
          change:
            dashboardChangeOverview?.analytics.impressions
              .change_pct || 0,
          changeValue:
            ((combinedCustomerDashboardOverview?.overview.impressions.value ||
              0) *
              (dashboardChangeOverview?.analytics.impressions
                .change_pct || 0)) / 100,
          color: patternomaly.draw(
            "diagonal-right-left",
            "#ffffff",
            "#E6E9EE",
            8
          ),
        },
        {
          name: "Clicks",
          value: combinedCustomerDashboardOverview?.overview.clicks.value || 0,
          change:
            dashboardChangeOverview?.analytics.clicks.change_pct || 0,
          changeValue:
            ((combinedCustomerDashboardOverview?.overview.clicks.value || 0) *
              (dashboardChangeOverview?.analytics.clicks.change_pct ||
                0)) / 100,
          color: "#B7CBFF",
        },
        {
          name: "Leads",
          value: combinedCustomerDashboardOverview?.overview.leads.value || 0,
          change:
            dashboardChangeOverview?.analytics.leads.change_pct || 0,
          changeValue:
            ((combinedCustomerDashboardOverview?.overview.leads.value || 0) *
              (dashboardChangeOverview?.analytics.leads.change_pct || 0)) / 100,
          color: "#4678FB",
        },
        {
          name: "Cases",
          value: combinedCustomerDashboardOverview?.overview.deals.value || 0,
          change:
            dashboardChangeOverview?.analytics.deals.change_pct || 0,
          changeValue:
            ((combinedCustomerDashboardOverview?.overview.deals.value || 0) *
              (dashboardChangeOverview?.analytics.leads.change_pct || 0)) / 100,
          color: "#2C54BB",
        },
      ]);
    };

    initializeMetrics();
  }, [dashboardOverview, dashboardChangeOverview]);
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-0">
        <div className="w-fit overflow-x-auto" data-tour="google-ads-tabs">
          <Tabs
            tabs={tabOptions}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="mb-6"
          />
        </div>

        <div className="flex justify-end w-full sm:w-auto mb-6" data-tour="google-ads-date-selector">
          <DateSelector selected={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      {activeTab === "overview" && (
        <div data-tour="google-ads-overview-content">
          {isDashboardOverviewLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" data-tour="google-ads-top-4-cards">
              <RevenueChart
                title="Ad Spend"
                lineGradientStart="#B7CBFF"
                // hideSearchIcon={true}
                showRevenue={true}
                lineGradientMid="#2C54BB"
                lineGradientEnd="#B7CBFF"
                fillGradient="rgba(59, 130, 246, 0.2)"
                trendUpColor="#0CD074"
                trendDownColor="#ef4444"
                isDashboardChangeOverviewLoading={isDashboardChangeOverviewLoading}
                totalRevenue={{
                  amount:
                    combinedCustomerDashboardOverview?.overview?.ad_spend
                      ?.value || 0,
                  change:
                    dashboardChangeOverview?.analytics?.ad_spend
                      ?.change_pct || 0,
                  trend: showTrend(
                    dashboardChangeOverview?.analytics?.ad_spend
                      .change_pct
                  ),
                }}
                data={
                  dashboardChangeOverview?.analytics?.ad_spend
                    ?.series10 || []
                }
                helpTooltip='Ad spend'
              />
              <RevenueChart
                title="Revenue"
                // icons={[
                //   {
                //     id: "network",
                //     icon: Megaphone,
                //     activeControl: "network",
                //   },
                //   {
                //     id: "devices",
                //     icon: MonitorSmartphone,
                //     activeControl: "devices",
                //   },
                // ]}
                lineGradientStart="#D3FA63"
                lineGradientMid="#719801"
                lineGradientEnd="#D3FA63"
                fillGradient="rgba(59, 130, 246, 0.2)"
                trendUpColor="#0CD074"
                trendDownColor="#ef4444"
                isDashboardChangeOverviewLoading={isDashboardChangeOverviewLoading}
                totalRevenue={{
                  amount:
                    combinedCustomerDashboardOverview?.overview?.revenue
                      ?.value || 0,
                  change:
                    dashboardChangeOverview?.analytics?.revenue
                      ?.change_pct || 0,
                  trend: showTrend(
                    dashboardChangeOverview?.analytics?.revenue?.change_pct
                  ),
                }}
                data={
                  dashboardChangeOverview?.analytics?.revenue
                    ?.series10 || []
                }
                helpTooltip='Revenue'
              />
              <RevenueChart
                title="Cases"
                // icons={[
                //   {
                //     id: "network",
                //     icon: Megaphone,
                //     activeControl: "network",
                //   },
                //   {
                //     id: "devices",
                //     icon: MonitorSmartphone,
                //     activeControl: "devices",
                //   },
                // ]}
                lineGradientStart="#C9BFFD"
                isDashboardChangeOverviewLoading={isDashboardChangeOverviewLoading}
                // hideSearchIcon={true}
                lineGradientMid="#866FFA"
                lineGradientEnd="#C9BFFD"
                fillGradient="rgba(59, 130, 246, 0.2)"
                trendUpColor="#0CD074"
                trendDownColor="#ef4444"
                totalRevenue={{
                  amount:
                    combinedCustomerDashboardOverview?.overview?.deals?.value ||
                    0,
                  change:
                    dashboardChangeOverview?.analytics?.deals
                      ?.change_pct || 0,
                  trend: showTrend(
                    dashboardChangeOverview?.analytics?.deals?.change_pct
                  ),
                }}
                data={
                  dashboardChangeOverview?.analytics?.deals
                    ?.series10 || []
                }
                helpTooltip='Cases'
              />
              <RevenueChart
                title='ROAS'
                helpTooltip='Return on Ad Spend (ROAS) measures the revenue generated for every dollar spent on advertising.'
                lineGradientStart="#FFDE7A"
                showRevenue={true}
                isDashboardChangeOverviewLoading={isDashboardChangeOverviewLoading}
                lineGradientMid="#CE9400"
                // hideSearchIcon={true}
                lineGradientEnd="#FFDE7A"
                fillGradient="rgba(59, 130, 246, 0.2)"
                trendUpColor="#0CD074"
                trendDownColor="#ef4444"
                totalRevenue={{
                  amount:
                    combinedCustomerDashboardOverview?.overview?.roas?.value ||
                    0,
                  change:
                    dashboardChangeOverview?.analytics?.roas
                      ?.change_pct || 0,
                  trend: showTrend(
                    dashboardChangeOverview?.analytics?.roas?.change_pct
                  ),
                }}
                data={
                  dashboardChangeOverview?.analytics?.roas?.series10 ||
                  []
                }
              />
            </div>
          )}

          <div className="mt-4 bg-white rounded-xl">
            {isDashboardOverviewLoading && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-6 w-20 mb-1" />
                    <Skeleton className="h-4 w-12" />
                  </>
                ))}
              </div>
            )}
            <div data-tour="google-ads-chart">
              <HorizontalHalfFunnelChart
                title="Marketing Funnel"
                metrics={isDashboardOverviewLoading ? [] : metricsData}
                loading={isDashboardOverviewLoading}
                configId={selectedConfigurationId ?? ""}
                date_range={timeRange}
                isDashboardChangeOverviewLoading={isDashboardChangeOverviewLoading}
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3 sm:gap-4" data-tour="google-ads-revenue-by-campaign">
              <CampaignRevenuePieChart
                configId={selectedConfigurationId ?? ""}
                dateRange={timeRange}
                width={250}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4" data-tour="google-ads-other-4-charts">
              {isDashboardOverviewLoading ? (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                  </div>
                </>
              ) : (
                <>
                  <RevenueChart
                    title="Conv. Rate"
                    // hideSearchIcon={true}
                    icons={[
                      {
                        id: "network",
                        icon: RiHandHeartLine,
                        activeControl: "network",
                        text: "Leads",
                      },
                      {
                        id: "devices",
                        icon: Handshake,
                        activeControl: "devices",
                        text: "Cases",
                      },
                    ]}
                    showRevenue={true}
                    lineGradientStart="#D3FA63"
                    lineGradientMid="#719801"
                    lineGradientEnd="#D3FA63"
                    fillGradient="rgba(59, 130, 246, 0.2)"
                    trendUpColor="#0CD074"
                    trendDownColor="#ef4444"
                    isDashboardChangeOverviewLoading={isDashboardChangeOverviewLoading}
                    totalRevenue={{
                      amount:
                        combinedCustomerDashboardOverview?.overview
                          ?.conversion_rate_lead?.value || 0,
                      change:
                        dashboardChangeOverview?.analytics
                          ?.conversion_rate_lead?.change_pct || 0,
                      otherChange:
                        dashboardChangeOverview?.analytics
                          ?.conversion_rate_deals?.change_pct || 0,
                      otherAmount: combinedCustomerDashboardOverview?.overview?.conversion_rate_deals?.value || 0,
                      otherData: dashboardChangeOverview?.analytics?.conversion_rate_deal
                        ?.series10 || [],
                      trend: showTrend(
                        dashboardChangeOverview?.analytics
                          ?.conversion_rate_lead?.change_pct
                      ),
                    }}
                    data={
                      dashboardChangeOverview?.analytics
                        ?.conversion_rate_lead?.series10 || []
                    }
                    helpTooltip="Conv. Rate"

                  />
                  <RevenueChart
                    title="CPA"
                    icons={[
                      {
                        id: "network",
                        icon: RiHandHeartLine,
                        activeControl: "network",
                        text: "Leads",
                      },
                      {
                        id: "devices",
                        icon: Handshake,
                        activeControl: "devices",
                        text: "Cases",
                      },
                    ]}
                    isDashboardChangeOverviewLoading={isDashboardChangeOverviewLoading}
                    lineGradientStart="#D3FA63"
                    // hideSearchIcon={true}
                    showRevenue={true}

                    lineGradientMid="#719801"
                    lineGradientEnd="#D3FA63"
                    fillGradient="rgba(59, 130, 246, 0.2)"
                    trendUpColor="#0CD074"
                    trendDownColor="#ef4444"
                    helpTooltip="Cost per action is the overall cost incurred to get your users to take the necessary actions."
                    totalRevenue={{
                      amount:
                        combinedCustomerDashboardOverview?.overview?.cpa_lead
                          ?.value || 0,
                      change:
                        dashboardChangeOverview?.analytics?.cpa_leads
                          ?.change_pct || 0,
                      otherChange:
                        dashboardChangeOverview?.analytics?.cpa_deals
                          ?.change_pct || 0,
                      otherAmount: combinedCustomerDashboardOverview?.overview.cpa_deals?.change_pct || 0,
                      otherData: dashboardChangeOverview?.analytics?.cpa_deals
                        ?.series10 || [],
                      trend: showTrend(
                        dashboardChangeOverview?.analytics?.conversion_rate_lead?.change_pct
                      ),
                    }}
                    data={
                      dashboardChangeOverview?.analytics?.cpa_leads
                        ?.series10 || []
                    }
                  />
                  <RevenueChart
                    title="CPC"
                    // hideSearchIcon={true}
                    showRevenue={true}

                    lineGradientStart="rgba(175, 61, 184, 0.2)"
                    lineGradientMid="rgba(175, 61, 184, 1)"
                    lineGradientEnd="rgba(175, 61, 184, 0.2)"
                    fillGradient="rgba(59, 130, 246, 0.2)"
                    trendUpColor="#0CD074"
                    trendDownColor="#ef4444"
                    isDashboardChangeOverviewLoading={isDashboardChangeOverviewLoading}
                    totalRevenue={{
                      amount:
                        combinedCustomerDashboardOverview?.overview.cpc
                          ?.value || 0,
                      change:
                        dashboardChangeOverview?.analytics.cpc
                          ?.change_pct || 0,
                      trend: showTrend(
                        dashboardChangeOverview?.analytics.cpc?.change_pct
                      ),
                    }}
                    helpTooltip="Cost per click measures the cost of each click on your campaign."
                    data={
                      dashboardChangeOverview?.analytics?.cpc
                        ?.series10 || []
                    }
                  />
                  <RevenueChart
                    title="CTR"
                    // hideSearchIcon={true}
                    showRevenue={true}

                    lineGradientStart="rgba(96, 77, 194, 0.2)"
                    lineGradientMid="rgba(96, 77, 194, 1)"
                    lineGradientEnd="rgba(96, 77, 194, 0.2)"
                    fillGradient="rgba(59, 130, 246, 0.2)"
                    trendUpColor="#0CD074"
                    trendDownColor="#ef4444"
                    isDashboardChangeOverviewLoading={isDashboardChangeOverviewLoading}
                    totalRevenue={{
                      amount:
                        combinedCustomerDashboardOverview?.overview?.ctr
                          ?.value || 0,
                      change:
                        dashboardChangeOverview?.analytics?.ctr
                          ?.change_pct || 0,
                      trend: showTrend(
                        dashboardChangeOverview?.analytics?.ctr?.change_pct
                      ),
                    }}
                    helpTooltip="Click-Trough rate hows the number of people who clicked on your campaign after seeing it."
                    data={
                      dashboardChangeOverview?.analytics?.ctr
                        ?.series10 || []
                    }
                  />
                </>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4" >
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-4 col-span-1 sm:col-span-1 md:col-span-1 xl:col-span-2" data-tour="google-ads-top-performing-charts">
              <CampaignPerformanceCharts
                viewKey="campaigns"
                configId={selectedConfigurationId ?? ""}
                date_range={timeRange}
              />
              <CampaignPerformanceCharts
                viewKey="zipcodes"
                configId={selectedConfigurationId ?? ""}
                date_range={timeRange}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-4 col-span-1 sm:col-span-1 md:col-span-1 xl:col-span-2" data-tour="google-ads-top-keywords-charts">
              <CampaignPerformanceCharts
                viewKey="topKeywords"
                configId={selectedConfigurationId ?? ""}
                date_range={timeRange}
              />
              <CampaignPerformanceCharts
                viewKey="lowestKeywords"
                configId={selectedConfigurationId ?? ""}
                date_range={timeRange}
              />
            </div>
          </div>

          <div className="mt-4" data-tour="google-ads-campaigns-table">
            <CampaignsTable
              configId={selectedConfigurationId ?? ""}
              date_range={timeRange}
            />
          </div>
        </div>
      )}

      {activeTab === "insights" && (
        <div data-tour="google-ads-insights-content">
          {/* Performance Heatmap - Full width */}
          <div className="mt-4 w-full">
            <PerformanceHeatmapChart
              data={
                !isLoadingHeatMap && heatMapData
                  ? heatMapData?.results?.[0]?.hours
                  : []
              }
              isGAdPage
              loading={isLoadingHeatMap}
            />
          </div>

          {/* First row of charts */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MatchTypePerformancePieChart
              configId={selectedConfigurationId ?? ""}
              width={250}
              date_range={fmt(timeRange)}
            />
            <ImagesBarChart
              configId={selectedConfigurationId ?? ""}
              date_range={fmt(timeRange)}
            />
          </div>

          {/* Campaign Performance Charts */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            <CampaignPerformanceCharts
              viewKey="regions"
              configId={selectedConfigurationId ?? ""}
              date_range={timeRange}
              isInsight
            />
            <CampaignPerformanceCharts
              viewKey="zipPerformance"
              configId={selectedConfigurationId ?? ""}
              date_range={timeRange}
              isInsight
            />
            <CampaignPerformanceCharts
              viewKey="extensions"
              configId={selectedConfigurationId ?? ""}
              date_range={timeRange}
              isInsight
            />
            <CampaignPerformanceCharts
              viewKey="callouts"
              configId={selectedConfigurationId ?? ""}
              date_range={timeRange}
              isInsight
            />
          </div>

          {/* Bottom row charts */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DevicePerformanceChart
              configId={selectedConfigurationId ?? ""}
              date_range={fmt(timeRange)}
            />
            <NetworkPerformancePieChart
              configId={selectedConfigurationId ?? ""}
              date_range={fmt(timeRange)}
              width={250}
            />
          </div>

          {/* Negative Keywords Table */}
          <div className="mt-4" data-tour="google-ads-negative-keywords-table">
            <NegativeKeywordsTable
              configId={selectedConfigurationId ?? ""}
              date_range={fmt(timeRange)}
            />
          </div>
        </div>
      )}

      {activeTab === "competitors" && (
        <div data-tour="google-ads-competitors-content">
          {isLoadingCompetitors ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <RevenueChart
                title="Your impression share"
                lineGradientStart="#B7CBFF"
                showRevenue={true}
                lineGradientMid="#2C54BB"
                lineGradientEnd="#B7CBFF"
                fillGradient="rgba(59, 130, 246, 0.2)"
                trendUpColor="#0CD074"
                trendDownColor="#ef4444"
                totalRevenue={{
                  amount:
                    combinedCompetitorsOverview?.impression_share.value || 0,
                  change:
                    combinedCompetitorsOverview?.impression_share.change_pct ||
                    0,
                  trend: showTrend(
                    combinedCompetitorsOverview?.impression_share.change_pct ||
                    0
                  ),
                }}
                data={
                  combinedCompetitorsOverview?.impression_share.series10 || []
                }
              />
              <RevenueChart
                title="Your top of page rate"
                showRevenue={true}
                lineGradientStart="#D3FA63"
                lineGradientMid="#719801"
                lineGradientEnd="#D3FA63"
                fillGradient="rgba(59, 130, 246, 0.2)"
                trendUpColor="#0CD074"
                trendDownColor="#ef4444"
                totalRevenue={{
                  amount:
                    combinedCompetitorsOverview?.abs_top_of_page_rate.value ||
                    0,
                  change:
                    combinedCompetitorsOverview?.abs_top_of_page_rate
                      .change_pct || 0,
                  trend: showTrend(
                    combinedCompetitorsOverview?.abs_top_of_page_rate
                      .change_pct || 0
                  ),
                }}
                data={
                  combinedCompetitorsOverview?.abs_top_of_page_rate.series10 ||
                  []
                }
              />
              <RevenueChart
                title="Your absolute top of page rate"
                showRevenue={true}
                lineGradientStart="#C9BFFD"
                lineGradientMid="#866FFA"
                lineGradientEnd="#C9BFFD"
                fillGradient="rgba(59, 130, 246, 0.2)"
                trendUpColor="#0CD074"
                trendDownColor="#ef4444"
                totalRevenue={{
                  amount:
                    combinedCompetitorsOverview?.top_of_page_rate.value || 0,
                  change:
                    combinedCompetitorsOverview?.top_of_page_rate.change_pct ||
                    0,
                  trend: showTrend(
                    combinedCompetitorsOverview?.top_of_page_rate.change_pct ||
                    0
                  ),
                }}
                data={
                  combinedCompetitorsOverview?.top_of_page_rate.series10 || []
                }
              />

              {/* Top Competitors Table */}
            </div>
          )}
          <div className="mt-4" data-tour="google-ads-competitors-table">
            <TopCompetitorsTable
              configId={selectedConfigurationId ?? ""}
              date_range={fmt(timeRange)}
            />
          </div>
        </div>
      )}

      {activeTab === "projection" && (
        <div data-tour="google-ads-projection-content">
          <div>Projection Models</div>
        </div>
      )}
    </>
  );
}
