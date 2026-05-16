import { useState, useEffect, useRef } from "react";
import {
    ChevronUp,
    ChevronDown,
    Search,
    Users,
    Image,
    Megaphone,
    Monitor,
    Tablet,
    UserRoundSearch,
} from "lucide-react";
import { MdImageSearch } from "react-icons/md";
import { HiOutlineDevicePhoneMobile } from "react-icons/hi2";
import { Chart, ChartConfiguration, ChartType } from "chart.js/auto";
import { RevenueChartProps } from "@/types";
import { StatsCardSkeleton } from "../home/Skeleton";
import { Skeleton } from "../ui/skeleton";
import { FaCaretUp } from "react-icons/fa6";
import { BsFillCaretDownFill } from "react-icons/bs";
import { CURRENCY_SYMBOL } from "@/constants";
import { Tooltip } from "../Tooltip";

type CategoryData = {
    network: Array<{
        id: string;
        name: string;
        icon: React.ComponentType<any>;
        amount: number;
        change: number;
        trend: string;
    }>;
    devices: Array<{
        id: string;
        name: string;
        icon: React.ComponentType<any>;
        amount: number;
        change: number;
        trend: string;
    }>;
};
type CategoryDataKey = keyof CategoryData;

export default function RevenueChart({
    title = "Revenue",
    icons,
    lineGradientStart,
    lineGradientMid,
    lineGradientEnd,
    fillGradient,
    trendDownColor,
    trendUpColor,
    totalRevenue = {
        amount: 432900,
        change: 1.2,
        trend: "up",
    },
    hideSearchIcon = false,
    helpTooltip = "",
    showRevenue = false,
    data = [],
    isDashboardChangeOverviewLoading
}: RevenueChartProps & {
    hideSearchIcon?: boolean;
    helpTooltip?: string;
    showRevenue?: boolean;
    data?: number[]
    isDashboardChangeOverviewLoading?: boolean;
}) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const [activeControl, setActiveControl] = useState<CategoryDataKey>("network");
    const activeData = icons && icons.length && activeControl === 'network' ? data : icons && icons.length && activeControl === 'devices' ? totalRevenue.otherData ?? [] : data
    const activeChange = icons && icons.length && activeControl === 'network' ? totalRevenue.change : icons && icons.length && activeControl === 'devices' ? totalRevenue.otherChange : totalRevenue.change

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [searchTooltipVisible, setSearchTooltipVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(
        hideSearchIcon ? "" : "search"
    );
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 0
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate data fetch or wait for actual props/data
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const searchTooltipItems = [
        { id: "search", name: "Search", icon: Search },
        { id: "search-parameters", name: "Search Parameters", icon: Users },
        { id: "display", name: "Display", icon: Image },
        { id: "other", name: "Other", icon: Megaphone },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchTooltipVisible &&
                !(event.target as Element).closest(".search-tooltip-container")
            ) {
                setSearchTooltipVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchTooltipVisible]);

    const categoryData: CategoryData = {
        network: [
            ...(!hideSearchIcon
                ? [
                    {
                        id: "search",
                        name: "Search",
                        icon: Search,
                        amount: 432900,
                        change: 1.2,
                        trend: "up",
                    },
                ]
                : []),
            {
                id: "search-partners",
                name: "Search partners",
                icon: UserRoundSearch,
                amount: 334500,
                change: 0.0,
                trend: "neutral",
            },
            {
                id: "display",
                name: "Display",
                icon: MdImageSearch,
                amount: 81200,
                change: -0.8,
                trend: "down",
            },
            {
                id: "other",
                name: "Other",
                icon: Megaphone,
                amount: 36200,
                change: 0.5,
                trend: "up",
            },
        ],
        devices: [
            {
                id: "desktop",
                name: "Desktop",
                icon: Monitor,
                amount: 432900,
                change: 1.2,
                trend: "up",
            },
            {
                id: "mobile",
                name: "Mobile",
                icon: HiOutlineDevicePhoneMobile,
                amount: 334500,
                change: 0.2,
                trend: "neutral",
            },
            {
                id: "tablet",
                name: "Tablet",
                icon: Tablet,
                amount: 81200,
                change: -0.8,
                trend: "down",
            },
        ],
    };

    // Get the current selected category data
    const getCurrentCategoryData = () => {
        if (hideSearchIcon) return null;

        const categories = categoryData[activeControl];
        return categories.find(cat => cat.id === selectedCategory) || categories[0];
    };

    const currentCategory = getCurrentCategoryData();

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const getSymbolForTitle = (title: string): { symbol: string, position: 'before' | 'after' } => {
        const dollarTitles = ['Ad Spend', 'Revenue'];
        const euroTitles = ['CPA', 'CPC'];
        const percentTitles = ['Conv. Rate', 'Your impression share', 'Your top of page rate', 'Your absolute top of page rate'];

        if (dollarTitles.includes(title)) return { symbol: CURRENCY_SYMBOL, position: 'before' };
        if (euroTitles.includes(title)) return { symbol: CURRENCY_SYMBOL, position: 'before' };
        if (percentTitles.includes(title)) return { symbol: '%', position: 'after' };

        return { symbol: '', position: 'before' };
    };

    const formatCurrency = (value?: number): string => {
        if (value === undefined || value === null) return '';
        const { symbol, position } = getSymbolForTitle(title as string);
        const displayValue = value > 1000 ? (value / 1000).toFixed(1) + 'k' : value.toFixed(0);

        return position === 'before' ? `${symbol}${displayValue}` : `${displayValue}${symbol}`;
    };

    const getChartHeight = () => {
        if (screenWidth < 640) return 60;
        if (screenWidth < 768) return 72;
        if (screenWidth < 1024) return 80;
        return 96;
    };
    useEffect(() => {
        if (!chartRef.current || loading) return;

        const initChart = async () => {
            try {
                let chartInstance = chartRef.current
                    ? Chart.getChart(chartRef.current)
                    : null;
                if (chartInstance) {
                    chartInstance.destroy();
                }

                const ctx = chartRef.current?.getContext("2d");

                if (!ctx) {
                    throw new Error("Canvas context not found");
                }

                const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                gradient.addColorStop(0, fillGradient || "rgba(190, 230, 110, 0.4)");
                gradient.addColorStop(1, fillGradient || "rgba(190, 230, 110, 0)");

                const lineGradient = ctx.createLinearGradient(0, 0, 400, 0);
                lineGradient.addColorStop(
                    0,
                    lineGradientStart || "rgba(190, 230, 110, 1)"
                );
                lineGradient.addColorStop(
                    0.6,
                    lineGradientMid || "rgba(154, 203, 57, 1)"
                );
                lineGradient.addColorStop(
                    0.85,
                    lineGradientEnd || "rgba(120, 180, 30, 1)"
                );
                lineGradient.addColorStop(
                    1,
                    lineGradientStart || "rgba(170, 220, 80, 1)"
                );

                const dotPosition = activeData.length - 2;
                const dotData = Array(activeData.length).fill(null);
                dotData[dotPosition] = activeData[dotPosition];

                const config: ChartConfiguration = {
                    type: "line" as const,
                    data: {
                        labels: [
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Oct",
                        ],
                        datasets: [
                            {
                                data: activeData,
                                borderColor: lineGradient,
                                backgroundColor: "transparent",
                                borderWidth: 2.5,
                                tension: 0.4,
                                fill: true,
                                pointRadius: 0,
                                pointHoverRadius: 6,
                                pointBackgroundColor: "#9ACB39",
                                pointHoverBackgroundColor: "#9ACB39",
                                pointBorderColor: "#FFF",
                                pointHoverBorderColor: "#FFF",
                                pointBorderWidth: 2,
                                pointHoverBorderWidth: 2,
                            },
                            {
                                data: dotData,
                                borderColor: "transparent",
                                backgroundColor: lineGradientMid,
                                pointRadius: dotData.map((v) => (v === null ? 0 : 5)),
                                pointBorderColor: "#FFF",
                                pointBorderWidth: 2,
                                borderWidth: 0,
                                tension: 0.4,
                                fill: false,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { display: false },
                            y: { display: false, beginAtZero: true, suggestedMax: 110 },
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: { enabled: false },
                        },
                        elements: { line: { tension: 0.4 } },
                    },
                };

                chartInstance = new Chart(ctx, config);
            } catch (error) {
                console.error("Failed to initialize chart:", error);
            }
        };

        initChart();

        return () => {
            const chartInstance = chartRef.current
                ? Chart.getChart(chartRef.current)
                : null;
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
    }, [screenWidth, loading, activeData, isDashboardChangeOverviewLoading]);

    const toggleTooltip = () => {
        setTooltipVisible(!tooltipVisible);
    };

    const selectCategory = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setTooltipVisible(false);
    };

    const isSmallScreen = screenWidth < 768;
    const isMediumScreen = screenWidth >= 768 && screenWidth < 1200;

    if (loading) {
        return <StatsCardSkeleton />;
    }
    return (
        <div className="bg-white rounded-3xl w-full h-full flex flex-col">
            <div className="p-4 sm:p-5 lg:p-6 pb-0 flex-grow">
                <div className="flex justify-between items-center min-h-[28px] mb-3">
                    <div className="flex items-center gap-1">
                        <h2 className="text-sm font-normal text-[#707889] leading-tight">
                            {title}
                        </h2>
                        {helpTooltip && (
                            <Tooltip tooltipText={helpTooltip} />
                        )}
                    </div>
                    {icons && icons.length > 0 && !isSmallScreen && (
                        <div className="bg-gray-100 rounded-full p-0.5 flex items-center">
                            {icons.map(
                                ({ id, icon: Icon, text, activeControl: controlId }) => {
                                    const safeControlId = (controlId || id) as CategoryDataKey;
                                    return (
                                        <button
                                            key={id}
                                            // disabled
                                            className={`px-2 py-1 rounded-full flex items-center space-x-1 ${activeControl === safeControlId
                                                ? "bg-white shadow-xs"
                                                : "text-gray-500"
                                                }`}
                                            onClick={() => setActiveControl(safeControlId)}
                                        >
                                            <Icon
                                                className="shrink-0"
                                                size={isSmallScreen ? 16 : isMediumScreen ? 18 : 20}
                                            />
                                            {text && (
                                                <span className="text-xs whitespace-nowrap">{text}</span>
                                            )}
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>
                <div className="relative w-full" style={{ height: `${getChartHeight()}px` }}>
                    {isDashboardChangeOverviewLoading ? (
                        <Skeleton className="h-full w-full" />
                    ) : (
                        <>
                            {data?.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-gray-500">No data available</p>
                                </div>
                            )}
                            <canvas ref={chartRef} height={getChartHeight()} style={{ width: "100%" }} />
                        </>
                    )}
                </div>
            </div>
            <div className="px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5 lg:pb-6">
                <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline">
                        <span className="text-2xl font-semibold text-[#030C23]">
                            {icons && icons.length && activeControl === 'network' ? formatCurrency(totalRevenue.amount) : icons && icons.length && activeControl === 'devices' ? formatCurrency(totalRevenue.otherAmount) : formatCurrency(totalRevenue.amount)}
                        </span>
                        {isDashboardChangeOverviewLoading ? (
                            <div className="ml-1.5 sm:ml-2">
                                <Skeleton className="h-4 w-12" />
                            </div>
                        ) : (
                            <div className="ml-1.5 sm:ml-2">
                                {totalRevenue.trend === "up" && (
                                    <FaCaretUp
                                        className="inline"
                                        style={{ color: trendUpColor || "#0CD074" }}
                                        size={16}
                                    />
                                )}
                                {totalRevenue.trend === "down" && (
                                    <BsFillCaretDownFill
                                        className="inline"
                                        style={{ color: trendDownColor || "#ef4444" }}
                                        size={16}
                                    />
                                )}
                                {totalRevenue.trend === "neutral" && (
                                    <FaCaretUp
                                        className="inline text-gray-400"
                                        size={16}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                    <div className="search-tooltip-container relative inline-block">
                        {!hideSearchIcon && currentCategory && (
                            <div className="search-tooltip-container relative inline-block">
                                {!showRevenue ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setSearchTooltipVisible((prev) => !prev);
                                        }}
                                        disabled
                                        className="flex items-center focus:outline-none"
                                        aria-label="Search categories"
                                    >
                                        {/* <currentCategory.icon
                                            size={isSmallScreen ? 18 : 24}
                                            className="text-gray-500"
                                        /> */}
                                        <span className="ml-1.5 text-sm font-light text-[#707889]">
                                            {activeChange && activeChange > 0 ? '+' : ''}{activeChange}%
                                        </span>
                                    </button>

                                ) : (
                                    <span className="ml-1.5 text-sm font-light text-[#707889]">
                                        {activeChange && activeChange > 0 ? '+' : ''}{activeChange}%
                                    </span>
                                )}
                            </div>
                        )}
                        {/* Search Tooltip Card */}
                        {searchTooltipVisible && (
                            <div
                                className="absolute z-[600] rounded-2xl shadow-sm p-1 flex flex-col"
                                style={{
                                    right: 0,
                                    left: 0,
                                    top: 'auto',
                                    bottom: 'calc(100% + 8px)',
                                    marginRight: '-16px',
                                    background: 'var(--Common-Overlay-light, #FFFFFF8F)',
                                    border: '1px solid var(--Common-Border-neutral, #E6E6EE)',
                                    backdropFilter: 'blur(12px)',
                                    boxShadow: '0px 4px 32px 0px rgba(16, 30, 54, 0.08)',
                                    maxHeight: '60vh',
                                    overflow: 'visible',
                                    minWidth: '220px',
                                    width: 'auto'
                                }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="overflow-y-auto scrollbar-hide pr-2">
                                    {categoryData[activeControl].map((item) => {
                                        const IconComponent = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                className={`flex items-center justify-between w-full py-1.5 px-2 rounded-xl transition group mb-1 last:mb-0 ${selectedCategory === item.id
                                                    ? 'bg-[#F5F7FA]'
                                                    : 'hover:bg-[#F5F7FA]'
                                                    }`}
                                                onClick={() => {
                                                    setSelectedCategory(item.id);
                                                    setSearchTooltipVisible(false);
                                                }}
                                                onMouseEnter={() => setHoveredCategory(item.id)}
                                                onMouseLeave={() => setHoveredCategory(null)}
                                            >
                                                <span className="flex items-center min-w-0 gap-1">
                                                    <IconComponent
                                                        size={12}
                                                        className={`flex-shrink-0 mr-1 ${selectedCategory === item.id
                                                            ? 'text-gray-700'
                                                            : 'text-gray-500'
                                                            }`}
                                                        aria-hidden
                                                    />
                                                    <span className={`text-xs font-light truncate ${selectedCategory === item.id
                                                        ? 'text-[#030C23]'
                                                        : 'text-[#51597A]'
                                                        }`}>
                                                        {item.name}
                                                    </span>
                                                </span>
                                                <span className="flex items-center flex-shrink-0 ml-1 gap-1">
                                                    <span className={`font-semibold text-xs whitespace-nowrap mr-1 ${selectedCategory === item.id
                                                        ? 'text-[#030C23]'
                                                        : 'text-gray-500'
                                                        }`}>
                                                        {formatCurrency(item.amount).replace('.', ',')}
                                                    </span>
                                                    {item.trend === "up" && (
                                                        <ChevronUp size={12} className="text-green-500 flex-shrink-0" />
                                                    )}
                                                    {item.trend === "neutral" && (
                                                        <ChevronUp size={12} className="text-gray-400 flex-shrink-0" />
                                                    )}
                                                    {item.trend === "down" && (
                                                        <ChevronDown size={12} className="text-red-500 flex-shrink-0" />
                                                    )}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}