"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type { Chart, ChartEvent, ActiveElement } from "chart.js";
import { ChartDataset } from "chart.js";
import { ChartDataBase } from "@/types";
import { SkeletonBarChart } from "./Skeleton";

interface BaseStackedChartProps {
  data?: ChartDataBase[];
  loading?: boolean;
}

export default function BaseStackedChart({
  data: monthlyData = [],
  loading = false,
}: BaseStackedChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const chartContainer = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  const colorPalette = ["#4285F4", "#A8C7FA"];
  const getColor = (i: number) => colorPalette[i % colorPalette.length];
  const metricKeys: Array<keyof ChartDataBase> = ["leads", "deals"];

  const checkIfMobile = useCallback(() => window.innerWidth < 768, []);
  const formatLabel = (key: string) =>
    key.charAt(0).toUpperCase() + key.slice(1);

  const showTooltip = useCallback(
    (month: string, data: ChartDataBase, pos: { x: number; y: number }) => {
      if (!tooltipRef.current || containerWidth == null) return;

      tooltipRef.current.innerHTML = `
        <div class="font-semibold mb-2">${month}</div>
        ${metricKeys
          .map((item) => (item === "deals" ? "cases" : item))
          .map(
            (k) => `
          <div class="flex justify-between">
            <span>${formatLabel(k)}</span>
            <span>${(k == "cases"
                ? data["deals"]
                : (data[k] as number)
              ).toFixed(1)}</span>
          </div>`
          )
          .join("")}
      `;
      tooltipRef.current.style.display = "block";
      tooltipRef.current.style.left = `${Math.min(
        pos.x + 10,
        containerWidth - 130
      )}px`;
      tooltipRef.current.style.top = `${Math.max(pos.y - 100, 10)}px`;
    },
    [containerWidth]
  );

  const hideTooltip = useCallback(() => {
    if (tooltipRef.current) tooltipRef.current.style.display = "none";
  }, []);

  const initChart = useCallback(async () => {
    if (typeof window === "undefined" || !monthlyData.length) return;

    const { Chart, registerables } = await import("chart.js");
    Chart.register(...registerables);

    chartInstance.current?.destroy();
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const labels = monthlyData.map(({ month }) =>
      checkIfMobile() ? month.charAt(0) : month
    );

    const datasets = metricKeys.map((key, index) => ({
      label: formatLabel(key),
      data: monthlyData.map((d) => Number(d[key]) || 0),
      backgroundColor: getColor(index),
      borderColor: "#ffffff",
      borderWidth: 3,
      borderRadius: 8,
      type: "bar",
      order: index,
    })) as ChartDataset<"bar", number[]>[];

    const chart = new Chart(ctx, {
      type: "bar",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, beginAtZero: true, grid: { color: "#F0F0F0" } },
        },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        onHover: (
          evt: ChartEvent,
          els: ActiveElement[],
          chartInstanceParam: Chart
        ) => {
          if (!evt.native) {
            hideTooltip();
            return;
          }

          const { offsetX, offsetY } = evt.native as MouseEvent;
          const { left, right, top, bottom } = chartInstanceParam.chartArea;
          const isInsideChartArea =
            offsetX >= left &&
            offsetX <= right &&
            offsetY >= top &&
            offsetY <= bottom;
          if (!isInsideChartArea) {
            hideTooltip();
            return;
          }

          const targetElements =
            els.length > 0
              ? els
              : chartInstanceParam.getElementsAtEventForMode(
                evt as unknown as Event,
                "index",
                { intersect: false },
                false
              );

          if (targetElements.length) {
            const barIndex = targetElements[0].index;
            const month = monthlyData[barIndex].month;
            showTooltip(month, monthlyData[barIndex], {
              x: offsetX,
              y: offsetY,
            });
          } else {
            hideTooltip();
          }
        },
      },
    });

    chartInstance.current = chart;
  }, [monthlyData, checkIfMobile, showTooltip, hideTooltip]);

  useEffect(() => {
    if (!loading && monthlyData.length) initChart();
  }, [loading, monthlyData, initChart]);

  useEffect(() => {
    if (chartContainer.current)
      setContainerWidth(chartContainer.current.clientWidth);
  }, []);

  return (
    <div className="bg-white rounded-3xl w-full p-4 md:p-6">
      <div className="flex flex-wrap gap-3 md:gap-6 mb-4">
        {metricKeys
          .map((item) => (item === "deals" ? "cases" : item))
          .map((k, i) => (
            <div key={k} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getColor(i) }}
              />
              <span className="text-sm text-gray-700">{formatLabel(k)}</span>
            </div>
          ))}
      </div>

      <div className="relative h-64 md:h-80" ref={chartContainer}>
        {loading ? <SkeletonBarChart /> : monthlyData?.length === 0 ? <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <span className="text-gray-400">No data available</span>
        </div> : <canvas ref={chartRef} />}

        <div
          ref={tooltipRef}
          className="absolute bg-white shadow-md rounded-md p-2 text-xs z-10 pointer-events-none"
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
