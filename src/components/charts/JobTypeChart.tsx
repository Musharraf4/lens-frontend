"use client";

import {
  ArcElement as Arc,
  ArcElement,
  Chart,
  ChartData,
  ChartOptions,
  DoughnutController,
  Legend,
  Tooltip,
} from "chart.js";
import { DollarSign, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import DynamicTabs from "./DynamicTabs";
import { LSAJobTypeResponse } from "@/services/googleLSA.api";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

interface KPIByJobTypeChartProps {
  data?: LSAJobTypeResponse[];
  loading?: boolean;
}

const toTitle = (s: string) =>
  s
    .replace(/_/g, " ")
    .trim()
    .replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n);

const otherStripePlugin = {
  id: "otherStripe",
  afterDatasetDraw(chart: Chart) {
    const meta = chart.getDatasetMeta(0);
    const ctx = chart.ctx;
    meta.data.forEach((arc, idx) => {
      const label = chart.data.labels?.[idx];
      if (label !== "Other") return;

      const { x, y, innerRadius, outerRadius, startAngle, endAngle } = (
        arc as unknown as Arc
      ).getProps(
        ["x", "y", "innerRadius", "outerRadius", "startAngle", "endAngle"],
        true
      );

      const stripes = 80;
      const step = (endAngle - startAngle) / stripes;
      ctx.save();
      ctx.strokeStyle = "#D1D5DB";
      ctx.lineWidth = 1;

      for (let i = 0; i < stripes; i++) {
        const a = startAngle + i * step;
        ctx.beginPath();
        ctx.moveTo(
          x + innerRadius * Math.cos(a),
          y + innerRadius * Math.sin(a)
        );
        ctx.lineTo(
          x + outerRadius * Math.cos(a),
          y + outerRadius * Math.sin(a)
        );
        ctx.stroke();
      }
      ctx.restore();
    });
  },
};

Chart.register(otherStripePlugin);

export default function KPIByJobTypeChart({
  data,
  loading = false,
}: KPIByJobTypeChartProps) {
  const [selectedOption, setSelectedOption] = useState<"Leads" | "Revenue">(
    "Leads"
  );

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // 🔥 Choose metric dynamically
  const metricKey = selectedOption.toLowerCase() as "leads" | "revenue";

  const named: Record<string, number> = {};
  let otherSum = 0;

  data?.forEach((d) => {
    const { service_id } = d;
    const metricValue = d[metricKey]; // 👈 use leads or revenue

    const label = service_id?.trim();
    if (!label) {
      otherSum += metricValue;
      return;
    }
    const clean = toTitle(label);
    named[clean] = (named[clean] ?? 0) + metricValue;
  });

  const ranked = Object.entries(named).sort((a, b) => b[1] - a[1]);
  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3).reduce((s, [, v]) => s + v, 0);
  const rows =
    rest + otherSum > 0
      ? [...top3, ["Other", rest + otherSum] as const]
      : top3;

  const total = rows.reduce((s, [, v]) => s + v, 0);

  const palette = ["#A78BFA", "#60A5FA", "#A3E635"];
  const bgColors = rows.map(([l], i) =>
    l === "Other" ? "#ffffff00" : palette[i % palette.length]
  );

  useEffect(() => {
    if (loading) return;
    if (chartInstance.current) chartInstance.current.destroy();
    const ctx = chartRef.current?.getContext("2d");
    if (!ctx) return;

    const chartData: ChartData<"doughnut"> = {
      labels: rows.map(([l]) => l),
      datasets: [
        {
          data: rows.map(([, v]) => v),
          backgroundColor: bgColors,
          borderColor: "#fff",
          borderWidth: 4,
          borderRadius: 12,
        },
      ],
    };

    const opts: ChartOptions<"doughnut"> = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "75%",
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
    };

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: chartData,
      options: opts,
    });

    return () => chartInstance.current?.destroy();
  }, [rows, loading]); // 👈 rerender chart when rows change (metric toggled)

  const Skeleton = () => (
    <div className="flex flex-col md:flex-row gap-6 animate-pulse">
      <div className="relative w-[140px] h-[140px] mx-auto md:mx-0">
        <div className="w-full h-full rounded-full bg-gray-200" />
      </div>
      <div className="grid gap-2 w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
              <div className="h-4 w-28 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-10 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-4 flex flex-col w-full">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <p className="text-neutral-500">KPI’s by job types</p>
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
              metric={selectedOption}
              onTabChange={(key) =>
                setSelectedOption(key as "Leads" | "Revenue")
              }
            />
          </div>
        </div>
      </div>

      {loading ? (
        <Skeleton />
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative w-[140px] h-[140px] mx-auto md:mx-0">
            <canvas ref={chartRef} width={140} height={140} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gray-900">
                {fmt(total)}
              </span>
              <span className="text-xs text-gray-400">
                total {metricKey}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 w-full">
            {rows.map(([label, value], idx) => (
              <div
                key={label + idx}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        label === "Other"
                          ? "#D1D5DB"
                          : palette[idx % palette.length],
                    }}
                  />
                  <span className="truncate">{label}</span>
                </div>
                <span className="shrink-0">{fmt(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
