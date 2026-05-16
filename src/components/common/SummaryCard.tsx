import { Metric } from "@/types";
import { Skeleton } from "../ui/skeleton";
import { Tooltip } from "../Tooltip";
import { formatCompactNumber } from "@/lib/utils";
import { FiEdit } from "react-icons/fi";

interface SummaryCardProps extends Metric {
  heading: string;
  loadingChanges?: boolean;
  icon?: string;
  tooltipText?: string;
  onEdit?: () => void;
  showEdit?: boolean;
}

export function SummaryCard({
  heading,
  value,
  change,
  loadingChanges,
  icon,
  tooltipText,
  onEdit,
  showEdit = false,
}: SummaryCardProps) {
  const iconSource =
    !change || Number(change) === 0
      ? "/down-gray.svg"
      : Number(change) > 0
        ? "/up-green.svg"
        : "/down-red.svg";

  return (
    <div className="bg-white p-4 rounded-3xl flex flex-col justify-between min-h-32 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <p className="text-neutral-500">{heading}</p>
          {tooltipText && <Tooltip tooltipText={tooltipText} />}
        </div>
        {showEdit && onEdit && (
          <div className="group relative inline-block">
            <button
              onClick={onEdit}
              className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label="Configure your SEO budget"
            >
              <FiEdit className="w-4 h-4 text-neutral-500 hover:text-neutral-700" />
            </button>
            <div
              className="absolute z-50 hidden group-hover:block rounded-lg p-3 mt-1 w-48 text-xs font-normal text-white right-0 top-full"
              style={{
                background: 'var(--Common-Overlay-dark, #030C238F)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0px 4px 32px 0px rgba(16, 30, 54, 0.08)'
              }}
            >
              Configure your SEO budget
            </div>
          </div>
        )}
      </div>
      <div>
        <div className="flex justify-between items-center gap-1 sm:gap-2">
          <div className="flex gap-1">
            <h4 className="text-xl sm:text-2xl font-semibold truncate">
              {icon}
              {formatCompactNumber(value)}
            </h4>
            {!showEdit && <img src={iconSource} />}
          </div>
          {loadingChanges ? (
            <Skeleton className="h-6 w-10 rounded" />
          ) : !showEdit && (
            <span className={`whitespace-nowrap text-sm text-neutral-500`}>
              {Number(change) > 0 ? "+" : ""}{change ? Number(change)?.toFixed(0) : "0"}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
