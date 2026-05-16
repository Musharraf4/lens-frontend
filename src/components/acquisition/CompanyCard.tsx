import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCY_SYMBOL } from "@/constants";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

export type MetricData = {
  value: string | number;
  label: string;
  trend?: "up" | "down" | "neutral";
};

export type CompanyCardProps = {
  title?: string;
  companyName: string;
  selectedConfigurationId: string | null;
  address: string;
  metrics?: MetricData[];
  companies?: { id: string; name: string }[];
  // For GBP we optionally pass location name as well
  addresses?: { id: string; address: string; name?: string }[];
  onCompanyChange?: (companyId: string) => void;
  onAddressChange?: (addressId: string) => void;
  isLoading?: boolean;
  className?: string;
  companyId?: string | null;
  selectedAddressId?: string | null;
  gmb?: boolean;
};

export const CompanyCard: React.FC<CompanyCardProps> = ({
  title = "Locations",
  companyName,
  address,
  metrics = [],
  companies = [],
  addresses = [],
  selectedConfigurationId,
  onCompanyChange,
  onAddressChange,
  isLoading = false,
  className,
  companyId,
  selectedAddressId,
  gmb
}) => {

  const [selectedOption, setSelectedOption] = useState("Leads");

  const handleCompanyChange = (value: string) => {
    if (onCompanyChange) onCompanyChange(value);
  };

  const handleAddressChange = (value: string) => {
    if (onAddressChange) onAddressChange(value);
  };

  const renderTrendIcon = (trend?: "up" | "down" | "neutral") => {
    if (!trend) return null;

    return (
      <span className={`text-xs ${trend === "up" ? "text-green-500" : trend === "neutral" ? 'text-gray-500' : "text-red-500"}`}>
        {trend === "up" ? "▲" : "▼"}
      </span>
    );
  };
  const showCurrency = ["Revenue", "Ad Spend", "ROAS"]
  const mdClass = gmb ? `md:grid-cols-6` : `md:grid-cols-5`;

  // For GBP, resolve the selected address object by ID (fixes issue with duplicate addresses)
  const selectedAddress = gmb && selectedAddressId
    ? addresses.find((addr) => addr.id === selectedAddressId)
    : undefined;
  return (
    <div className={cn("bg-white rounded-3xl p-4 sm:p-6", className)}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <span className="text-gray-500 text-sm">{title}</span>

        {/* Company Dropdown */}
        {companies.length === 0 ? (
          <div className="w-full sm:w-64 border border-gray-200 rounded-full bg-gray-50 h-10 flex items-center px-3">
            <span className="text-gray-500 text-sm">No business found</span>
          </div>
        ) : (
          <Select
            // defaultValue={companyName}
            value={companyId || undefined}
            onValueChange={handleCompanyChange}
            disabled={isLoading || !companyName}
          >
            <SelectTrigger className="w-full sm:w-64 border border-gray-200 rounded-full bg-white h-10">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem
                  key={company.id}
                  value={company.id}
                >
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Company Name */}
      {isLoading ? (
        <div className="h-8 w-3/4 bg-gray-100 rounded animate-pulse mb-4"></div>
      ) : (
        <h2 className="text-xl sm:text-2xl font-bold mb-2 break-words">
          {companyName || "No business found"}
        </h2>
      )}

      {/* Address with Dropdown */}
      {isLoading ? (
        <div className="h-6 w-2/3 bg-gray-100 rounded animate-pulse mb-6"></div>
      ) : (
        <div className="flex items-center mb-4 sm:mb-6">
          <Select
            value={selectedAddressId || undefined}
            onValueChange={handleAddressChange}
            disabled={addresses?.length === 0}
          >
            <SelectTrigger
              className={cn(
                "w-full sm:w-auto min-w-[200px] sm:min-w-[280px] border border-gray-200 rounded-full bg-white hover:bg-gray-50 hover:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer",
                gmb ? "h-auto p-[20px]" : "h-9",
                addresses?.length === 0 && "opacity-50 cursor-not-allowed"
              )}
            >
              {gmb ? (
                <div className="flex flex-col text-left w-full pr-6">
                  <span className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                    {selectedAddress?.name || companyName || "No location found"}
                  </span>
                  <span className="text-[11px] sm:text-xs text-gray-500 break-words mt-0.5">
                    {address || ""}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 w-full pr-6">
                  <span className="text-xs sm:text-sm text-gray-700 break-words">
                    {address || "No location found"}
                  </span>
                </div>
              )}
            </SelectTrigger>
            <SelectContent className="min-w-[280px]">
              {addresses.map((addr) => (
                <SelectItem
                  key={addr.id}
                  value={addr.id}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  {gmb ? (
                    <div className="flex flex-col text-left w-full py-1">
                      <span className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                        {addr.name || companyName}
                      </span>
                      <span className="text-[11px] sm:text-xs text-gray-500 break-words mt-0.5">
                        {addr.address}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs sm:text-sm text-gray-700 break-words">
                      {addr.address}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Metrics Grid */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 ${mdClass} gap-4`}>
        {isLoading
          ? // Loading state for metrics
          Array(metrics?.length || 6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex flex-col relative"
              >
                <div className="h-6 w-20 bg-gray-100 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
                {i < 4 && (
                  <div className="hidden sm:block absolute right-0 top-0 w-0.5 bg-gray-200 h-full"></div>
                )}
              </div>
            ))
          : // Actual metrics
          metrics.map((metric, index) => (
            <div
              key={index}
              className="flex flex-col relative"
            >
              <div className="flex items-center gap-1">
                <span className="text-xl font-semibold">
                  {showCurrency?.includes(metric.label) ? CURRENCY_SYMBOL : ''}{metric.value ? (Number(metric.value) > 1000 ? `${(Number(metric.value) / 1000).toFixed(0)}K` : metric.value) : 0}</span>
                {renderTrendIcon(metric.trend)}
              </div>
              <span className="text-sm text-gray-500">{metric.label}</span>

              {index < metrics.length - 1 && (
                <div className="hidden sm:block absolute right-0 top-0 w-0.5 bg-gray-200 h-full"></div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default CompanyCard;
