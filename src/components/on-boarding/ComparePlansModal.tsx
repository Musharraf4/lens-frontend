"use client";

import { Plan } from "@/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import clsx from "clsx";
import { ArrowRight, Rocket } from "lucide-react";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { IoHelpCircle } from "react-icons/io5";
import { DISCOUNTED_PRICE } from "@/utils/pricingDetails";

export default function ComparePlansModal({ plans }: { plans: Plan[] }) {
  const [open, setOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const getMonthlyPlans = () => plans.filter((plan) => plan.interval === "month");
  const getYearlyPlans = () => plans.filter((plan) => plan.interval === "year");
  const getDisplayedPlans = () => (isYearly ? getYearlyPlans() : getMonthlyPlans());

  const displayedPlans = getDisplayedPlans();

  // Feature config for mapping
  const featureList = [
    { key: "tracking_numbers", label: "Tracking numbers" },
    { key: "call_minutes", label: "Call minutes" },
    { key: "multiple_integrations", label: "Integrations" },
    { key: "users", label: "User Places" },
    { key: "roi", label: "ROI" },
    { key: "crm", label: "CRM" },
    { key: "support", label: "Support" },
    { key: "sync_clio", label: "Sync with Clio" },
    { key: "ai_insights", label: "AI Insights" },
  ];


  const formatPrice = (cents: number) => {
    const divisor = isYearly ? 12 : 1;
    return `$${(cents / 100 / divisor).toFixed(0)}`;
  };

  // Helper for rendering values
  const renderValue = (value: any) => {
    if (value === 'multiple_integrations') {
      return <span className="text-xs text-neutral-500">Multiple Integrations</span>;
    }
    if (typeof value === "boolean") {
      return value ? (
        <span className="inline-flex items-center justify-center w-5 h-5 bg-[#0CD074] text-white rounded-full">
          <FaCheck className="w-3 h-3" />
        </span>
      ) : (
        <span className="inline-flex items-center justify-center w-5 h-5 bg-[#f88793] rounded-full">
          <IoMdClose className="w-3 h-3 text-white" />
        </span>
      );
    }
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    if (typeof value === "string") {
      // custom readable labels
      if (value === "basic") return "Basic";
      if (value === "advanced") return "Advanced";
      if (value === "by_campaign") return "By campaign/keyword";
      if (value === "priority") return "Priority";
      if (value === "email") return "Email";
      return value;
    }
    return "-";
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer flex items-center gap-1 text-xs text-neutral-500 font-normal hover:underline"
      >
        Compare Plans
        <ArrowRight className="w-3 h-3" />
      </button>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          {/* Header */}
          <DialogTitle className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
            Compare Plans
          </DialogTitle>

          {/* Toggle Monthly / Yearly */}
          <div className="flex items-center mb-4 sm:mb-6 space-x-2 sm:space-x-3">
            <span
              className={clsx("text-xs sm:text-sm font-medium", !isYearly && "text-[#030C23]")}
            >
              Pay Monthly
            </span>
            <div
              className={clsx(
                "relative w-8 sm:w-10 h-4 sm:h-5 rounded-full cursor-pointer transition-colors duration-300",
                isYearly ? "bg-[#0CD074]" : "bg-[#030C23]"
              )}
              onClick={() => setIsYearly((prev) => !prev)}
            >
              <span
                className={clsx(
                  "absolute top-1/2 -translate-y-1/2 left-0.5 sm:left-1 h-3 sm:h-4 w-3 sm:w-4 rounded-full bg-white shadow transition-transform duration-200",
                  isYearly ? "translate-x-4 sm:translate-x-5" : "translate-x-0"
                )}
              />
            </div>
            <span
              className={clsx("text-xs sm:text-sm font-medium", isYearly && "text-[#030C23]")}
            >
              Pay Yearly
            </span>
            <span className="text-xs font-medium text-[#0CD074] bg-[#EAFFF5] rounded-full px-2 py-1 whitespace-nowrap">
              -{DISCOUNTED_PRICE}%
            </span>
          </div>

          <hr />

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm sm:mt-8">
            <table className="w-full table-auto min-w-[600px] text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold">
                <tr>
                  <th className="py-2 px-3 sm:px-4">Core features</th>
                  {displayedPlans.map((plan) => (
                    <th
                      key={plan.plan_id}
                      className="py-2 text-center"
                    >
                      <span
                        className={clsx(
                          "px-3 py-1 min-w-11/12 mx-1 gap-1 justify-center rounded-full font-medium inline-flex items-center",
                          plan.plan_name === "Starter"
                            ? "bg-[#ACDF18] text-white"
                            : "bg-[#4678FB] text-white"
                        )}
                      >
                        <Rocket size={14} className="shrink-0" />
                        {plan.plan_name} – {formatPrice(plan.amount_cents)}/mo,{" "},{" "}
                        {plan.nickname?.toLowerCase()}
                        {/* early offer */}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-[#030C23] text-xs sm:text-sm">
                {featureList.map(({ key, label }) => (
                  <tr
                    key={key}
                    className="text-gray-700"
                  >
                    <td className="py-2 sm:py-3 px-3 sm:px-4 font-medium">
                      {label} <IoHelpCircle className="inline w-3 h-3 text-[#707889]" />
                    </td>
                    {displayedPlans.map((plan) => (
                      <td
                        key={plan.plan_id + key}
                        className="py-2 sm:py-3 px-3 sm:px-4 text-center"
                      >
                        {key === 'multiple_integrations' ? (plan.limits['multiple_integrations'] ? 'Multiple' : 'Only 1') : null}
                        {key === 'users' ? (plan.limits['users'] === 1 ? 'Only 1' : 'Upto 5') : null}

                        {(key !== 'multiple_integrations') && (key !== 'users') && (
                          <>
                            {renderValue(plan.limits[key as keyof typeof plan.limits])}
                          </>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
