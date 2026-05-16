"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart as ChartJS, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";
import DynamicTabs from "./DynamicTabs";
import { IHourPerformance } from "@/services/googleAds.api";

// Register the matrix controller and its dependencies
ChartJS.register(MatrixController, MatrixElement, LinearScale, CategoryScale, Tooltip, Legend);


const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const hoursOfDay = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 === 0 ? 12 : i % 12;
  const period = i < 12 ? "am" : "pm";
  return `${hour}${period}`;
});

const transformDataForChart = (
  dataObj: Record<string, number[]>,
  min: number,
  max: number
) => {
  const matrixData = [];

  const range = max - min || 1; // Prevent divide by zero

  for (let dayIdx = 0; dayIdx < daysOfWeek.length; dayIdx++) {
    const dayName = daysOfWeek[dayIdx];
    const hourlyData = dataObj[dayName] || [];

    for (let hour = 0; hour < hourlyData.length; hour++) {
      const rawValue = hourlyData[hour];

      // Normalize value into 0–4 range
      const normalized = (rawValue - min) / range;
      const level = Math.min(Math.floor(normalized * 5), 4);

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


const transformToHeatmap = (
  data: IHourPerformance[] | [],
  metric: "roas" | "costPerLead"
): Record<string, number[]> => {
  const key = metric === "roas" ? "roas" : "cpl";

  const heatmap: Record<string, number[]> = {};

  data.forEach(({ day, hours }) => {
    const dayFormatted = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(); // e.g., "MONDAY" → "Monday"
    const hourValues = new Array(24).fill(0);

    hours.forEach((hourData) => {
      const hourIndex = hourData.hour;
      if (hourIndex >= 0 && hourIndex < 24) {
        hourValues[hourIndex] = hourData[key];
      }
    });

    heatmap[dayFormatted] = hourValues;
  });

  return heatmap;
};

interface PerformanceHeatmapChartProps {
  className?: string;
  data?: Record<string, number[]> | IHourPerformance[];
  loading?: boolean;
  isGAdPage?: boolean;
}

export default function PerformanceHeatmapChart({
  className,
  data,
  loading = false,
  isGAdPage = false
}: PerformanceHeatmapChartProps) {
  const [metric, setMetric] = React.useState<"roas" | "costPerLead">("roas");
  const [selectedOption, setSelectedOption] = useState("Leads");
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);
  const heatmap = Array.isArray(data) ? transformToHeatmap(data, metric) : data ?? {};
  const allValues = Object.values(heatmap).flat();

  // Find min and max values
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);

  const intensityLevels = [
    { label: `${minValue.toFixed(0)}-${((minValue + (maxValue - minValue) / 5)).toFixed(0)}`, color: "#f8f9fa", textColor: "#000" },
    { label: `${((minValue + (maxValue - minValue) / 5)).toFixed(0)}-${((minValue + 2 * (maxValue - minValue) / 5)).toFixed(0)}`, color: "#e9ecef", textColor: "#000" },
    { label: `${((minValue + 2 * (maxValue - minValue) / 5)).toFixed(0)}-${((minValue + 3 * (maxValue - minValue) / 5)).toFixed(0)}`, color: "#d8defa", textColor: "#000" },
    { label: `${((minValue + 3 * (maxValue - minValue) / 5)).toFixed(0)}-${((minValue + 4 * (maxValue - minValue) / 5)).toFixed(0)}`, color: "#9a9fef", textColor: "#fff" },
    { label: `${((minValue + 4 * (maxValue - minValue) / 5)).toFixed(0)}-${maxValue.toFixed(0)}`, color: "#5a5cd6", textColor: "#fff" },
  ];


  useEffect(() => {
    if (!chartRef.current || loading || !data) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const matrixData = transformDataForChart(
      Array.isArray(data) ? heatmap : data,
      minValue,
      maxValue
    );


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
            label: metric === "roas" ? "ROAS" : "Cost per Lead",
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
                return [`${day}, ${hour}`, `Value: ${point.actual}`];
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
  }, [data, metric, loading]);
  function PerformanceHeatmapSkeleton() {
    return (
      <Card style={{ border: 'none', boxShadow: 'none' }}>
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
    <Card className={className} style={{ boxShadow: 'none', border: 'none' }}>
      <CardHeader className="flex flex-col md:flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Daily performance</CardTitle>
        <div className="flex bg-gray-100 rounded-full mt-3 md:mt-0 w-fit border border-neutral-50 justify-center mx-auto md:mx-0 md:ml-auto">
          <DynamicTabs
            tabs={[
              { key: 'roas', label: 'ROAS', icon: '/Dollar_arrows.svg' },
              { key: 'costPerLead', label: 'Cost per Lead', icon: '/Dollar_arrows.svg' }
            ]}
            metric={metric}
            onTabChange={setMetric}
          />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {maxValue > 0 && (
          <div className="flex flex-wrap items-center justify-center sm:justify-end mb-4 gap-4">
            {intensityLevels.map((level, index) => (
              <div
                key={index}
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
        )}
        <div className="overflow-x-auto">
          <div style={{ height: "400px", minWidth: "1200px" }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
