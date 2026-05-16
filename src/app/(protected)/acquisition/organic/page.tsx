"use client";

import { SummaryCard } from "@/components/common/SummaryCard";
import { DateSelector } from "@/components/home/DateSelector";
import { MainMetricCard } from "@/components/home/MainMetricCard";
import {
  MainMetricCardSkeleton,
  SmallMetricCardSkeleton,
} from "@/components/home/Skeleton";
import PageHeader from "@/components/PageHeader";
import {
  useOrganicReportOverview,
  useUpdateOrganicSpend,
} from "@/services/organic.api";
import { useApp } from "@/store/appStore";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { useEffect, useMemo, useState } from "react";
import { LandingPages } from "./LandingPages";
import { NoDataPage } from "@/components/common/NoDataPage";
import { fmt, formatNumber } from "@/lib/utils";
import { CURRENCY_SYMBOL } from "@/constants";
import { useDateFilter } from "@/store/DateFilterContext";
import { EditSpendModal } from "@/components/acquisition/EditSpendModal";
import { showToast } from "@/components/Toast";

export default function OrganicAcquisitionPage() {
  const { sidebarOpen } = useApp();
  const { timeRange, setTimeRange } = useDateFilter();
  const [showEmpty, setShowEmpty] = useState(false);
  const [isEditSpendModalOpen, setIsEditSpendModalOpen] = useState(false);
  const { selectedCompany } = useSelectedCompanyStore();
  const { data, isLoading } = useOrganicReportOverview({
    timeRange: fmt(timeRange),
    company_id: selectedCompany?.company?.id,
  });
  const { data: overview } = data || {};
  const { deal_rate, deals, revenue, roi, spend, traffic } = overview || {};
  const updateSpendMutation = useUpdateOrganicSpend();

  // Function to check if all values in an array are zero
  const areAllZeros = (arr: number[]) => {
    if (!Array.isArray(arr) || arr.length === 0) {
      return false;
    }
    return arr.every((num) => Number(num) === 0);
  };

  // Memoize getValues to avoid recalculating unless dependencies change
  const getValues = useMemo(() => {
    return [
      formatNumber(deal_rate?.value),
      formatNumber(deals?.value),
      formatNumber(revenue?.value),
      formatNumber(roi?.value),
      formatNumber(spend?.value),
      formatNumber(traffic?.value),
    ];
  }, [
    deal_rate?.value,
    deals?.value,
    revenue?.value,
    roi?.value,
    spend?.value,
    traffic?.value,
  ]);

  // Set showEmpty based on whether all values in getValues are zero
  useEffect(() => {
    if (!isLoading && getValues) {
      setShowEmpty(areAllZeros(getValues));
    }
  }, [getValues, isLoading]);

  const handleEditSpend = () => {
    setIsEditSpendModalOpen(true);
  };

  const handleSaveSpend = (amount: number, frequency: string) => {
    if (!selectedCompany?.company?.id) return;
    const payload =
      frequency === "monthly"
        ? { monthly_spend: amount }
        : { yearly_spend: amount };

    updateSpendMutation.mutate(
      {
        companyId: selectedCompany.company.id,
        payload: payload,
      },
      {
        onSuccess: () => {
          setIsEditSpendModalOpen(false);
          showToast({
            title: "Success",
            description: "SEO spend updated successfully.",
            type: "success",
          });
        },
        onError: (error) => {
          showToast({
            title: "Error",
            description: "Failed to update SEO spend. Please try again.",
            type: "error",
          });
          console.error("Failed to update spend:", error);
        },
      }
    );
  };

  return (
    <div className="mx-auto p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-2">
        <PageHeader
          title="Organic"
          breadcrumbs={[
            { label: "Acquisition" },
            { label: "Organic Acquisition", href: "/acquisition/organic" },
          ]}
          data-tour="organic-page-header"
        />
        <div className="self-end sm:self-auto" data-tour="organic-date-selector">
          <DateSelector selected={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      {showEmpty ? (
        <div>
          <NoDataPage
            heading="No Data Available"
            subHeading="There are no organic acquisition metrics to display for the selected time range."
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4" data-tour="organic-metrics">
            {/* Left */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${sidebarOpen ? "lg:col-span-4" : "lg:col-span-2"
                } xl:col-span-2 col-span-4`}
            >
              {isLoading ? (
                <>
                  <MainMetricCardSkeleton bgColor="bg-white" />
                  <MainMetricCardSkeleton bgColor="bg-white" />
                </>
              ) : (
                <>
                  <MainMetricCard
                    title="Revenue"
                    backgroundImage="/assets/background.png"
                    value={`${revenue?.value}`}
                    change={revenue?.change}
                    bgColor="bg-lime-400"
                    variant="lime"
                    symbol={CURRENCY_SYMBOL}
                  />
                  <MainMetricCard
                    title="Cases"
                    value={deals?.value}
                    change={deals?.change}
                    bgColor="bg-neutral-50"
                  />
                </>
              )}
            </div>

            {/* Right */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${sidebarOpen ? "lg:col-span-4" : "lg:col-span-2"
                } xl:col-span-2 col-span-4`}
            >
              {isLoading ? (
                <>
                  <SmallMetricCardSkeleton />
                  <SmallMetricCardSkeleton />
                  <SmallMetricCardSkeleton />
                  <SmallMetricCardSkeleton />
                </>
              ) : (
                <>
                  <SummaryCard
                    value={spend?.value}
                    change={spend?.change}
                    heading="Spend"
                    icon={CURRENCY_SYMBOL}
                    showEdit={true}
                    onEdit={handleEditSpend}
                  />
                  <SummaryCard
                    value={roi?.value}
                    change={roi?.change}
                    heading="ROI"
                    icon={CURRENCY_SYMBOL}
                  />
                  <SummaryCard
                    value={traffic?.value}
                    change={traffic?.change}
                    heading="Traffic"
                  />
                  <SummaryCard
                    value={deal_rate?.value}
                    change={deal_rate?.change}
                    heading="Case Rate"
                    tooltipText="Case rate measures how effectively your business converts leads into sales."
                  />
                </>
              )}
            </div>
          </div>

          <div className="mt-6" data-tour="organic-landing-pages">
            <LandingPages timeRange={timeRange} />
          </div>
        </>
      )}

      <EditSpendModal
        open={isEditSpendModalOpen}
        onOpenChange={setIsEditSpendModalOpen}
        currentAmount={spend?.value}
        onSave={handleSaveSpend}
        isLoading={updateSpendMutation.isPending}
        frequency={overview?.is_monthly ? "monthly" : "yearly"}
      />
    </div>
  );
}
