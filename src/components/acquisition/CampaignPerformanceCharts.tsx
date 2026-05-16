import { useEffect, useRef, useState } from 'react';
import { Chart, ChartEvent, registerables } from 'chart.js';
import { ChevronUp, Users, DollarSign, BarChart2 } from 'lucide-react';

Chart.register(...registerables);

const viewData = {
  campaigns: {
    title: 'Lowest performing campaigns',
    labels: ['Barone', 'Abstergo', 'Biffco Enterprises', 'Binford', 'Big Kahuna Burger'],
    leads: [10005, 8732, 5348, 1769, 745],
    revenue: [10005, 8732, 5348, 1769, 745],
    roi: [12.3, 9.7, 6.2, 3.5, 1.2],
    color: '#BBCBFF',
  },
  zipcodes: {
    title: 'Top performing zip-codes',
    labels: ['32258', '32277', '32254', '32256', '32221'],
    leads: [8732, 7456, 5348, 2890, 1245],
    revenue: [10005, 8732, 5348, 1769, 745],
    roi: [14.5, 10.2, 8.3, 4.7, 2.1],
    color: '#D8FF8B',
  },
  topKeywords: {
    title: 'Top keywords',
    labels: ['Law firm global', 'Global law firm', 'Law firm', 'Law firm in Georgia', 'Georgia layers'],
    leads: [8567, 7231, 5877, 2345, 975],
    revenue: [10005, 8732, 5348, 1769, 745],
    roi: [18.2, 15.7, 9.8, 5.2, 2.4],
    color: '#D8CBFF',
  },
  lowestKeywords: {
    title: 'Lowest keywords',
    labels: ['Georgia layers', 'Law firm in Georgia', 'Law firm', 'Global law firm', 'Law firm global'],
    leads: [10005, 8732, 5348, 1769, 745],
    revenue: [3456, 4532, 6789, 8123, 9872],
    roi: [3.1, 4.3, 6.7, 9.2, 12.5],
    color: '#FFE58B',
  },
};

export default function CampaignPerformanceCharts({ viewKey }: { viewKey: string }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [activeTab, setActiveTab] = useState('leads');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredBarData, setHoveredBarData] = useState<{ label: string; value: number; change: string | null } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const currentViewData = viewData[viewKey as keyof typeof viewData];

  const getActiveData = () => {
    switch (activeTab) {
      case 'leads':
        return currentViewData.leads;
      case 'revenue':
        return currentViewData.revenue;
      case 'roi':
        return currentViewData.roi;
      default:
        return currentViewData.leads;
    }
  };

  const formatValue = (value: number) => {
    if (activeTab === 'roi') return `${value}%`;
    if (activeTab === 'revenue') return `$${value.toLocaleString()}`;
    return value.toLocaleString();
  };

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    const data = getActiveData();
    const labels = currentViewData.labels;

    chartInstance.current = new Chart(ctx as CanvasRenderingContext2D, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: currentViewData.color,
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.7,
            categoryPercentage: 0.8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        onHover: (event: ChartEvent, elements) => {
          if (elements?.length) {
            const index = elements[0].index;
            setHoveredIndex(index);
            setHoveredBarData({
              label: labels[index],
              value: data[index],
              change: index === 2 ? '+1%' : null,
            });

            if (event && event.native) {
              setTooltipPosition({
                x: event?.x ?? 0,
                y: event?.y ?? 0
              });
            }
          } else {
            setHoveredIndex(null);
            setHoveredBarData(null);
          }
        },
        scales: {
          x: { display: false, grid: { display: false } },
          y: { display: false, grid: { display: false }, beginAtZero: true },
        },
        layout: {
          padding: { top: 15, bottom: 10 },
        },
      },
    });

    return () => {
      chartInstance.current?.destroy();
    };
  }, [activeTab, viewKey]);

  return (
    <div className="bg-white rounded-xl shadow-sm w-full max-w-md">
      <div className="p-5">
        <h2 className="text-gray-500 text-lg font-normal mb-4">{currentViewData.title}</h2>

        <div className="flex bg-gray-100 rounded-full mb-6">
          {['leads', 'revenue', 'roi'].map((tab) => (
            <button
              key={tab}
              className={`flex items-center px-4 py-2 text-sm rounded-full ${activeTab === tab ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
                }`}
              onClick={() => setActiveTab(tab)}
            >
              {activeTab === tab && (
                <>
                  {tab === 'leads' && <Users size={16} className="mr-1" />}
                  {tab === 'revenue' && <DollarSign size={16} className="mr-1" />}
                  {tab === 'roi' && <BarChart2 size={16} className="mr-1" />}
                </>
              )}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative h-44 mb-2">
          <canvas ref={chartRef} />
          {hoveredBarData && hoveredIndex === 2 && (
            <div
              className="absolute bg-gray-100 bg-opacity-90 rounded-md shadow z-20 text-sm py-1 px-3 flex items-center"
              style={{
                left: tooltipPosition.x - 20,
                top: tooltipPosition.y - 30,
              }}
            >
              <span className="text-green-500 font-medium mr-1">+1%</span>
              <ChevronUp size={14} className="text-green-500" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          {currentViewData.labels.map((label, index) => (
            <div
              key={index}
              className={`flex justify-between py-2 px-1 ${index % 2 === 1 ? 'bg-gray-50' : ''} ${hoveredIndex === index ? 'bg-blue-500 text-white' : ''}`}
            >
              <span>{label}</span>
              <span className="font-medium">{formatValue(getActiveData()[index])}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
