import { useEffect, useRef, useState } from 'react';
import { Chart, registerables, ChartEvent } from 'chart.js/auto';
import { CURRENCY_SYMBOL } from '@/constants';

Chart.register(...registerables);

export interface RevenuePieChartProps {
  height?: number;
  width?: number;
}

interface PieChartSegment {
  name: string;
  value: number;
  color: string;
  leads: number;
}

export default function RevenuePieChart({ height = 400, width = 400 }: RevenuePieChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [activeTab, setActiveTab] = useState('revenue');
  const [hoveredSegment, setHoveredSegment] = useState<PieChartSegment | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sample data for the chart
  const campaignData: PieChartSegment[] = [
    { name: 'Barone', value: 95.5, color: '#8A70FF', leads: 250 },
    { name: 'Abstergo', value: 52.3, color: '#4285F4', leads: 180 },
    { name: 'Biffco Enterprises', value: 35.6, color: '#B3D936', leads: 120 },
    { name: 'Binford', value: 618.9, color: '#EEEEEE', leads: 540 }
  ];

  const processedData = campaignData.map(item => ({
    ...item,
    value: item.value ?? 0
  }));

  const totalRevenue = processedData.reduce((sum, campaign) => sum + campaign.value, 0).toFixed(1);
  const comparisonChange = -5; // Percentage change (negative for decrease)

  useEffect(() => {
    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!chartRef.current) return;
    const ctx = chartRef.current?.getContext('2d');
    if (ctx) {
      // Create new chart
      chartInstance.current = new Chart(chartRef.current, {
        type: 'doughnut',
        data: {
          labels: processedData.map((s: PieChartSegment) => s.name),
          datasets: [
            {
              data: processedData.map((s: PieChartSegment) =>
                activeTab === 'revenue' ? s.value : s.leads
              ),
              backgroundColor: processedData.map(campaign => campaign.color),
              borderWidth: 0,
              borderRadius: 6,
              hoverOffset: 5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '80%',
          radius: '95%',
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: false
            }
          },
          onClick: (event: ChartEvent, elements: any[], chartInstanceParam: Chart) => {
            const chart = chartInstance.current;

            if (elements && elements.length > 0) {
              const index = elements[0].index;
              setHoveredSegment(processedData[index]);
              setShowTooltip(true);

              if (event) {
                setTooltipPosition({
                  x: event?.x ?? 0,
                  y: event?.y ?? 0
                });
              }

              // Highlight the segment
              chart?.update();
            } else {
              setHoveredSegment(null);
              setShowTooltip(false);
            }
          },
          onHover: (event: ChartEvent, chartElement: any[]) => {
            if (chartElement && chartElement.length > 0) {
              const index = chartElement[0].index;
              setHoveredSegment(processedData[index]);
              setShowTooltip(true);

              if (event) {
                setTooltipPosition({
                  x: event?.x ?? 0,
                  y: event?.y ?? 0
                });
              }

              // Highlight the segment
              chartInstance.current?.update();
            } else {
              setHoveredSegment(null);
              setShowTooltip(false);
            }
          },
          layout: {
            padding: 10
          }
        }
      });

      // Draw the thin gray lines radiating outward
      drawLines(ctx);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [activeTab]);

  const drawLines = (ctx: CanvasRenderingContext2D) => {
    // Draw the radiating lines in the background
    if (!chartRef.current) return;
    const centerX = chartRef.current.width / 2;
    const centerY = chartRef.current.height / 2;
    const radius = Math.min(centerX, centerY) * 0.95;

    ctx.save();
    ctx.strokeStyle = '#F0F0F0';
    ctx.lineWidth = 1;

    // Draw radiating lines
    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI * 2 * i) / 60;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );
      ctx.stroke();
    }

    ctx.restore();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm w-full p-3 sm:p-6">
      <div className="flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <h2 className="text-base sm:text-lg text-gray-600 font-medium">Revenue by campaign</h2>

          {/* Tab controls */}
          <div className="flex bg-gray-100 rounded-full self-start sm:self-auto">
            <button
              className={`px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-full ${activeTab === 'leads' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
                }`}
              onClick={() => setActiveTab('leads')}
            >
              <span className="flex items-center">
                {activeTab === 'leads' && (
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V4C20 2.89543 19.1046 2 18 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                Leads
              </span>
            </button>
            <button
              className={`px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-full ${activeTab === 'revenue' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
                }`}
              onClick={() => setActiveTab('revenue')}
            >
              <span className="flex items-center">
                {activeTab === 'revenue' && (
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                Revenue
              </span>
            </button>
            <button
              className={`px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-full ${activeTab === 'roi' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
                }`}
              onClick={() => setActiveTab('roi')}
            >
              <span className="flex items-center">
                {activeTab === 'roi' && (
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 11V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 14V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M20 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                ROI
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Chart Container */}
          <div className="relative mx-auto md:mx-0" style={{
            height: `${typeof window !== 'undefined' && window.innerWidth < 768 ? Math.min(height, 250) : height}px`,
            width: `${typeof window !== 'undefined' && window.innerWidth < 768 ? Math.min(width, 250) : width}px`
          }}>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col z-10 pointer-events-none">
              <h2 className="text-medium font-bold">{CURRENCY_SYMBOL}{totalRevenue}k</h2>
              <div className="flex items-center mt-1">
                <span className={`text-xs sm:text-sm ${comparisonChange < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  <span className="flex items-center">
                    {comparisonChange < 0 ? (
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 15L12 9L18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {Math.abs(comparisonChange)}%
                  </span>
                </span>
                <span className="text-gray-400 text-xs sm:text-sm ml-1">total revenue</span>
              </div>
            </div>
            <canvas ref={chartRef} width={width} height={height} className="relative z-0"></canvas>

            {/* Tooltip for hovering over segments */}
            {showTooltip && hoveredSegment && (
              <div
                className="absolute bg-white rounded-md shadow-lg p-2 z-20 text-sm"
                style={{
                  left: tooltipPosition.x + 10,
                  top: tooltipPosition.y - 40
                }}
              >
                <div className="flex items-center gap-1">
                  {hoveredSegment.name === 'Barone' && (
                    <span className="text-green-500">+{CURRENCY_SYMBOL}11,7k</span>
                  )}
                  <svg className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 15L12 9L18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Campaign List */}
          <div className="mt-6 md:mt-0 md:ml-6 flex flex-col justify-center space-y-3 md:space-y-4 w-full md:min-w-[180px]">
            {processedData.map((campaign, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-2"
                    style={{ backgroundColor: campaign.color }}
                  ></div>
                  <span className="text-xs sm:text-sm text-gray-600">{campaign.name}</span>
                </div>
                <span className="text-xs sm:text-sm font-medium">{CURRENCY_SYMBOL}{campaign.value}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}