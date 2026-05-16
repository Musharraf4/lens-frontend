import { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';

export default function MarketingFunnelChart() {
    const [loading, setLoading] = useState(true);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    const metrics = [
        {
            name: 'Impressions',
            value: 10547,
            change: -5,
            changeValue: -1600,
            color: '#F8F9FA'
        },
        {
            name: 'Clicks',
            value: 4872,
            change: -1,
            changeValue: -48,
            color: '#D2E3FC'
        },
        {
            name: 'Leads',
            value: 952,
            change: 1,
            changeValue: 12,
            color: '#4285F4'
        },
        {
            name: 'Cases',
            value: 46,
            change: 2,
            changeValue: 12,
            color: '#1A73E8'
        }
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (loading) return;

        const initChart = async () => {
            try {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                if (!chartRef.current) return;

                const ctx = chartRef.current.getContext('2d');
                if (!ctx) return;

                // Create the chart
                const chartInstanceLocal = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: metrics.map(metric => metric.name),
                        datasets: [{
                            data: metrics.map(metric => metric.value),
                            backgroundColor: metrics.map(metric => metric.color),
                            borderWidth: 0,
                            borderRadius: 2,
                            barPercentage: 0.95,
                            categoryPercentage: 0.98,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        layout: {
                            padding: {
                                left: 0,
                                right: 0,
                                top: 20,
                                bottom: 0
                            }
                        },
                        scales: {
                            x: {
                                display: false,
                                grid: {
                                    display: false
                                }
                            },
                            y: {
                                display: false,
                                grid: {
                                    display: false
                                }
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
                        animation: {
                            duration: 1000
                        }
                    }
                });
                chartInstance.current = chartInstanceLocal;

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
    }, [loading]);

    const formatChangeValue = (value: number) => {
        const absValue = Math.abs(value);
        if (absValue >= 1000) {
            return `${(absValue / 1000).toLocaleString()}k`;
        }
        return absValue;
    };

    const ChartSkeleton = () => (
        <div className="h-48 animate-pulse flex items-center">
            <div className="w-full bg-gray-100 h-32 rounded-lg"></div>
        </div>
    );

    const processedMetrics = metrics.map(item => ({
        ...item,
        value: item.value ?? 0,
        changeValue: item.changeValue ?? 0
    }));

    const totalValue = processedMetrics.reduce((sum, stage) => sum + stage.value, 0);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="grid grid-cols-4 gap-4 mb-6">
                {processedMetrics.map((metric, index) => (
                    <div key={index} className="flex flex-col">
                        <span className="text-sm text-gray-500 mb-1">{metric.name}</span>
                        <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-gray-900">
                                {metric.value.toLocaleString()}
                            </span>
                            <div className={`ml-2 flex items-center text-sm ${metric.change > 0
                                ? 'text-green-500'
                                : metric.change < 0
                                    ? 'text-red-500'
                                    : 'text-gray-500'
                                }`}>
                                <span className="mr-1">
                                    {metric.change > 0 ? '↑' : metric.change < 0 ? '↓' : ''}
                                </span>
                                <span>{Math.abs(metric.change)}%</span>
                                <span className="ml-1 text-gray-400">
                                    {metric.changeValue >= 0 ? '+' : '-'}
                                    {formatChangeValue(metric.changeValue)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative h-48">
                {loading ? (
                    <ChartSkeleton />
                ) : (
                    <div className="h-full w-full">
                        <canvas ref={chartRef} height="192"></canvas>
                        {/* Custom gradient funnel overlay */}
                        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none flex items-center">
                            <div className="h-32 w-full bg-gradient-to-r from-gray-100 via-blue-100 to-blue-500 opacity-20 rounded-lg"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}