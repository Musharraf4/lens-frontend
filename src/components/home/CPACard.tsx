"use client";

import { Handshake } from "lucide-react";
import { ToggleButton } from "./ToggleButton";
import { RiHandHeartLine } from "react-icons/ri";
import { CURRENCY_SYMBOL } from "@/constants";
import { Skeleton } from "../ui/skeleton";
import { Tooltip } from "../Tooltip";

interface CPACardProps {
  selectedOption: string;
  onOptionChange: (option: string) => void;
  value: string;
  change: string;
  trafficValue?: string;
  trafficChange?: string;
  loadingChanges?: boolean;
  trafficIsPositive?: boolean;
}

export function CPACard({
  selectedOption,
  onOptionChange,
  value,
  change,
  trafficValue,
  trafficChange,
  loadingChanges,
  trafficIsPositive,
}: CPACardProps) {
  const iconSource = (!change || (Number(change) == 0)) ? "/down-gray.svg" : Number(change) > 0 ? "/up-green.svg" : "/down-red.svg";

  return (
    <div className="bg-white p-4 rounded-3xl min-h-32">
      <div className="h-full flex flex-col justify-between">
        {/* Header with CPA label and toggle */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2 flex-nowrap">
          <div className="relative flex items-center group">
            <span className="mr-1 text-base text-neutral-500">CPA</span>
            <Tooltip tooltipText='Cost per acquisition' />
          </div>
          <ToggleButton
            options={[
              {
                label: "Leads",
                icon: (
                  <RiHandHeartLine
                    className="w-3 h-3"
                    aria-label="Leads icon"
                  />
                ),
              },
              {
                label: "Cases",
                icon: (
                  <Handshake
                    className="w-3 h-3"
                    aria-label="deals icon"
                  />
                ),
              },
            ]}
            selectedOption={selectedOption}
            onSelect={onOptionChange}
          />
        </div>

        {/* Main value section */}
        <div className="flex justify-between gap-2 items-center">
          <div className="flex gap-1">
            <h4 className="text-xl sm:text-2xl font-semibold text-black truncate">{CURRENCY_SYMBOL}{value ? (Number(value) > 1000 ? `${(Number(value) / 1000).toFixed(2)}K` : value) : 0}</h4>
            <img src={iconSource} />
          </div>
          {loadingChanges ? <Skeleton className="h-6 w-10 rounded" /> : <span className={`text-sm text-neutral-500 whitespace-nowrap`}>{Number(change) > 0 ? `+${change}` : change ?? 0}%</span>}
        </div>

        {/* Optional traffic section */}
        {trafficValue && (
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
            <div className="flex justify-between items-baseline gap-2">
              <span className="text-xs sm:text-sm text-gray-600">Traffic</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900">{trafficValue}</span>
            </div>
            {trafficChange && (
              <div className="flex justify-end items-center mt-1">
                {trafficIsPositive ? (
                  <span className="text-green-500 mr-0.5 sm:mr-1 text-xs">↑</span>
                ) : (
                  <span className="text-gray-500 mr-0.5 sm:mr-1 text-xs">↓</span>
                )}
                <span
                  className={`text-xs ${trafficIsPositive ? "text-green-500" : "text-gray-500"}`}
                >
                  {trafficChange}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
