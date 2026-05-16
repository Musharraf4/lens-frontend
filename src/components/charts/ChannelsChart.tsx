import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { Search, Link, Repeat, Monitor } from "lucide-react";
import type { Chart } from "chart.js";
import { PiHandCoinsDuotone } from "react-icons/pi";
import { Users } from "lucide-react";
import { ToggleButton } from "../home/ToggleButton";
import DynamicTabs from "./DynamicTabs";
import { CURRENCY_SYMBOL } from "@/constants";
import { formatCompactNumber, getSourceIcon } from "@/lib/utils";
import { Tooltip } from "../Tooltip";

export interface ChannelData {
  channel: string;
  sales: number;
}

interface ChannelsChartProps {
  data: ChannelData[];
  title?: string;
  maxValue?: number;
  loading?: boolean;
  setSelectedChannelToggle: Dispatch<SetStateAction<string>>;
  selectedChannelToggle: string;
  isInsight?: boolean;
  tooltipText?: string
}

export default function ChannelsChart({
  data,
  title = "Channels",
  maxValue = 1000,
  loading = false,
  setSelectedChannelToggle,
  selectedChannelToggle,
  isInsight,
  tooltipText
}: ChannelsChartProps) {
  const [activeTab, setActiveTab] = useState("revenue");
  const chartContainer = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [labelCount, setLabelCount] = useState(11);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({
    x: 0,
    y: 0,
    alignRight: true,
  });
  const [tooltipData, setTooltipData] = useState<ChannelData | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Simulate previous month's revenue for arrow direction
  const getPreviousRevenue = (id: string) => {
    const prevData: Record<string, number> = {
      "1": 550,
      "2": 900,
      "3": 340,
      "4": 400,
      "5": 160,
    };
    return prevData[id] || 0;
  };

  const handleRowHover = (
    e: React.MouseEvent<HTMLDivElement>,
    row: ChannelData
  ) => {
    const container = containerRef.current;
    const containerRect = container?.getBoundingClientRect();
    if (containerRect) {
      const tooltipWidth = 150;
      const tooltipHeight = 48;
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;
      let x = mouseX + 8;
      let y = mouseY - tooltipHeight - 10;
      x = Math.max(80, Math.min(x, containerRect.width - tooltipWidth - 8));
      y = Math.max(10, Math.min(y, containerRect.height - tooltipHeight - 8));
      setTooltipPosition({ x, y, alignRight: false });
    }
    setHoveredBar(row.channel);
    setTooltipData(row);
  };

  const getChannelIcon = (name: string) => {
    switch (name) {
      case "Organic":
        return <Search />;
      case "Direct":
        return <Link />;
      case "Retargeting":
        return <Repeat />;
      case "Referral":
        return <Monitor />;
      case "Google Ads":
        return '/GoogleAdsIcon.svg';
      case "Mobile":
        return '/Mobile.svg';
      case "Tablet":
        return '/Tablet.svg';
      default:
        return <Monitor />;
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkIfMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      // Adjust label count based on screen size
      if (width < 640) {
        setLabelCount(5); // Show 5 labels on small screens (every 200)
      } else if (width <= 1024) {
        setLabelCount(7); // Show 7 labels on medium screens (every ~143)
      } else {
        setLabelCount(11); // Show all 11 labels on large screens (every 100)
      }
    };

    checkIfMobile();

    const handleResize = () => {
      checkIfMobile();
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    const initChart = async () => {
      try {
        const { Chart, registerables } = await import("chart.js");
        Chart.register(...registerables);

        if (chartInstance.current) {
          chartInstance.current.destroy();
          chartInstance.current = null;
        }

        if (!chartContainer.current) return;

        const ctx = chartContainer.current.getContext("2d");
        if (!ctx) return;

        const gradient = ctx.createLinearGradient(
          0,
          0,
          chartContainer.current.width,
          0
        );
        gradient.addColorStop(0, "#C5BDF5");
        gradient.addColorStop(1, "#C5BDF5");

        chartInstance.current = new Chart(ctx, {
          type: "bar",

          data: {
            labels: data.map(() => ""),
            datasets: [
              {
                data: data.map((channel) => channel.sales),
                backgroundColor: gradient,
                borderWidth: 0,
                borderRadius: 4,
                barThickness: isMobile ? 16 : 24,
              },
            ],
          },
          options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                min: 0,
                max: maxValue,
                grid: { display: false },
                ticks: { display: false },
              },
              y: { grid: { display: false }, ticks: { display: false } },
            },
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            },
          },
        });
      } catch (error) {
        console.error("Failed to initialize chart:", error);
      }
    };

    initChart();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [activeTab, isMobile, data, maxValue, loading]);
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 w-full animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  const MIN_BAR_PERCENT = 2; // tweak as needed

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-3xl p-4 w-full relative"
      data-tour="channels-chart"
    >
      <div className="flex sm:flex-row md:flex-row lg:flex-row flex-col gap-2 justify-between sm:items-center mb-6 flex-wrap">
        <div className="flex items-center gap-2 max-w-[70%]">
          <p className="text-neutral-500">{title}</p>
          {tooltipText && <Tooltip tooltipText={tooltipText} />}
        </div>
        {isInsight ? (
          <div className="flex bg-gray-100 rounded-full mt-3 md:mt-0 w-fit border border-neutral-50 justify-center mx-auto md:mx-0 md:ml-auto">
            <DynamicTabs
              tabs={[
                { key: 'roas', label: 'ROAS', icon: '/Dollar_arrows.svg' },
                { key: 'costPerLead', label: 'Cost per Lead', icon: '/Dollar_arrows.svg' }
              ]}
              metric={selectedChannelToggle}
              onTabChange={setSelectedChannelToggle}
            />
          </div>
        ) : (
          <div className="flex justify-end">
            <ToggleButton
              options={[
                {
                  label: "Revenue",
                  icon: <PiHandCoinsDuotone className="h-3 w-3" />,
                },
                {
                  label: "Cases",
                  icon: <Users className="w-3 h-3" />,
                },
              ]}
              selectedOption={selectedChannelToggle}
              onSelect={setSelectedChannelToggle}
            />
          </div>
        )}
      </div>

      <div className={`w-full relative lg:h-[80%] ${isInsight ? 'md:h-[60%]' : ''}`}>
        <div className={`flex flex-col justify-between lg:h-[80%] ${isInsight ? 'h-[78%]' : ''}`}>
          {(data.length > 0 ? data : []).map((channel) => {
            const icon = getSourceIcon(channel.channel);
            // const prevRevenue = getPreviousRevenue(channel.channel);
            // const change = channel.sales - prevRevenue;
            let arrow = "→";
            let arrowColor = "text-gray-500";
            // if (change > 0) {
            //   arrow = "↑";
            //   arrowColor = "text-green-500";
            // } else if (change < 0) {
            //   arrow = "↓";
            //   arrowColor = "text-red-500";
            // }

            const rawPercent = (channel.sales / maxValue) * 100;
            const widthPercent =
              channel.sales > 0
                ? Math.min(100, Math.max(rawPercent, MIN_BAR_PERCENT))
                : 0;

            return (
              <div
                key={channel.channel}
                className="flex items-center"
                onMouseEnter={(e) => handleRowHover(e, channel)}
                onMouseMove={(e) => handleRowHover(e, channel)}
                onMouseLeave={() => {
                  setHoveredBar(null);
                  setTooltipData(null);
                }}
              >
                <div className={`${isMobile ? 'w-10' : 'w-20'} sm:w-24 flex items-center`}>
                  <div className="flex items-center justify-center w-3 h-3 mr-1">
                    {typeof icon === "string" ? (
                      <img
                        src={icon}
                        alt={channel.channel}
                        className="w-3 h-3"
                      />
                    ) : (
                      icon
                    )}

                  </div>
                  {!isMobile && (
                    <span className="text-xs font-light sm:text-sm text-[#707889] truncate">
                      {channel.channel}
                    </span>
                  )}
                </div>
                <div className="flex-1 relative h-6 sm:h-8 z-10">
                  <div
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-4 sm:h-6 rounded transition-all duration-200 ${hoveredBar === channel.channel
                      ? "bg-[#866FFA] z-30"
                      : "bg-[#C5BDF5] z-20"
                      }`}
                    style={{
                      width: `${widthPercent}%`,
                      maxWidth: "100%",
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={`absolute ${isMobile ? 'left-[2rem]' : 'left-[5rem]'} sm:left-[6rem] top-0 bottom-0 w-px bg-[#E6E9EE]`}></div>
        <div className={`mt-8 ${isMobile ? 'pl-9' : 'pl-24'} pr-4 overflow-x-auto`}>
          <div className="flex justify-between text-xs text-gray-400 min-w-[220px] sm:min-w-full">
            {Array.from({ length: maxValue < 10 ? maxValue : labelCount }, (_, i) => {
              const step = maxValue < 10 ? maxValue : Math.round(maxValue / (labelCount - 1));
              const value = maxValue < 10 ? i + 1 : i * step;
              return <span key={i} className="whitespace-nowrap">{`${selectedChannelToggle == 'Revenue' ? CURRENCY_SYMBOL : ''}${formatCompactNumber(value)}`}</span>;
            })}
          </div>
        </div>
      </div>

      {/* Updated Tooltip with Dynamic Arrow */}
      {tooltipData && (
        <div
          className="absolute z-40 px-3 py-2 rounded-lg shadow-lg transition-all duration-150 ease-in-out"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: "translateY(0)", // No horizontal transform, mouse-based
            background: "var(--Common-Overlay-light, #FFFFFF8F)",
            border: "1px solid var(--Common-Border-neutral, #E6E9EE)",
            backdropFilter: "blur(12px)",
            maxWidth: "150px",
            opacity: tooltipData ? 1 : 0,
            pointerEvents: tooltipData ? "auto" : "none",
            position: "absolute",
          }}
        >
          <div className="flex items-center justify-between text-sm font-medium text-gray-800 whitespace-nowrap">
            <span>{selectedChannelToggle === 'Revenue' ? CURRENCY_SYMBOL : ''}{(Math.round(tooltipData.sales) as unknown as string).toLocaleString()}</span>
            <span
              className={`text-xs ml-2 ${getPreviousRevenue(tooltipData.channel) < tooltipData.sales
                ? "text-green-500"
                : getPreviousRevenue(tooltipData.channel) > tooltipData.sales
                  ? "text-red-500"
                  : "text-gray-500"
                }`}
            >
              {getPreviousRevenue(tooltipData.channel) < tooltipData.sales
                ? "↑"
                : getPreviousRevenue(tooltipData.channel) > tooltipData.sales
                  ? "↓"
                  : "→"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
