"use client";

import { Button } from "@/components/ui/button";
import { Metric } from "@/types";
import { MdArrowOutward } from "react-icons/md";
import { Skeleton } from "../ui/skeleton";
import { formatCompactNumber } from "@/lib/utils";
import { Tooltip } from "@/components/Tooltip";
import { useMemo, useRef, useEffect, useState } from "react";

interface MainMetricCardProps extends Metric {
  title: string;
  bgColor?: string;
  backgroundImage?: string;
  className?: string;
  loadingChanges?: boolean;
  variant?: "lime";
  symbol?: string;
  tooltipText?: string;
  tooltipClass?: string
}

export function MainMetricCard({
  title,
  value,
  change,
  loadingChanges = false,
  bgColor = "bg-gray-100",
  backgroundImage,
  className = "",
  variant,
  symbol,
  tooltipText,
  tooltipClass
}: MainMetricCardProps) {
  const iconSource =
    !change || Number(change) == 0
      ? "/down-gray.svg"
      : Number(change) > 0
        ? "/up-green.svg"
        : "/down-red.svg";

  const valueRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);

  // Format value based on title
  const formattedValue = useMemo(() => {
    const numValue = Number(value);
    if (isNaN(numValue)) return "0";

    // If title is "Revenue", show exact value without "k" suffix
    if (title.toLowerCase() === "revenue") {
      // Format with commas for readability
      return numValue.toLocaleString("en-US", {
        maximumFractionDigits: 0,
      });
    }

    // Otherwise use the compact format
    return formatCompactNumber(numValue);
  }, [value, title]);

  // Calculate dynamic font size based on overflow detection
  useEffect(() => {
    if (!valueRef.current) return;

    const checkOverflow = () => {
      const element = valueRef.current;
      if (!element) return;

      const container = element.parentElement;
      if (!container) return;

      // Reset to default size first to measure accurately
      element.style.fontSize = "";

      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (!element || !container) return;

        const containerWidth = container.offsetWidth;
        const textWidth = element.scrollWidth;

        // If text overflows, calculate appropriate font size
        if (textWidth > containerWidth) {
          const currentFontSize = parseInt(
            window.getComputedStyle(element).fontSize
          );
          const ratio = containerWidth / textWidth;
          const newSize = Math.max(
            20, // Minimum font size
            Math.floor(currentFontSize * ratio * 0.9) // 90% to add some padding
          );
          setFontSize(newSize);
        } else {
          // Text fits, use responsive classes based on length
          setFontSize(null);
        }
      });
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(checkOverflow, 0);

    // Also check on window resize
    window.addEventListener("resize", checkOverflow);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [formattedValue, symbol]);

  return (
    <div
      className={`
        relative p-4 rounded-3xl transition-all ${bgColor} ${className}
        min-h-[180px] sm:min-h-[200px]
        flex flex-col justify-between
`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: backgroundImage ? "multiply" : undefined,
      }}
    >
      <div className="flex justify-between relative items-center mb-2 sm:mb-3">
        <div className="flex items-center gap-2 max-w-[70%]">
          <span className="text-sm sm:text-base text-neutral-500 truncate">{title}</span>
          {tooltipText && <Tooltip tooltipText={tooltipText} tooltipClass={tooltipClass} />}
        </div>

        <Button
          size="icon"
          disabled
          className="h-6 w-6 sm:h-8 sm:w-8 rounded-full group hover:w-auto hover:px-3 hover:rounded-full hover:bg-neutral-700 bg-black flex-shrink-0 transition-all duration-300 overflow-hidden"
          aria-label={`View ${title} details`}
        >
          <div className="flex items-center justify-center min-w-full">
            <span
              className="
              text-white text-xs
              opacity-0 group-hover:opacity-100
              w-0 group-hover:w-auto
              overflow-hidden
              transition-all duration-200
              whitespace-nowrap
              ml-0 group-hover:ml-1
            "
            >
              See details
            </span>
            <MdArrowOutward className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          </div>
        </Button>
      </div>
      <div className="flex flex-col gap-y-1 sm:gap-y-3">
        <span
          ref={valueRef}
          className={`${fontSize === null ? "text-4xl lg:text-[56px]" : ""} font-bold text-black overflow-hidden`}
          style={{
            lineHeight: "1.1",
            fontSize: fontSize ? `${fontSize}px` : undefined
          }}
        >
          {symbol}{formattedValue}
        </span>

        <div className="flex items-center gap-1">
          <img src={iconSource} />
          {loadingChanges ? (
            <Skeleton
              className="h-6 w-10"
              variant={variant}
            />
          ) : (
            <p className={`text-black`}>{Number(change) > 0 ? "+" : ""}{change ? Number(change)?.toFixed(0) : "0"}%</p>
          )}
        </div>
      </div>
    </div>
  );
}
