"use client";

import DynamicTabs from "@/components/charts/DynamicTabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";
import { DollarSign, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Register the matrix controller and its dependencies
ChartJS.register(MatrixController, MatrixElement, LinearScale, CategoryScale, Tooltip, Legend);

const intensityLevels = [
  { label: "0", color: "#f8f9fa", textColor: "#000" },
  { label: "1-10", color: "#e6e9ee", textColor: "#000" },
  { label: "11-20", color: "#cdd2da", textColor: "#000" },
  { label: "21-30", color: "#d8defa", textColor: "#000" },
  { label: "31-40", color: "#9a9fef", textColor: "#fff" },
  { label: "40+", color: "#5a5cd6", textColor: "#fff" },
];

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const hoursOfDay = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 === 0 ? 12 : i % 12;
  const period = i < 12 ? "am" : "pm";
  return `${hour}${period}`;
});

const transformDataForChart = (dataObj: Record<string, number[]>) => {
  const matrixData = [];

  for (let dayIdx = 0; dayIdx < daysOfWeek.length; dayIdx++) {
    const dayName = daysOfWeek[dayIdx];
    const hourlyData = dataObj[dayName] || Array(24).fill(0);

    for (let hour = 0; hour < hourlyData.length; hour++) {
      const rawValue = hourlyData[hour];
      let level = 0;
      if (rawValue === 0) {
        level = 0;
      } else if (rawValue <= 11) {
        level = 1;
      } else if (rawValue <= 21) {
        level = 2;
      } else if (rawValue <= 31) {
        level = 3;
      } else if (rawValue <= 41) {
        level = 4;
      } else {
        level = 5;
      }

      matrixData.push({
        x: hour,
        y: dayIdx,
        v: level,
        actual: rawValue,
      });
    }
  }

  return matrixData;
};

interface PerformanceHeatmapChartProps {
  className?: string;
  data?: {
    leads?: Record<string, number[]>;
    revenue?: Record<string, number[]>;
  };
  loading?: boolean;
}

export default function LSAHeatMap({
  className,
  data,
  loading = false,
}: PerformanceHeatmapChartProps) {
  const [metric, setMetric] = useState("Revenue");
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  // Fallback data if data is undefined or incomplete
  const defaultData: Record<string, number[]> = {
    Sunday: Array(24).fill(0),
    Monday: Array(24).fill(0),
    Tuesday: Array(24).fill(0),
    Wednesday: Array(24).fill(0),
    Thursday: Array(24).fill(0),
    Friday: Array(24).fill(0),
    Saturday: Array(24).fill(0),
  };

  // Select data based on the metric, with fallback
  const chartData = data ? (metric === "Leads" ? data.leads : data.revenue) : defaultData;

  useEffect(() => {
    if (!chartRef.current || loading || !chartData) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const matrixData = transformDataForChart(chartData);

    const minWidth = 1200;
    const containerWidth = Math.max(
      minWidth,
      chartRef.current.parentElement?.clientWidth || minWidth
    );

    chartRef.current.style.width = `${containerWidth}px`;
    chartRef.current.style.height = "400px";

    chartInstance.current = new ChartJS(ctx, {
      type: "matrix",
      data: {
        datasets: [
          {
            label: metric,
            data: matrixData,
            backgroundColor(context) {
              const value = (context.dataset.data[context.dataIndex] as any).v;
              return intensityLevels[value].color;
            },
            borderColor: "#ffffff",
            borderWidth: 1,
            width: () => containerWidth / 24 - 1,
            height: () => 400 / 7 - 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "linear",
            offset: true,
            min: 0,
            max: 23,
            position: "bottom",
            ticks: {
              display: true,
              stepSize: 1,
              callback: (value) => hoursOfDay[value as number],
              font: { size: 11, family: "system-ui" },
              color: "#64748b",
              padding: 8,
              autoSkip: false,
            },
            grid: {
              display: true,
              drawOnChartArea: true,
              drawTicks: false,
              color: "#e2e8f0",
              lineWidth: 0.5,
            },
            border: {
              display: true,
              color: "#94a3b8",
              width: 1,
            },
          },
          y: {
            type: "linear",
            offset: true,
            min: 0,
            max: 6,
            reverse: true,
            ticks: {
              display: true,
              stepSize: 1,
              callback: (value) => daysOfWeek[value as number],
              font: { size: 12, family: "system-ui" },
              color: "#64748b",
              padding: 8,
              autoSkip: false,
            },
            grid: {
              display: true,
              drawOnChartArea: true,
              drawTicks: false,
              color: "#e2e8f0",
              lineWidth: 0.5,
            },
            border: {
              display: true,
              color: "#94a3b8",
              width: 1,
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              title() {
                return "";
              },
              label(context: any) {
                const point = context.dataset.data[context.dataIndex];
                const day = daysOfWeek[point.y];
                const hour = hoursOfDay[point.x];
                return [
                  `${day}, ${hour}`,
                  `${metric}: ${point.actual}`,
                ];
              },
            },
          },
          legend: {
            display: false,
          },
        },
      },
    });

    return () => {
      chartInstance.current?.destroy();
    };
  }, [chartData, metric, loading]);

  function PerformanceHeatmapSkeleton() {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="flex items-center space-x-2">
            <div className="h-8 w-14 bg-gray-200 rounded" />
            <div className="h-8 w-20 bg-gray-200 rounded" />
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-center justify-end mb-4 space-x-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-1"
              >
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <div className="h-3 w-10 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <div style={{ height: "400px", minWidth: "1200px" }}>
              <div className="grid grid-cols-24 grid-rows-7 gap-px w-full h-full animate-pulse">
                {Array.from({ length: 7 }).map((_, row) =>
                  Array.from({ length: 24 }).map((_, col) => (
                    <div
                      key={`${row}-${col}`}
                      className="bg-gray-200"
                      style={{ width: "100%", height: "100%" }}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <PerformanceHeatmapSkeleton />;
  }

  return (
    <div className="bg-white rounded-3xl p-4">
      <div className="mb-5 flex justify-between flex-wrap gap-3 items-center">
        <p className="text-neutral-500">Daily KPI's</p>
        <div>
          <div className="flex bg-gray-100 rounded-full w-fit border border-neutral-50 justify-center mx-auto align-center text-center m-0">
            <DynamicTabs
              tabs={[
                {
                  key: "Leads",
                  label: "Leads",
                  icon: <img src="/Hand-heart.svg" />,
                },
                {
                  key: "Revenue",
                  label: "Revenue",
                  icon: <DollarSign className="h-3 w-3" />,
                },
              ]}
              metric={metric}
              onTabChange={setMetric}
            />
          </div>
        </div>
      </div>
      <CardContent className="pb-4" data-tour="lsa-heatmap">
        <div className="flex sm:flex-row flex-col justify-end mb-4 space-x-4 flex-wrap gap-2">
          {intensityLevels.slice(1).map((level, index) => (
            <div
              key={index + 1}
              className="flex items-center space-x-1"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: level.color }}
              />
              <span className="text-xs text-muted-foreground">{level.label}</span>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <div style={{ height: "400px", minWidth: "1200px" }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
