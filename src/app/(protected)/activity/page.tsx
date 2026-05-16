"use client";

import LineChart from "@/components/charts/LineChart";
import { NoDataPage } from "@/components/common/NoDataPage";
import { ContactsTable } from "@/components/contacts/ContactsTable";
import { DateSelector } from "@/components/home/DateSelector";
import PageHeader from "@/components/PageHeader";
import { Tabs } from "@/components/Tabs";
import { useInteractionStatus } from "@/services/activity.api";
import { useDateFilter } from "@/store/DateFilterContext";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { useMemo, useState } from "react";

type InteractionType = "call" | "form" | "chat" | "summary";

export default function Activity() {
  const [activeTab, setActiveTab] = useState<InteractionType>("summary");
  const { timeRange, setTimeRange } = useDateFilter();
  const { selectedCompany } = useSelectedCompanyStore();

  const { data: chartData, isLoading: chartLoading } = useInteractionStatus({
    dateRange: timeRange,
    activeTab,
    company_id: selectedCompany?.company?.id,
  });

  const isChartAllZero = useMemo(() => {
    if (!chartData?.datasets || chartData?.datasets?.length === 0) return true;

    return chartData?.datasets?.every((dataset: { data: number[] }) =>
      dataset.data.every((val) => val === 0)
    );
  }, [chartData]);

  const tabOptions = [
    { label: "Summary", value: "summary", isDisabled: chartLoading },
    { label: "Calls", value: "CALL", isDisabled: chartLoading },
    { label: "Forms", value: "FORM", isDisabled: chartLoading },
    { label: "Chats", value: "CHAT", isDisabled: chartLoading, },
  ];

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 sm:mb-2">
        <PageHeader
          title="Activity"
          description="View all activity"
          data-tour="activity-page-header"
        />
        <div className="ml-auto">
          {chartLoading ? (
            <div className="skeleton-gradient w-32 h-10 rounded-md" />
          ) : (
            <DateSelector
              selected={timeRange}
              onChange={setTimeRange}
            />
          )}
        </div>
      </div>

      <div data-tour="activity-tabs" className="w-fit">
        <Tabs
          className="mt-2"
          tabs={tabOptions}
          activeTab={activeTab}
          onTabChange={(v) => setActiveTab(v as InteractionType)}
        />
      </div>

      {!chartLoading && isChartAllZero ? (
        <NoDataPage
          heading={`You haven’t any ${activeTab === "summary" ? "calls, forms or chats" : `${activeTab.toLocaleLowerCase()}s`
            }`}
          subHeading={`Once you begin receiving ${activeTab === "summary" ? "calls, forms, or chats," : `${activeTab.toLowerCase()}s,`
            } the details will automatically appear here.`}
        />
      ) : (
        <div className="space-y-8">
          <div className="mt-4" data-tour="activity-chart">
            <LineChart
              loading={chartLoading}
              data={chartData}
            />
          </div>
          <ContactsTable
            timeRange={timeRange}
            activeTab={activeTab}
          />
        </div>
      )}
    </section>
  );
}
