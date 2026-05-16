import { SummaryCard } from "@/components/common/SummaryCard";
import { CPACard } from "@/components/home/CPACard";
import { EmptyStateCard } from "@/components/home/EmptyStateCard";
import { MainMetricCard } from "@/components/home/MainMetricCard";
import { useApp } from "@/store/appStore";
import { useState } from "react";
import { AddIntegrationCard } from "./AddIntegrationCard";
import { CURRENCY_SYMBOL } from "@/constants";

export const EmptyState = () => {
  const { sidebarOpen } = useApp();
  const [cpaToggle, setCpaToggle] = useState("Leads");

  return (
    <div className="space-y-4">
      <div data-tour="empty-state-card">
        <EmptyStateCard />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Left */}
        <div
          data-tour="main-metrics"
          className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${sidebarOpen ? "lg:col-span-4" : "lg:col-span-2"
            } xl:col-span-2 col-span-4`}
        >
          <MainMetricCard
            title="Revenue"
            backgroundImage="/assets/background.png"
            value="0"
            change="0"
            bgColor="bg-lime-400"
            variant="lime"
          />
          <MainMetricCard
            title="Cases"
            value="0"
            change="0"
            bgColor="bg-gray-100"
          />
        </div>

        {/* Right */}
        <div
          data-tour="secondary-metrics"
          className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${sidebarOpen ? "lg:col-span-4" : "lg:col-span-2"
            } xl:col-span-2 col-span-4`}
        >
          <CPACard
            selectedOption={cpaToggle}
            onOptionChange={setCpaToggle}
            value="0"
            change="0"
          />
          <SummaryCard
            value={0}
            change={"0"}
            heading="Spend"
            icon={CURRENCY_SYMBOL}
          />
          <SummaryCard
            value={0}
            change={"0"}
            heading="Traffic"
          />
          <SummaryCard
            value={0}
            change={"0"}
            heading="ROAS"
          />
        </div>
      </div>

      <div data-tour="add-integration-card">
        <AddIntegrationCard />
      </div>
    </div>
  );
};
