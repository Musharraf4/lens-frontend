import { useEffect, useRef, useState } from "react";
import type { Chart, ChartType, TooltipModel } from "chart.js";
import { RiHandHeartLine } from "react-icons/ri";
import { ToggleButton } from "../home/ToggleButton";
import { Tooltip } from "../Tooltip";

export type ConversionRateChartData = {
  months: string[];
  rates: number[];
};

declare module "chart.js" {
  interface GridLineOptions {
    borderDash?: number[];
  }
  interface TooltipOptions<TType extends ChartType = ChartType> {
    boxShadow?: string;
  }
}

type ConversionRateChartProps = {
  data?: ConversionRateChartData;
  loading: boolean;
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  useDummyData?: boolean;
  tooltipText?: string
};

export default function ConversionRateChart({
  data,
  loading,
  useDummyData = false,
  selectedOption,
  setSelectedOption,
  tooltipText
}: ConversionRateChartProps) {
  const [activeTab, setActiveTab] = useState("leadToSale");
  const chartContainer = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const displayData = data ?? { months: [], rates: [] };

  const getPreviousMonthValue = (
    currentIndex: number,
    rates: number[]
  ): number => {
    if (currentIndex === 0) return rates[0];
    return rates[currentIndex - 1];
  };

  useEffect(() => {
    if (typeof window === "undefined" || loading || !chartContainer.current)
      return;
    const handleResize = () => {
      if (chartInstance.current && chartContainer.current) {
        chartContainer.current.width = chartContainer.current.offsetWidth;
        chartContainer.current.height = window.innerWidth <= 768 ? 200 : 300;
        chartInstance.current.resize();
      }
    };
    const initChart = async () => {
      try {
        const { Chart, registerables } = await import("chart.js");
        Chart.register(...registerables);

        // Create tooltip element if it doesn't exist
        if (!tooltipRef.current) {
          const tooltipEl = document.createElement("div");
          tooltipEl.className = "custom-tooltip";
          tooltipEl.style.position = "absolute";
          tooltipEl.style.pointerEvents = "none";
          tooltipEl.style.background = "rgba(255, 255, 255, 0.98)";
          tooltipEl.style.border = "1px solid #E5E7EB";
          tooltipEl.style.borderRadius = "6px";
          tooltipEl.style.padding = "10px";
          tooltipEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
          tooltipEl.style.fontFamily = "'Inter', sans-serif";
          tooltipEl.style.opacity = "0";
          tooltipEl.style.transition = "all 0.3s ease";
          tooltipEl.style.zIndex = "1000";
          tooltipRef.current = tooltipEl;
          document.body.appendChild(tooltipEl);
        }

        chartInstance.current?.destroy();

        const ctx = chartContainer.current?.getContext("2d");
        if (!ctx || !chartContainer.current) return;

        ctx.clearRect(
          0,
          0,
          chartContainer.current.width,
          chartContainer.current.height
        );
        chartContainer.current.style.width = "100%";
        const isSmallScreen = window.innerWidth <= 768;
        chartContainer.current.style.height = isSmallScreen ? "200px" : "300px";
        chartContainer.current.width = chartContainer.current.offsetWidth;
        chartContainer.current.height = chartContainer.current.offsetHeight;

        const gradient = ctx.createLinearGradient(
          0,
          0,
          0,
          chartContainer.current.height
        );
        gradient.addColorStop(0, "rgba(145, 229, 246, 1)");
        gradient.addColorStop(1, "rgba(145, 229, 246, 0.8)");

        chartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: displayData.months,
            datasets: [
              {
                label: "",
                data: displayData.rates,
                backgroundColor: gradient,
                borderWidth: 0,
                borderRadius: 8,
                barPercentage: window.innerWidth <= 768 ? 0.7 : 0.8,
                categoryPercentage: window.innerWidth <= 768 ? 0.85 : 0.9,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            animation: { duration: 1000 },
            plugins: {
              legend: { display: false },
              tooltip: {
                enabled: false,
                external: (context: {
                  chart: Chart;
                  tooltip: TooltipModel<"bar">;
                }) => {
                  const tooltipEl = tooltipRef.current;
                  if (!tooltipEl) return;

                  if (context.tooltip.opacity === 0) {
                    tooltipEl.style.opacity = "0";
                    return;
                  }

                  const dataPoint = context.tooltip.dataPoints[0];
                  if (!dataPoint) return;

                  const value = dataPoint.raw as number;
                  const prevValue = getPreviousMonthValue(
                    dataPoint.dataIndex,
                    displayData.rates
                  );
                  const arrow =
                    value > prevValue ? "↑" : value < prevValue ? "↓" : "→";
                  const arrowColor =
                    value > prevValue
                      ? "#10B981"
                      : value < prevValue
                        ? "#EF4444"
                        : "#6B7280";

                  tooltipEl.innerHTML = `
                    <span style="color:#030C23">${value}%</span>
                    <span style="color:${arrowColor}">${arrow}</span>
                  `;

                  const position = context.chart.canvas.getBoundingClientRect();
                  const tooltipWidth = tooltipEl.offsetWidth;
                  const tooltipHeight = tooltipEl.offsetHeight;
                  let left =
                    position.left + window.scrollX + context.tooltip.caretX;
                  let top =
                    position.top + window.scrollY + context.tooltip.caretY - 50;

                  if (window.innerWidth <= 768) {
                    left = Math.min(
                      left,
                      window.innerWidth - tooltipWidth - 10
                    );
                    top = Math.max(top, 10);
                  }

                  tooltipEl.style.left = `${left}px`;
                  tooltipEl.style.top = `${top}px`;
                  tooltipEl.style.opacity = "1";
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                min: 0,
                max: 100,
                grid: {
                  drawOnChartArea: true,
                  drawTicks: false,
                  color: (ctx) =>
                    ctx.tick.value % 20 === 0 ? "#E5E7EB" : "transparent",
                  lineWidth: 1,
                  borderDash: [4, 4],
                },
                ticks: {
                  color: "#9CA3AF",
                  callback: (value) => `${value}%`,
                  stepSize: 20,
                  font: {
                    size: window.innerWidth <= 768 ? 10 : 12,
                  },
                },
                border: { display: false },
              },
              x: {
                grid: { display: false },
                ticks: {
                  color: "#9CA3AF",
                  font: {
                    size:
                      window.innerWidth <= 768
                        ? 10
                        : window.innerWidth <= 1024
                          ? 11
                          : 12,
                  },
                  maxRotation: window.innerWidth <= 768 ? 45 : 0,
                  minRotation: window.innerWidth <= 768 ? 45 : 0,
                },
                border: { display: false },
              },
            },
          },
        });

        window.addEventListener("resize", handleResize);
        return () => {
          window.removeEventListener("resize", handleResize);
        };
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
      if (tooltipRef.current) {
        document.body.removeChild(tooltipRef.current);
        tooltipRef.current = null;
      }
    };
  }, [loading, data, displayData, selectedOption, activeTab]);

  const Skeleton = () => (
    <div className="animate-pulse w-full h-[200px] md:h-[300px] bg-gray-100 rounded-lg relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-6 pl-2">
        {["100", "80", "60", "40", "20", "0"].map((label) => (
          <div key={label} className="text-xs text-gray-300">
            {label}%
          </div>
        ))}
      </div>
      <div className="absolute bottom-2 left-10 right-2 flex justify-between px-3">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="text-xs text-gray-200">
            ---
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-end justify-between px-4 md:px-8 pb-8">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="bg-blue-100 rounded-md"
            style={{
              width: window.innerWidth <= 768 ? 12 : 16,
              height: `${20 + Math.random() * 140}px`,
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="rounded-3xl p-4 bg-white" data-tour="conversion-rate-chart">
      <style jsx>{`
        @media (max-width: 768px) {
          .custom-tooltip {
            font-size: 12px !important;
            padding: 8px !important;
            max-width: 100px;
          }

          .conversion-rate-title {
            font-size: 12px !important;
          }
          .tab-container {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .tab-button {
            font-size: 12px !important;
            padding: 6px 12px !important;
            width: 100%;
            text-align: left;
          }
        }
        @media (max-width: 1024px) and (min-width: 769px) {
          .custom-tooltip {
            font-size: 13px !important;
            padding: 9px !important;
          }
          .conversion-rate-title {
            font-size: 13px !important;
          }
          .tab-button {
            font-size: 13px !important;
            padding: 8px 16px !important;
          }
        }
      `}</style>
      <div className="flex sm:flex-row flex-col gap-2 justify-between sm:items-center mb-6">
        <div className="flex items-center gap-2 max-w-[70%]">
          <p className="text-neutral-500">Conversion rate</p>
          {tooltipText && <Tooltip tooltipText={tooltipText} />}
        </div>
        <div className="flex justify-end">
          <ToggleButton
            options={[
              {
                label: "Lead to Case",
                icon: "/Lead to sale.svg",
              },
              {
                label: "Click to Lead",
                icon: <RiHandHeartLine className="w-3 h-3" />,
              },
            ]}
            selectedOption={selectedOption}
            onSelect={setSelectedOption}
          />
        </div>
      </div>
      <div
        className="w-full"
        style={{ height: window.innerWidth <= 768 ? "200px" : "300px" }}
      >
        {loading ? (
          <Skeleton />
        ) : (
          <canvas
            ref={chartContainer}
            width="100%"
            height={window.innerWidth <= 768 ? "200px" : "300px"}
          />
        )}
      </div>
    </div>
  );
}
