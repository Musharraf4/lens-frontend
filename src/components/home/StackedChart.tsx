"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useMemo,
} from "react";
import type { Chart, ChartEvent, ActiveElement } from "chart.js";
import { ChartData } from "@/types";
import { CURRENCY_SYMBOL } from "@/constants";
import { Dropdown } from "@/components/Dropdown";

type StackedChartProps = {
  data: ChartData[];
  loading: boolean;
  hideRevenue?: boolean;
  isHomePage?: boolean;
  setSelectedChartType?: React.Dispatch<React.SetStateAction<string>>;
  selectedChartType?: string;
};

type Timeframe = "daily" | "weekly" | "monthly";

export default function StackedChart({
  data,
  loading,
  hideRevenue,
  isHomePage = false,
  setSelectedChartType,
  selectedChartType
}: StackedChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartContainer = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const lastHoverIndex = useRef<number | null>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const [hoverMonth, setHoverMonth] = useState<string | null>(null);
  const [hoverData, setHoverData] = useState<ChartData | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [containerKey, setContainerKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const fields = hideRevenue
    ? (["traffic", "leads", "cases"] as const)
    : (["traffic", "leads", "cases", "revenue"] as const);
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(
    new Set(fields)
  );
  const effectiveSelected = selectedMetrics.size
    ? selectedMetrics
    : new Set<string>([...fields] as unknown as string[]);
  const colors = {
    traffic: { primary: "#4285F4", secondary: "#8AB4F8" },
    leads: { primary: "#A8C7FA", secondary: "#D2E3FC" },
    sales: { primary: "#a1a1a1ff", secondary: "#E6E9EE" },
    revenue: { line: { primary: "#673AB7", secondary: "#B794F6" } },
  };

  const checkScreenSize = useCallback(() => {
    const width = window.innerWidth;
    setIsMobile(width < 640);
    setIsTablet(width >= 640 && width < 1024);
  }, []);

  const handleBarHover = (month: string) => {
    const item = data.find((item) => item.month === month);

    if (item) {
      item.cases = item.deals; // add key "cases" with value from item.deals
    }
    if (item) {
      setHoverMonth(month);
      setHoverData(item);
    }
  };

  const handleBarLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    lastHoverIndex.current = null;
    setHoverMonth(null);
    setHoverData(null);
  };

  const getPrevMonth = (month: string) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentIndex = months.indexOf(month);
    return months[(currentIndex - 1 + 12) % 12];
  };
  const initChart = useCallback(async () => {
    try {
      if (typeof window === "undefined" || !data.length) return;
      const { Chart, registerables } = await import("chart.js");
      Chart.register(...registerables);

      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
      if (!chartRef.current) return;
      const ctx = chartRef.current.getContext("2d");
      if (!ctx) return;

      const revenueGradient = ctx.createLinearGradient(0, 0, 0, 400);
      revenueGradient.addColorStop(0, colors.revenue.line.primary);
      revenueGradient.addColorStop(1, "rgba(103, 58, 183, 0)");

      // Adjust labels based on screen size
      const labels = data.map((d) => {
        if (isMobile) return d.month.charAt(0);
        if (isTablet) return d.month.substring(0, 3);
        return d.month;
      });

      let salesPattern: CanvasPattern | string = colors.sales.primary;
      const patternCanvas = document.createElement("canvas");
      const patternCtx = patternCanvas.getContext("2d");
      patternCanvas.width = 10;
      patternCanvas.height = 10;
      if (patternCtx) {
        patternCtx.strokeStyle = colors.sales.primary;
        patternCtx.lineWidth = 2;
        patternCtx.beginPath();
        patternCtx.moveTo(0, 10);
        patternCtx.lineTo(10, 0);
        patternCtx.stroke();
        patternCtx.closePath();
        const pattern = ctx.createPattern(patternCanvas, "repeat");
        if (pattern) salesPattern = pattern;
      }

      const datasets: any[] = [
        ...(effectiveSelected.has("traffic")
          ? [
            {
              label: "Traffic",
              data: data.map((d) => d.traffic),
              backgroundColor: colors.traffic.primary,
              borderWidth: 2,
              borderColor: "#fff",
              borderRadius: {
                topLeft: 8,
                topRight: 8,
                bottomLeft: 8,
                bottomRight: 8,
              },
              borderSkipped: false,
              barPercentage: isMobile ? 0.5 : isTablet ? 0.6 : 0.7,
              categoryPercentage: isMobile ? 0.7 : isTablet ? 0.8 : 0.85,
              order: 1,
            },
          ]
          : []),
        ...(effectiveSelected.has("leads")
          ? [
            {
              label: "Leads",
              data: data.map((d) => d.leads),
              backgroundColor: colors.leads.primary,
              borderWidth: 2,
              borderColor: "#fff",
              borderRadius: {
                topLeft: 8,
                topRight: 8,
                bottomLeft: 8,
                bottomRight: 8,
              },
              borderSkipped: false,
              barPercentage: isMobile ? 0.5 : isTablet ? 0.6 : 0.7,
              categoryPercentage: isMobile ? 0.7 : isTablet ? 0.8 : 0.85,
              order: 2,
            },
          ]
          : []),
        ...(effectiveSelected.has("deals") || effectiveSelected.has("cases")
          ? [
            {
              label: "Cases",
              data: data.map((d) => d.deals),
              backgroundColor: salesPattern,
              borderWidth: 2,
              borderColor: "#fff",
              borderRadius: {
                topLeft: 8,
                topRight: 8,
                bottomLeft: 8,
                bottomRight: 8,
              },
              borderSkipped: false,
              barPercentage: isMobile ? 0.5 : isTablet ? 0.6 : 0.7,
              categoryPercentage: isMobile ? 0.7 : isTablet ? 0.8 : 0.85,
              order: 3,
            },
          ]
          : []),
        ...(!hideRevenue && effectiveSelected.has("revenue")
          ? [
            {
              label: "Revenue",
              data: data.map((d) => d.revenue),
              yAxisID: "y1",
              type: "line" as const,
              borderColor: colors.revenue.line.primary,
              backgroundColor: "transparent",
              borderWidth: isMobile ? 2 : 3,
              pointBackgroundColor: colors.revenue.line.primary,
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: isMobile ? 4 : 5,
              pointHitRadius: 10,
              tension: 0.4,
              order: 0,
            },
          ]
          : []),
      ];

      const newChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          scales: {
            x: {
              stacked: true,
              grid: { display: false },
              border: { display: false },
              ticks: {
                color: "#9E9E9E",
                font: {
                  size: (() => {
                    // Adjust font size when many labels
                    const needsAdjustment =
                      (selectedChartType === "daily" || selectedChartType === "weekly") &&
                      data.length > 31;
                    if (needsAdjustment) {
                      return isMobile ? 8 : isTablet ? 9 : 10;
                    }
                    return isMobile ? 10 : isTablet ? 11 : 12;
                  })(),
                },
                maxRotation: (() => {
                  // Rotate labels when many labels to prevent overlapping
                  const needsAdjustment =
                    (selectedChartType === "daily" || selectedChartType === "weekly") &&
                    data.length > 20;
                  if (needsAdjustment) {
                    return isMobile ? 60 : 45;
                  }
                  return isMobile ? 45 : 0;
                })(),
                autoSkip: (() => {
                  // Auto-skip labels when many labels
                  const needsAdjustment =
                    (selectedChartType === "daily" || selectedChartType === "weekly") &&
                    data.length > 31;
                  return needsAdjustment || isMobile;
                })(),
                maxTicksLimit: (() => {
                  // Limit number of visible ticks when many labels
                  const needsAdjustment =
                    (selectedChartType === "daily" || selectedChartType === "weekly") &&
                    data.length > 31;
                  if (needsAdjustment) {
                    return isMobile ? 10 : isTablet ? 15 : 20;
                  }
                  return undefined;
                })(),
              },
            },
            y: {
              stacked: true,
              position: "left",
              beginAtZero: true,
              suggestedMax: (() => {
                const maxBars = Math.max(
                  0,
                  ...data.flatMap((item) =>
                    fields
                      .filter((field) => field !== "revenue")
                      .map((field) =>
                        field === "cases" ? item["deals"] : item[field]
                      )
                  )
                );
                if (maxBars === 0) return 0;
                const padded = maxBars * 1.1;
                if (padded >= 1000) return Math.ceil(padded / 1000) * 1000;
                if (padded >= 100) return Math.ceil(padded / 100) * 100;
                return Math.ceil(padded / 10) * 10;
              })(),
              grid: {
                color: "#F0F0F0",
                borderDash: [5, 5],
                drawOnChartArea: true,
                drawTicks: false,
                lineWidth: 1,
                tickLength: 0,
              },
              ticks: {
                color: "#9E9E9E",
                callback: (value: any) =>
                  value >= 1000 ? `${value / 1000}k` : `${value}`,
                font: { size: isMobile ? 10 : isTablet ? 11 : 12 },
                display: !isMobile,
                padding: isMobile ? 5 : 10,
              },
              border: { display: false, dash: [5, 5] },
            },
            y1: hideRevenue
              ? {
                // When revenue is hidden, no need to show y1
                display: false,
              }
              : {
                position: "right",
                beginAtZero: true,
                suggestedMax: (() => {
                  const maxRevenue = Math.max(0, ...data.map((item) => item.revenue));
                  if (maxRevenue === 0) return 0;

                  // Add 20% padding for better visibility
                  const paddedValue = maxRevenue * 1.2;

                  // Round up to a nice number based on the value
                  if (paddedValue >= 1000) {
                    // For values >= 1000, round up to nearest 1000
                    return Math.ceil(paddedValue / 1000) * 1000;
                  } else if (paddedValue >= 100) {
                    // For values >= 100, round up to nearest 100
                    return Math.ceil(paddedValue / 100) * 100;
                  } else {
                    // For smaller values, round up to nearest 10
                    return Math.ceil(paddedValue / 10) * 10;
                  }
                })(),
                grid: { display: false },
                border: { display: false },
                ticks: {
                  color: "#9E9E9E",
                  stepSize: undefined,
                  callback: (value: any) =>
                    value >= 1000
                      ? `${CURRENCY_SYMBOL}${value / 1000}k`
                      : `${CURRENCY_SYMBOL}${value}`,
                  font: { size: isMobile ? 10 : isTablet ? 11 : 12 },
                  display: !isMobile,
                  padding: isMobile ? 5 : 10,
                },
              },
          },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
          onHover: (
            event: ChartEvent,
            elements: ActiveElement[],
            chart: Chart
          ) => {
            // Clear any pending timeout
            if (hoverTimeout.current) {
              clearTimeout(hoverTimeout.current);
              hoverTimeout.current = null;
            }

            if (elements && elements.length) {
              const index = elements[0].index;

              // Only update if we're hovering over a different bar
              if (lastHoverIndex.current === index) {
                // Just update position for the same bar
                if (event && event.native) {
                  setHoverPosition({
                    x: (event.native as MouseEvent).offsetX,
                    y: (event.native as MouseEvent).offsetY,
                  });
                }
                return;
              }

              const month = data[index]?.month;
              if (!month) {
                handleBarLeave();
                return;
              }

              // Update the last hovered index
              lastHoverIndex.current = index;

              // Update tooltip data and position
              handleBarHover(month);
              if (event && event.native) {
                setHoverPosition({
                  x: (event.native as MouseEvent).offsetX,
                  y: (event.native as MouseEvent).offsetY,
                });
              }
            } else {
              // Debounce the hide action to prevent flickering
              hoverTimeout.current = setTimeout(() => {
                handleBarLeave();
              }, 50);
            }
          },
        },
      });

      chartInstance.current = newChartInstance;
    } catch (error) {
      console.error("Failed to initialize chart:", error);
    }
  }, [isMobile, isTablet, data, selectedMetrics, selectedChartType]);

  // Handle responsive layout changes
  useLayoutEffect(() => {
    if (loading) return;
    const handleMutation = () => {
      if (chartContainer.current) {
        setContainerKey((prev) => prev + 1);
        setTimeout(() => {
          if (chartContainer.current) {
            const newWidth = chartContainer.current.clientWidth;
            setContainerWidth(newWidth);
          }
        }, 50);
      }
    };
    const observer = new MutationObserver(handleMutation);
    const mainElement = document.querySelector("main");
    if (mainElement) {
      observer.observe(mainElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
    return () => observer.disconnect();
  }, [loading]);

  // Handle resize and initial setup
  useEffect(() => {
    if (loading) return;
    checkScreenSize();
    const updateContainerWidth = () => {
      if (chartContainer.current) {
        setContainerWidth(chartContainer.current.clientWidth);
        checkScreenSize();
      }
    };
    updateContainerWidth();
    if (chartContainer.current && typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(() => updateContainerWidth());
      resizeObserver.observe(chartContainer.current);
      return () => {
        if (chartInstance.current) chartInstance.current.destroy();
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        resizeObserver.disconnect();
      };
    }
    window.addEventListener("resize", updateContainerWidth);
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      window.removeEventListener("resize", updateContainerWidth);
    };
  }, [loading, containerKey, checkScreenSize]);

  // Initialize or update chart when dependencies change
  useEffect(() => {
    if (loading || containerWidth === null) return;
    const timer = setTimeout(() => {
      initChart();
    }, 100);
    return () => clearTimeout(timer);
  }, [loading, containerWidth, initChart, isMobile, isTablet, data]);

  // Loading skeleton
  const ChartSkeleton = () => (
    <div className="h-64 md:h-80 w-full relative">
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 z-10">
        {[
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ].map((month) => (
          <div
            key={month}
            className={`text-xs text-[#9E9E9E] ${isMobile ? "hidden sm:block" : ""
              }`}
          >
            {isMobile
              ? month.charAt(0)
              : isTablet
                ? month.substring(0, 3)
                : month}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col justify-between z-0">
        {[0, 1, 2, 3, 4].map((_, i) => (
          <div key={i} className="border-t border-gray-200 w-full"></div>
        ))}
      </div>
      <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-between py-2 z-10">
        {["100%", "75%", "50%", "25%", "0"].map((label, i) => (
          <div key={i} className="text-xs text-[#9E9E9E]">
            {label}
          </div>
        ))}
      </div>
      <div className="absolute top-0 bottom-0 right-0 flex-col justify-between py-2 z-10 hidden md:flex">
        {[
          `${CURRENCY_SYMBOL}100k`,
          `${CURRENCY_SYMBOL}75k`,
          `${CURRENCY_SYMBOL}50k`,
          `${CURRENCY_SYMBOL}25k`,
          `${CURRENCY_SYMBOL}0k`,
        ].map((label, i) => (
          <div key={i} className="text-xs text-[#9E9E9E]">
            {label}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 pt-4 pb-6 flex items-end justify-between z-1">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex flex-col items-center w-full h-full">
            <div className="animate-pulse flex flex-col w-full mx-0.5 h-full justify-end">
              <div
                className="w-full rounded-sm"
                style={{ height: "100%", backgroundColor: "#F7F9FB" }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const toggleMetric = (metric: string) => {
    setSelectedMetrics((prev) => {
      const isSameSelection = prev.size === 1 && prev.has(metric);
      if (isSameSelection) {
        return new Set(fields); // revert to all metrics
      }
      return new Set([metric]);
    });
  };
  return (
    <div
      className="bg-white rounded-3xl w-full p-4 sm:p-6 overflow-auto">
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4 justify-between">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSelectedMetrics(new Set(fields))}
              className={`flex items-center rounded-full border px-3 py-1 text-xs sm:text-sm ${selectedMetrics.size === fields.length
                ? "bg-gray-100 border-gray-300 text-gray-800"
                : "bg-white border-gray-200 text-gray-500"
                }`}
            >
              All
            </button>
            {fields.map((field) => {
              const isActive = selectedMetrics.has(field);
              const colorClass =
                field === "traffic"
                  ? "bg-blue-500"
                  : field === "leads"
                    ? "bg-blue-200"
                    : field === "cases"
                      ? "bg-gray-300"
                      : "bg-purple-600";
              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => toggleMetric(field)}
                  className={`flex items-center rounded-full border px-3 py-1 text-xs sm:text-sm ${isActive
                    ? "bg-gray-100 border-gray-300 text-gray-800"
                    : "bg-white border-gray-200 text-gray-500"
                    }`}
                >
                  <span
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-1.5 ${colorClass}`}
                    style={{ opacity: isActive ? 1 : 0.35 }}
                  />
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </button>
              );
            })}
          </div>
          {isHomePage && selectedChartType && setSelectedChartType && (
            <div className="ml-auto">
              <Dropdown
                options={["daily", "weekly", "monthly"]}
                value={selectedChartType}
                onChange={(value) => setSelectedChartType(value as Timeframe)}
                formatOption={(option) =>
                  String(option).charAt(0).toUpperCase() +
                  String(option).slice(1)
                }
                triggerClassName="w-[130px] rounded-full text-xs sm:text-sm"
                placeholder="Select period"
              />
            </div>
          )}
        </div>
        <div className="flex">
          <div
            className="flex-1 relative"
            ref={chartContainer}
            key={`chart-container-${containerKey}`}
            data-tour="stacked-chart"
          >
            {loading ? (
              <ChartSkeleton />
            ) : (
              <div
                onMouseLeave={handleBarLeave}
                onTouchEnd={handleBarLeave}
                onTouchCancel={handleBarLeave}
                className="h-64 sm:h-72 md:h-80 relative"
              >
                {data.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                    <span className="text-gray-400">No data available</span>
                  </div>
                ) : (
                  <canvas
                    ref={chartRef}
                    height={isMobile ? 256 : isTablet ? 288 : 320}
                  ></canvas>
                )}
                {hoverMonth && hoverData && (
                  <div
                    className="absolute rounded-md p-2 sm:p-3 z-10"
                    style={{
                      left: (() => {
                        const tooltipWidth = isMobile ? 130 : 150;
                        const safetyMargin = 20;
                        const containerW = containerWidth || 0;

                        // Check if tooltip would go off the right edge
                        if (hoverPosition.x + tooltipWidth + safetyMargin > containerW) {
                          // Position to the left of cursor instead
                          return Math.max(hoverPosition.x - tooltipWidth - 10, safetyMargin);
                        }

                        // Default: position to the right of cursor
                        return Math.min(
                          hoverPosition.x + 10,
                          containerW - tooltipWidth - safetyMargin
                        );
                      })(),
                      top: (() => {
                        const tooltipHeight = 120;
                        const safetyMargin = 10;

                        // Check if tooltip would go off the top edge
                        if (hoverPosition.y - tooltipHeight < safetyMargin) {
                          // Position below cursor instead
                          return Math.min(hoverPosition.y + 10, 200);
                        }

                        // Default: position above cursor
                        return Math.max(hoverPosition.y - tooltipHeight, safetyMargin);
                      })(),
                      minWidth: isMobile ? "110px" : "120px",
                      maxWidth: isMobile ? "130px" : "150px",
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #E6E9EE",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                      pointerEvents: "none",
                    }}
                  >
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-semibold text-gray-700">
                          {hoverMonth}
                        </span>
                      </div>
                      {(
                        [
                          {
                            label: "Traffic",
                            key: "traffic",
                            color: "text-blue-600",
                            prefix: "",
                          },
                          {
                            label: "Leads",
                            key: "leads",
                            color: "text-blue-400",
                            prefix: "",
                          },
                          {
                            label: "Cases",
                            key: "cases",
                            color: "text-gray-600",
                            prefix: "",
                          },
                          {
                            label: "Revenue",
                            key: "revenue",
                            color: "text-purple-600",
                            prefix: CURRENCY_SYMBOL,
                          },
                        ] as const
                      )
                        .filter(({ key }) => effectiveSelected.has(key))
                        .map(({ label, key, color, prefix }) => {
                          const currentIndex = data.findIndex(
                            (d) => d.month === hoverMonth
                          );
                          const prevData =
                            currentIndex > 0
                              ? data[currentIndex - 1]
                              : undefined;
                          if (prevData) {
                            prevData.cases = prevData.deals; // add key "cases" with value from prevData.deals
                          }

                          const currentValue = hoverData[key];
                          const prevValue = prevData
                            ? prevData[key]
                            : undefined;
                          const numericValue =
                            typeof currentValue === "string"
                              ? parseFloat(currentValue)
                              : currentValue;
                          const numericPrevValue =
                            prevValue &&
                            (typeof prevValue === "string"
                              ? parseFloat(prevValue)
                              : prevValue);
                          const trend =
                            prevValue !== undefined
                              ? currentValue > prevValue
                                ? "↑"
                                : currentValue < prevValue
                                  ? "↓"
                                  : ""
                              : "";

                          return (
                            <div
                              key={label}
                              className="flex gap-0.5 items-center justify-between"
                            >
                              <span className="text-gray-500 text-xs pr-2">
                                {label}
                              </span>
                              <span className={`font-medium text-xs`}>
                                {prefix}
                                {numericValue?.toLocaleString()}
                                {trend && (
                                  <span
                                    className={`ml-0.5 ${trend === "↑"
                                      ? "text-green-500"
                                      : "text-red-500"
                                      }`}
                                  >
                                    {trend}
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
