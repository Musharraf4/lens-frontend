'use client';

import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import type { ChartData, ChartDataset } from 'chart.js';

type Bucket = 'month' | 'day';

interface LineChartProps {
  loading: boolean;
  data?: ChartData<'line'>;
  className?: string;
  bucketOverride?: Bucket;
}

const COLOR_MAP: Record<string, string> = {
  Calls: '#866FFA',
  Forms: '#F259FF',
  Chats: '#62D8FE',
};

const skeletonAnimation = `
@keyframes shimmer {
  0%   { background-position:-100% 0; }
  100% { background-position: 100% 0; }
}
.skeleton-gradient {
  background: linear-gradient(90deg, #F7F9FB 0%, #E6E9EE 50%, #F7F9FB 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
}
}`;

const upTrend = (arr: number[], idx: number) =>
  idx === 0 ? true : arr[idx] >= arr[idx - 1];

const LineChart: React.FC<LineChartProps> = ({
  loading,
  data,
  className,
  bucketOverride,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [legendLabels, setLegendLabels] = useState<{ label: string; color: string }[]>([]);
  const maxValue = Math.max(
    ...((data?.datasets?.flatMap(item =>
      item.data.filter((v): v is number => typeof v === 'number')
    ).flat() ?? [0]))
  );
  const roundedMax = Math.ceil(maxValue / 10) * 10;
  useEffect(() => {
    if (loading) return; // Don't initialize chart if loading

    if (!canvasRef.current) return;

    chartRef.current?.destroy();
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const bucket: Bucket = bucketOverride ?? (data?.labels?.length ?? 12) <= 31 ? 'day' : 'month';
    const raw: ChartData<'line'> = data!;

    const styled: ChartData<'line'> = {
      labels: raw.labels,
      datasets: raw.datasets.map((ds) => {
        const color = (ds as any).borderColor ?? COLOR_MAP[ds.label as string] ?? '#866FFA';
        return {
          tension: 0.4,
          fill: false,
          borderWidth: 1,
          pointRadius: 0,
          pointHoverRadius: 4,
          backgroundColor: color,
          borderColor: color,
          ...ds,
        } as ChartDataset<'line'>;
      }),
    };

    setLegendLabels(
      styled.datasets.map((ds) => ({
        label: ds.label as string,
        color: (ds as any).borderColor ?? COLOR_MAP[ds.label as string] ?? '#866FFA',
      })),
    );

    const externalTooltip = (context: any) => {
      let el = document.getElementById('chartjs-custom-tooltip');
      if (!el) {
        el = document.createElement('div');
        el.id = 'chartjs-custom-tooltip';
        document.body.appendChild(el);
      }

      const { chart, tooltip } = context;
      if (tooltip.opacity === 0) {
        el.style.opacity = '0';
        return;
      }

      const { datasetIndex, dataIndex } = tooltip.dataPoints[0];
      const val = tooltip.dataPoints[0].parsed.y as number;
      const ds = chart.data.datasets[datasetIndex] as any;
      const isUp = upTrend(ds.data as number[], dataIndex);

      const arrow = isUp
        ? '<svg width="16" height="16" fill="#10B981" viewBox="0 0 320 512"><path d="M160 144l128 160H32z"/></svg>'
        : '<svg width="16" height="16" fill="#EF4444" viewBox="0 0 320 512"><path d="M160 368l-128-160h256z"/></svg>';

      el.innerHTML = `
        <span style="font-size:14px;font-weight:274;color:#707889;margin-right:auto">${tooltip.title[0]}</span>
        <span style="display:flex;align-items:center;gap:7px">
          <span style="font-size:14px;font-weight:590;color:#030C23">${val}</span>${arrow}
        </span>
      `;

      Object.assign(el.style, {
        opacity: '1',
        pointerEvents: 'none',
        position: 'absolute',
        zIndex: '1000',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.56)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid #E6E9EE',
        borderRadius: '12px',
        width: '139px',
        height: '32px',
        gap: '8px',
        padding: '8px',
        fontFamily: 'inherit',
        boxShadow: '0 4px 24px 0 rgba(30,41,59,0.10)',
        transition: 'all .1s cubic-bezier(.25,.8,.25,1)',
      });

      el.style.left =
        window.scrollX +
        chart.canvas.getBoundingClientRect().left +
        tooltip.caretX -
        el.offsetWidth +
        'px';

      el.style.top =
        window.scrollY +
        chart.canvas.getBoundingClientRect().top +
        tooltip.caretY -
        el.offsetHeight -
        16 +
        'px';
    };

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: styled,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'nearest', intersect: false },
        scales: {
          y: {
            beginAtZero: true,
            max: roundedMax,
            ticks: { color: '#94a3b8', padding: 10, stepSize: 10 },
            grid: { color: 'rgba(148,163,184,0.1)', drawBorder: false },
            border: { display: false },
          },
          x: {
            grid: { display: false, drawBorder: false },
            ticks: {
              color: '#94a3b8',
              padding: 10,
              maxTicksLimit: bucket === 'day' ? 8 : undefined,
              autoSkip: bucket === 'day',
            },
            border: { display: false },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            external: externalTooltip,
            callbacks: {
              title: (items: any) => items[0].dataset.label,
              label: (ctx: any) =>
                `${ctx.parsed.y} ${upTrend(ctx.dataset.data as number[], ctx.dataIndex) ? '▲' : '▼'
                }`,
              labelTextColor: () => '#10B981',
            },
          },
        },
      },
    } as any);

    return () => chartRef.current?.destroy();
  }, [loading, data, bucketOverride]);

  const Legend = ({ color, label }: { color: string; label: string }) => (
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
      <span className="text-[#64748b] text-sm font-medium">{label}</span>
    </div>
  );

  if (loading) {
    return (
      <div className={`w-full h-[300px] bg-white rounded-lg shadow-sm p-4 ${className ?? ''}`}>
        <style>{skeletonAnimation}</style>
        <div className="flex gap-6 mb-4 mt-2 flex-wrap">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="skeleton-gradient w-3 h-3 rounded-full inline-block" />
              <span className="skeleton-gradient w-20 h-4 rounded-md" />
            </div>
          ))}
        </div>
        <div className="w-full h-[240px] skeleton-chart rounded-md" />
      </div>
    );
  }

  return (
    <div className={`w-full h-[300px] bg-white rounded-3xl p-4 ${className ?? ''}`}>
      <div className="flex gap-6 mb-4 mt-2">
        {legendLabels.map((item) => (
          <Legend key={item.label} color={item.color} label={item.label} />
        ))}
      </div>
      <div className="w-full h-[240px]">
        <canvas ref={canvasRef} style={{ cursor: 'pointer' }} />
      </div>
    </div>
  );
};

export default LineChart;
