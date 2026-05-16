import { useCallback, useEffect, useRef, useState } from 'react';
import { Chart, registerables, ChartEvent } from 'chart.js/auto';
import DynamicTabs from './DynamicTabs';
import { CURRENCY_SYMBOL } from '@/constants';
Chart.register(...registerables);

export type Tab = 'revenue' | 'leads' | 'roi' | 'roas' | 'costPerLead';

export interface PieChartSegment {
  name: string;
  value: number;
  color: string;
  leads: number;
  cost: number;
  cpl: number;
  roas: number;
  roi: number;
}

export interface RevenuePieChartProps {
  height?: number;
  width?: number;
  data: PieChartSegment[];
  totalRevenue?: number;
  totalLeads?: number;
  totalRoi?: number;
  totalCpl?: number;
  totalRoas?: number;
  comparisonChange?: number;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  title?: string;
  isInsight?: boolean;
}

export default function RevenuePieChart({
  height = 400,
  width = 400,
  data,
  totalRevenue,
  totalLeads,
  totalRoi,
  comparisonChange = 0,
  activeTab,
  onTabChange,
  title,
  totalCpl,
  totalRoas,
  isInsight = false
}: RevenuePieChartProps) {
  const [isMobile, setIsMobile] = useState(false);
  const checkScreenSize = useCallback(() => {
    const width = window.innerWidth;
    setIsMobile(width < 1000);
  }, []);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; value: number } | null>(null);
  const [screenW, setScreenW] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const onResize = () => setScreenW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    checkScreenSize();
    // Listen for resize events
    window.addEventListener("resize", checkScreenSize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [checkScreenSize]);
  const total = activeTab === 'leads'
    ? totalLeads
    : activeTab === 'roi'
      ? totalRoi
      : activeTab === 'roas'
        ? totalRoas
        : activeTab === 'costPerLead'
          ? totalCpl
          : totalRevenue;
  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current?.destroy();
    const ctx = chartRef.current.getContext('2d')!;

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.name),
        datasets: [
          {
            data: data.map(d =>
              activeTab === 'revenue' ? d.value
                : activeTab === 'leads' ? d.leads
                  : activeTab === 'roas' ? d.roas
                    : activeTab === 'costPerLead' ? d.cpl
                      : d.value                // ROI
            ),
            backgroundColor: data.map(d => d.color),
            borderWidth: 0,
            borderRadius: 6,
            hoverOffset: 6,
            spacing: 5,
          }
        ]
      },
      options: {
        responsive: true,
        cutout: '75%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        onHover: (event: ChartEvent, chartElements: any[]) => {
          if (!chartElements?.length || !event.native) {
            setTooltipData(null);
            return;
          }

          const datasetIndex = chartElements[0].datasetIndex;
          const index = chartElements[0].index;
          const meta = chartInstance.current?.getDatasetMeta(datasetIndex);
          const element = meta?.data[index];

          if (!element) {
            setTooltipData(null);
            return;
          }

          const position = (element as any).getCenterPoint();
          const value = chartInstance.current?.data.datasets[datasetIndex].data[index];

          if (typeof value === 'number') {
            setTooltipData({ x: position.x, y: position.y, value });
          } else {
            setTooltipData(null);
          }
        }
      }
    });
    chartRef.current?.addEventListener('mouseleave', () => setTooltipData(null));

    return () => { chartInstance.current?.destroy(); };
  }, [activeTab, data]);

  const chartSize = Math.min(
    screenW < 480 ? 230
      : screenW < 768 ? 300
        : 350,
    width
  );
  const btnClass = (tab: Tab) =>
    [
      'flex  items-center gap-1 px-2 md:px-4 py-1.5 sm:py-2 text-xs md:text-sm rounded-full',
      activeTab === tab ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
    ].join(' ');
  return (
    <div className="bg-white rounded-xl w-full p-3 sm:p-4 md:p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-base sm:text-lg text-gray-600 font-medium">
          {title ?? 'Revenue by campaign'}
        </h2>

        <div className="flex bg-gray-100 rounded-full mt-3 md:mt-0 w-fit border border-neutral-50 justify-center mx-auto md:mx-0 md:ml-auto">
          {isInsight ? (
            <DynamicTabs
              tabs={[
                { key: 'roas', label: 'ROAS', icon: '/Dollar_arrows.svg' },
                { key: 'costPerLead', label: 'Cost per Lead', icon: '/Dollar_arrows.svg' }
              ]}
              metric={activeTab}
              onTabChange={onTabChange}
            />
          ) : (
            <>
              <button className={btnClass('leads')} onClick={() => onTabChange('leads')}>
                {activeTab === 'leads' && <img src='/Hand-heart.svg' />} Leads
              </button>
              <button className={btnClass('revenue')} onClick={() => onTabChange('revenue')}>
                {activeTab === 'revenue' && <img src='/Hand-heart.svg' />} Revenue
              </button>
              <button className={btnClass('roi')} onClick={() => onTabChange('roi')}>
                {activeTab === 'roi' && <img src='/Hand-heart.svg' />} ROI
              </button>
            </>
          )}
        </div>
      </div>


      <div className="flex flex-col lg:flex-row items-center overflow-auto pt-6 h-[84%]">
        {/* Chart on the left */}
        <div className="relative mx-auto mb-4 md:mb-0" style={{ width: chartSize, height: chartSize }}>
          {((data.length === 0) || data.every(d => {
            const value =
              activeTab === 'revenue' ? d.value
                : activeTab === 'leads' ? d.leads
                  : activeTab === 'roas' ? d.roas
                    : activeTab === 'costPerLead' ? d.cpl
                      : d.value; // fallback for ROI

            return value === 0;
          })) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-50 h-50 border-20 border-gray-200 rounded-full"></div>
              </div>
            )}

          <canvas ref={chartRef} width={chartSize} height={chartSize} />

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <h2 className="text-2xl font-bold">
              {/* {activeTab === 'roi'
                ? `${total?.toFixed(2)}`
                : */}
              {`${activeTab !== 'roas' ? CURRENCY_SYMBOL : ''}${total?.toFixed(1)} ${Number(total) > 1000 ? 'k' : ''}`}
            </h2>
            {/* <span className={`text-sm ${comparisonChange < 0 ? 'text-red-500' : 'text-green-500'}`}>
              {comparisonChange < 0 ? '▼' : '▲'} {Math.abs(comparisonChange)}%
            </span> */}
          </div>
          {tooltipData && (
            <div
              className="absolute bg-gray-100 opacity-90 rounded-md shadow text-xs sm:text-sm py-1 px-2 sm:px-3 flex items-center"
              style={{
                top: tooltipData.y,
                left: tooltipData.x,
                transform: 'translate(-50%, -150%)',
                pointerEvents: 'none',
                zIndex: '10000 !important',
              }}
            >
              {activeTab !== 'roas' ? CURRENCY_SYMBOL : ''}{(tooltipData.value).toFixed(1)}
            </div>
          )}
        </div>

        {/* Data / Text on the right */}
        <div className="mt-4 md:mt-0 flex-1 ml-0 md:ml-6 space-y-2">
          {data.map((c, i) => (
            <div key={i} className="flex justify-between items-center w-full">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2" style={{ background: c.color }} />
                <span className="text-gray-600">{c.name}</span>
              </div>
              <span className="font-medium">
                {activeTab !== 'roas' ? CURRENCY_SYMBOL : ''}
                {c.value > 1000
                  ? (c.value / 1000).toFixed(2) + 'k'
                  : c.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
