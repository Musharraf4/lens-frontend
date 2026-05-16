"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js/auto";
import { FunnelController, TrapezoidElement } from "chartjs-chart-funnel";
import { Skeleton } from "../ui/skeleton";

// Register the required components
Chart.register(...registerables, FunnelController, TrapezoidElement);

interface MetricDetail {
  name: string;
  value: number;
  change: number;
  changeValue: number;
  color: string | object;
}

interface HorizontalHalfFunnelChartProps {
  title?: string;
  metrics: MetricDetail[];
  loading: boolean;
  configId: string;
  date_range: string;
  isDashboardChangeOverviewLoading?: boolean;
}

export default function HorizontalHalfFunnelChart({
  title = "Marketing Funnel",
  metrics,
  loading,
  isDashboardChangeOverviewLoading
}: HorizontalHalfFunnelChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  useEffect(() => {
    if (loading || isDashboardChangeOverviewLoading) return;

    const initChart = async () => {
      try {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        if (!chartRef.current) return;

        const ctx = chartRef.current.getContext("2d");
        if (!ctx) return;
        const values = metrics.map((m) => m.value);
        const max = Math.max(...values);
        const min = Math.min(...values.filter((v) => v > 0));
        // Create the chart
        chartInstance.current = new Chart(ctx, {
          type: "funnel",
          data: {
            labels: metrics.map((metric) => metric.name),
            datasets: [
              {
                data: metrics.map(({ value }) =>
                  value > 0 ? Math.pow(Math.max(value, 1), 0.4) : 0
                ),
                backgroundColor: metrics.map((metric) => metric.color),
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "x", // Make it horizontal
            align: "left",
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  title: function (tooltipItem) {
                    return metrics[tooltipItem[0].dataIndex].name;
                  },
                  label: function (tooltipItem) {
                    const originalValue = metrics[tooltipItem.dataIndex].value;
                    return `Value: ${originalValue.toLocaleString()}`;
                  },
                },
              },
            },
            scales: {
              x: {
                display: false,
                grid: {
                  display: false,
                },
              },
              y: {
                display: false,
                grid: {
                  display: false,
                },
              },
            },
            elements: {
              trapezoid: {
                // This makes it a "half funnel" by aligning all elements to the left
                // align: "left",
                // Add rounded corners to the trapezoids
                borderRadius: 10,
              },
            },
          },
        });

        return () => {
          if (chartInstance.current) {
            chartInstance.current.destroy();
          }
        };
      } catch (error) {
        console.error("Failed to initialize chart:", error);
      }
    };

    initChart();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [loading, isDashboardChangeOverviewLoading, metrics]);

  const ChartSkeleton = ({ height }: { height: number | string }) => (
    <div className={`h-${height} animate-pulse flex items-center`}>
      <div
        className="w-80 bg-gray-100 h-full rounded-lg"
        style={{
          clipPath: "polygon(0% 0%, 100% 50%, 100% 100%, 0% 100%)",
        }}
      ></div>
    </div>
  );

  const formatChangeValue = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000) {
      return `${(absValue / 1000).toFixed(1).toLocaleString()}k`;
    }
    return absValue.toFixed(1);
  };

  return (
    <div className="p-6 rounded-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="flex flex-col border-b pb-2 sm:pb-3">
            <span className="text-sm sm:text-base font-normal text-[#707889] mb-1 break-words">
              {metric.name}
            </span>
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between sm:flex-wrap gap-y-1">
              <span className="break-words text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-semibold text-[#030C23]">
                {metric.value.toLocaleString()}
              </span>
              {isDashboardChangeOverviewLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <div
                  className={`mt-1 sm:mt-0 sm:ml-2 flex flex-wrap items-center text-xs sm:text-sm ${metric.change > 0
                    ? "text-green-500"
                    : metric.change < 0
                      ? "text-red-500"
                      : "text-gray-500"
                    }`}
                >
                  <span className="mr-1">
                    {metric.change > 0 ? "↑" : metric.change < 0 ? "↓" : ""}
                  </span>
                  <span>{Math.abs(metric.change).toFixed(1)}%</span>
                  <span className="ml-1 text-gray-400">
                    {metric.changeValue >= 0 ? "+" : "-"}
                    {formatChangeValue(metric.changeValue)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="relative w-full h-[200px]">
        {loading || isDashboardChangeOverviewLoading ? (
          <div className="p-4 h-full flex flex-row gap-4 items-end overflow-x-hidden">
            <ChartSkeleton height={"full"} />
            <ChartSkeleton height={24} />
            <ChartSkeleton height={12} />
            <ChartSkeleton height={6} />
          </div>
        ) : (
          <div className="h-full w-full">
            {metrics?.every((metric) => metric.value === 0) ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No data available</p>
              </div>
            ) : <canvas ref={chartRef}></canvas>}

          </div>
        )}
      </div>
    </div>
  );
}
