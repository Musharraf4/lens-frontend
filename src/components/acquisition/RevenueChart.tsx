import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Search, Users, Image, MessageSquare, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';
import { RevenueChartProps } from '@/types';
import { CURRENCY_SYMBOL } from '@/constants';

export default function RevenueChart({ title = "Revenue", icons, lineGradientStart, lineGradientMid, lineGradientEnd, fillGradient, trendDownColor, trendUpColor }: RevenueChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const [activeControl, setActiveControl] = useState('network'); // 'network' or 'devices'
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('search'); // 'search', 'desktop', etc.
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

    // Revenue data
    const totalRevenue = {
        amount: 432900,
        change: 1.2,
        trend: 'up'
    };

    const categoryData = {
        network: [
            { id: 'search', name: 'Search', icon: Search, amount: 432900, change: 1.2, trend: 'up' },
            { id: 'search-partners', name: 'Search partners', icon: Users, amount: 334500, change: 0.0, trend: 'neutral' },
            { id: 'display', name: 'Display', icon: Image, amount: 81200, change: -0.8, trend: 'down' },
            { id: 'other', name: 'Other', icon: MessageSquare, amount: 36200, change: 0.5, trend: 'up' }
        ],
        devices: [
            { id: 'desktop', name: 'Desktop', icon: Monitor, amount: 432900, change: 1.2, trend: 'up' },
            { id: 'mobile', name: 'Mobile', icon: Smartphone, amount: 334500, change: 0.2, trend: 'neutral' },
            { id: 'tablet', name: 'Tablet', icon: Tablet, amount: 81200, change: -0.8, trend: 'down' }
        ]
    };

    // Get current category details
    const getCurrentCategory = () => {
        const categories = categoryData[activeControl as keyof typeof categoryData];
        return categories.find(cat => cat.id === selectedCategory) || categories[0];
    };

    const formatCurrency = (value: number) => {
        return CURRENCY_SYMBOL + (value / 1000).toFixed(1) + 'k';
    };

    // Initialize the chart
    useEffect(() => {
        if (!chartRef.current) return;

        const initChart = async () => {
            try {
                // Clean up any existing chart
                let chartInstance = chartRef.current ? Chart.getChart(chartRef.current) : null;
                if (chartInstance) {
                    chartInstance.destroy();
                }

                const ctx = chartRef.current?.getContext('2d');

                if (!ctx) {
                    throw new Error('Canvas context not found');
                }

                // Create gradient for the line fill
                const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                gradient.addColorStop(0, fillGradient || 'rgba(190, 230, 110, 0.4)');
                gradient.addColorStop(1, fillGradient || 'rgba(190, 230, 110, 0)');

                const lineGradient = ctx.createLinearGradient(0, 0, 400, 0);
                lineGradient.addColorStop(0, lineGradientStart || 'rgba(190, 230, 110, 1)');
                lineGradient.addColorStop(0.6, lineGradientMid || 'rgba(154, 203, 57, 1)');
                lineGradient.addColorStop(0.85, lineGradientEnd || 'rgba(120, 180, 30, 1)');
                lineGradient.addColorStop(1, lineGradientStart || 'rgba(170, 220, 80, 1)');

                // Sample data points (12 months) - adjusted to match screenshot curve
                const data = [55, 68, 60, 70, 62, 75, 80, 76, 85, 88, 100, 105];

                // Create a separate dataset for the dot that will be positioned at the second-to-last point
                const dotPosition = data.length - 2; // Second-to-last position
                const dotData = Array(data.length).fill(null);
                dotData[dotPosition] = data[dotPosition]; // Only set a value at the dot position

                const config: ChartConfiguration = {
                    type: 'line' as const,
                    data: {
                        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as string[],
                        datasets: [
                            {
                                data: data,
                                borderColor: lineGradient,
                                backgroundColor: 'transparent',
                                borderWidth: 2.5,
                                tension: 0.4,
                                fill: true,
                                pointRadius: 0,
                                pointHoverRadius: 6,
                                pointBackgroundColor: '#9ACB39',
                                pointHoverBackgroundColor: '#9ACB39',
                                pointBorderColor: '#FFF',
                                pointHoverBorderColor: '#FFF',
                                pointBorderWidth: 2,
                                pointHoverBorderWidth: 2
                            },
                            // Separate dataset just for the dot at the second-to-last position
                            {
                                data: dotData,
                                borderColor: 'transparent',
                                backgroundColor: lineGradientMid,  // Match the darker green at dot position
                                pointRadius: dotData.map(v => v === null ? 0 : 5),
                                pointBorderColor: '#FFF',
                                pointBorderWidth: 2,
                                borderWidth: 0,
                                tension: 0.4,
                                fill: false
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                display: false
                            },
                            y: {
                                display: false,
                                beginAtZero: true,
                                suggestedMax: 110 // Gives some space above the highest point
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                enabled: false
                            }
                        },
                        elements: {
                            line: {
                                tension: 0.4
                            }
                        }
                    }
                };

                chartInstance = new Chart<ChartType>(ctx, config);
            } catch (error) {
                console.error("Failed to initialize chart:", error);
            }
        };

        initChart();

        return () => {
            const chartInstance = chartRef.current ? Chart.getChart(chartRef.current) : null;
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
    }, []);

    // Toggle tooltip visibility
    const toggleTooltip = () => {
        setTooltipVisible(!tooltipVisible);
    };

    // Set selected category
    const selectCategory = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setTooltipVisible(false);
    };

    // Get the current category's icon
    const CategoryIcon = getCurrentCategory().icon;

    return (
        <div className="bg-white rounded-3xl shadow-md w-full overflow-hidden">
            <div className="p-6 pb-0">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-md text-gray-500 font-light">{title}</h2>
                    {icons && icons.length > 0 && (
                        <div className="bg-gray-100 rounded-full p-1 flex items-center">
                            {icons.map(({ id, icon: Icon, text, activeControl: controlId }) => (
                                <button
                                    key={id}
                                    className={`p-2 rounded-full flex items-center space-x-1 ${activeControl === (controlId || id)
                                        ? 'bg-white shadow-sm'
                                        : 'text-gray-500'
                                        }`}
                                    onClick={() => setActiveControl(controlId || id)}
                                >
                                    <Icon size={20} />
                                    {text && <span className="text-sm">{text}</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative h-24">
                    <canvas ref={chartRef} height="96" />
                </div>

                <div className="relative">
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-baseline">
                            <span className="text-lg font-bold text-blue-900">
                                {formatCurrency(totalRevenue.amount)}
                            </span>
                            <div className="ml-2">
                                {totalRevenue.trend === 'up' && (
                                    <ChevronUp className="inline" style={{ color: trendUpColor || '#22c55e' }} size={24} />
                                )}
                                {totalRevenue.trend === 'down' && (
                                    <ChevronDown className="inline" style={{ color: trendDownColor || '#ef4444' }} size={24} />
                                )}
                                {totalRevenue.trend === 'neutral' && <ChevronUp className="inline text-gray-400" size={24} />}
                            </div>
                        </div>

                        <div className="relative inline-block">
                            <div
                                className="flex items-center cursor-pointer"
                                onMouseEnter={() => setTooltipVisible(true)}
                                onMouseLeave={() => setTooltipVisible(false)}
                            >
                                <CategoryIcon size={24} className="text-gray-500" />
                                <span className="ml-2 text-gray-400 text-md">
                                    +{totalRevenue.change}%
                                </span>
                            </div>

                            {tooltipVisible && (
                                <div
                                    className="absolute right-0 top-full z-50 bg-white rounded-2xl shadow-lg p-4 w-64 mt-2"
                                    onMouseEnter={() => setTooltipVisible(true)}
                                    onMouseLeave={() => setTooltipVisible(false)}
                                >
                                    <div className="space-y-4">
                                        {categoryData[activeControl as keyof typeof categoryData].map((category) => (
                                            <div
                                                key={category.id}
                                                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                                                onClick={() => selectCategory(category.id)}
                                                onMouseEnter={() => setHoveredCategory(category.id)}
                                                onMouseLeave={() => setHoveredCategory(null)}
                                            >
                                                <div className="flex items-center">
                                                    <category.icon
                                                        size={20}
                                                        className={`mr-3 ${selectedCategory === category.id ? 'text-gray-800' : 'text-gray-400'}`}
                                                    />
                                                    <span className={`${selectedCategory === category.id ? 'text-gray-800' : 'text-gray-400'}`}>
                                                        {category.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="">
                                                        {formatCurrency(category.amount)}
                                                    </span>
                                                    <div className="ml-2">
                                                        {category.trend === 'up' && <ChevronUp className="text-green-500" size={16} />}
                                                        {category.trend === 'down' && <ChevronDown className="text-red-500" size={16} />}
                                                        {category.trend === 'neutral' && <ChevronUp className="text-gray-400" size={16} />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}