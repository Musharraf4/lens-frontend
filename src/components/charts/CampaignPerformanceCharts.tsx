import { useEffect, useRef, useState } from "react";
import { Chart, ChartEvent, registerables } from "chart.js";
import { DollarSign, BarChart2 } from "lucide-react";
import {
  useLowestCampaigns,
  useTopZipCodes,
  useTopKeywords,
  useLowestKeywords,
  useZipCodesPerformance,
  useExtensionsPerformance,
  IZipCodePerformance,
  useCalloutsPerformance,
  useRegionPerformance,
} from "../../services/googleAds.api";
import { ChartSkeleton } from "../home/Skeleton";
import DynamicTabs from "./DynamicTabs";
import { CURRENCY_SYMBOL } from "@/constants";

Chart.register(...registerables);

// Define the data structure for each view
interface ChartData {
  title: string;
  labels: string[];
  leads: number[];
  revenue: number[];
  roi: number[];
  cpl?: number[];
  roas?: number[];
  color: string;
  callouts?: number[];
}

export default function CampaignPerformanceCharts({
  viewKey,
  configId,
  date_range,
  isInsight = false,
}: {
  viewKey: string;
  configId: string;
  date_range: string;
  isInsight?: boolean;
}) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [activeTab, setActiveTab] = useState(isInsight ? "roas" : "leads");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredBarData, setHoveredBarData] = useState<{
    label: string;
    value: number;
    change: string | null;
  } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  // Fetch data using the appropriate hook based on viewKey
  const { data: lowestCampaignsData, isLoading: isLoadingCampaigns } =
    useLowestCampaigns(configId, date_range, undefined, 5);

  const { data: topZipCodesData, isLoading: isLoadingZipCodes } =
    useTopZipCodes(lowestCampaignsData ? configId : "", date_range, 5);

  const { data: topKeywordsData, isLoading: isLoadingTopKeywords } =
    useTopKeywords(topZipCodesData ? configId : "", date_range, 5);

  const { data: lowestKeywordsData, isLoading: isLoadingLowestKeywords } =
    useLowestKeywords(topKeywordsData ? configId : "", date_range, 5);

  const { data: zipPerformanceData, isLoading: isLoadingZipPerformance } =
    useZipCodesPerformance(lowestKeywordsData ? configId : "", date_range);

  const { data: extensionsData, isLoading: isLoadingExtensions } =
    useExtensionsPerformance(isInsight ? configId : "", date_range);

  const { data: regionData, isLoading: isLoadingRegions } =
    useRegionPerformance(
      isInsight && extensionsData ? configId : "",
      date_range
    );

  const { data: calloutsData, isLoading: isLoadingCallouts } =
    useCalloutsPerformance(isInsight && regionData ? configId : "", date_range);

  // Helper function to get combined campaigns from all customers
  const getCombinedCampaigns = () => {
    if (!lowestCampaignsData?.results) return [];

    // Flatten all campaigns from all customers
    const allCampaigns = lowestCampaignsData.results.reduce((acc, customer) => {
      return acc.concat(customer.campaigns || []);
    }, [] as any[]);

    // Sort by ROI (ascending, with null values treated as worst)
    // Then by leads + revenue if ROI is the same
    return allCampaigns
      .sort((a, b) => {
        // Handle null ROI values (treat as worst performance)
        const aRoi = a.roi ?? -Infinity;
        const bRoi = b.roi ?? -Infinity;

        if (aRoi !== bRoi) {
          return aRoi - bRoi; // Ascending order for lowest performing
        }

        // If ROI is the same, sort by total performance (leads + revenue)
        const aTotal = (a.leads || 0) + (a.revenue || 0);
        const bTotal = (b.leads || 0) + (b.revenue || 0);
        return aTotal - bTotal;
      })
      .slice(0, 5); // Take only top 5 lowest performing
  };

  // Helper function to get combined zip codes from all customers
  const getCombinedZipCodes = () => {
    if (!topZipCodesData?.results) return [];

    // Flatten all zip codes from all customers
    const allZipCodes = topZipCodesData.results.reduce((acc, customer) => {
      return acc.concat(customer.zip_codes || []);
    }, [] as any[]);

    // Sort by leads first (descending), then by revenue if leads are the same
    return allZipCodes
      .sort((a, b) => {
        const aLeads = a.leads || 0;
        const bLeads = b.leads || 0;

        if (aLeads !== bLeads) {
          return bLeads - aLeads; // Descending order for top performing
        }

        // If leads are the same, sort by revenue
        const aRevenue = a.revenue || 0;
        const bRevenue = b.revenue || 0;
        return bRevenue - aRevenue;
      })
      .slice(0, 5); // Take only top 5 performing
  };

  // Helper function to get combined keywords from all customers
  const getCombinedTopKeywords = () => {
    if (!topKeywordsData?.results) return [];

    // Flatten all keywords from all customers
    const allKeywords = topKeywordsData.results.reduce((acc, customer) => {
      return acc.concat(customer.keywords || []);
    }, [] as any[]);

    // Sort by leads first (descending), then by revenue if leads are the same
    return allKeywords
      .sort((a, b) => {
        const aLeads = a.leads || 0;
        const bLeads = b.leads || 0;

        if (aLeads !== bLeads) {
          return bLeads - aLeads; // Descending order for top performing
        }

        // If leads are the same, sort by revenue
        const aRevenue = a.revenue || 0;
        const bRevenue = b.revenue || 0;
        return bRevenue - aRevenue;
      })
      .slice(0, 5); // Take only top 5 performing
  };

  // Helper function to get combined lowest keywords from all customers
  const getCombinedLowestKeywords = () => {
    if (!lowestKeywordsData?.results) return [];

    // Flatten all keywords from all customers
    const allKeywords = lowestKeywordsData.results.reduce((acc, customer) => {
      return acc.concat(customer.keywords || []);
    }, [] as any[]);

    // Sort by ROI (ascending, with null values treated as worst)
    // Then by leads + revenue if ROI is the same
    return allKeywords
      .sort((a, b) => {
        // Handle null ROI values (treat as worst performance)
        const aRoi = a.roi ?? -Infinity;
        const bRoi = b.roi ?? -Infinity;

        if (aRoi !== bRoi) {
          return aRoi - bRoi; // Ascending order for lowest performing
        }

        // If ROI is the same, sort by total performance (leads + revenue)
        const aTotal = (a.leads || 0) + (a.revenue || 0);
        const bTotal = (b.leads || 0) + (b.revenue || 0);
        return aTotal - bTotal;
      })
      .slice(0, 5); // Take only top 5 lowest performing
  };

  // Helper function to get combined zip performance from all customers
  const getCombinedZipPerformance = (metric: "leads" | "revenue" | "roas") => {
    if (!zipPerformanceData?.results) return [];

    // Flatten all zip codes from all customers
    const allZipCodes = zipPerformanceData.results.reduce((acc, customer) => {
      return acc.concat(customer.zip_codes || []);
    }, [] as any[]);

    // Remove duplicates by zip_code and aggregate data
    const zipCodeMap = new Map();
    allZipCodes.forEach((zipCode) => {
      const key = zipCode.zip_code;
      if (zipCodeMap.has(key)) {
        const existing = zipCodeMap.get(key);
        // Aggregate the data
        existing.leads += zipCode.leads || 0;
        existing.revenue += zipCode.revenue || 0;
        existing.impr += zipCode.impr || 0;
        existing.clicks += zipCode.clicks || 0;
        existing.cost += zipCode.cost || 0;
        // For ROAS, take the average or recalculate based on aggregated data
        existing.roas =
          existing.revenue > 0 && existing.cost > 0
            ? ((existing.revenue - existing.cost) / existing.cost) * 100
            : zipCode.roas;
      } else {
        zipCodeMap.set(key, {
          zip_code: zipCode.zip_code,
          leads: zipCode.leads || 0,
          revenue: zipCode.revenue || 0,
          roas: zipCode.roas || 0,
          impr: zipCode.impr || 0,
          clicks: zipCode.clicks || 0,
          cost: zipCode.cost || 0,
        });
      }
    });

    const aggregatedZipCodes = Array.from(zipCodeMap.values());

    // Sort by the selected metric (descending for top performing)
    return aggregatedZipCodes
      .sort((a, b) => {
        const aValue = a[metric] || 0;
        const bValue = b[metric] || 0;
        return bValue - aValue;
      })
      .slice(0, 5); // Take only top 5 performing
  };

  // Helper function to get combined extensions from all customers
  const getCombinedExtensions = () => {
    if (!extensionsData?.results) return [];

    // Flatten all extensions from all customers
    const allExtensions = extensionsData.results.reduce((acc, customer) => {
      return acc.concat(customer.extensions || []);
    }, [] as any[]);

    // Remove duplicates by extension type and aggregate data
    const extensionMap = new Map();
    allExtensions.forEach((extension) => {
      const key = extension.extension;
      if (extensionMap.has(key)) {
        const existing = extensionMap.get(key);
        // Aggregate the data
        existing.leads += extension.leads || 0;
        existing.revenue += extension.revenue || 0;
        existing.impr += extension.impr || 0;
        existing.clicks += extension.clicks || 0;
        existing.cost += extension.cost || 0;
        // For ROI, recalculate based on aggregated data
        existing.roi =
          existing.revenue > 0 && existing.cost > 0
            ? ((existing.revenue - existing.cost) / existing.cost) * 100
            : extension.roi;
        // For CPL, recalculate based on aggregated data
        existing.cpl = existing.leads > 0 ? existing.cost / existing.leads : 0;
        existing.roas = existing.roas || extension.roas || 0;
      } else {
        extensionMap.set(key, {
          extension: extension.extension,
          leads: extension.leads || 0,
          revenue: extension.revenue || 0,
          roi: extension.roi || 0,
          impr: extension.impr || 0,
          clicks: extension.clicks || 0,
          cost: extension.cost || 0,
          cpl: extension.cpl || 0,
          roas: extension.roas || 0,
        });
      }
    });

    const aggregatedExtensions = Array.from(extensionMap.values());

    // Sort by leads first (descending), then by revenue if leads are the same
    return aggregatedExtensions
      .sort((a, b) => {
        const aLeads = a.leads || 0;
        const bLeads = b.leads || 0;

        if (aLeads !== bLeads) {
          return bLeads - aLeads; // Descending order for top performing
        }

        // If leads are the same, sort by revenue
        const aRevenue = a.revenue || 0;
        const bRevenue = b.revenue || 0;
        return bRevenue - aRevenue;
      })
      .slice(0, 5); // Take only top 5 performing
  };

  // Helper function to get combined regions from all customers
  const getCombinedRegions = () => {
    if (!regionData?.results) return [];

    // Flatten all regions from all customers
    const allRegions = regionData.results.reduce((acc, customer) => {
      return acc.concat(customer.performance || []);
    }, [] as any[]);

    // Remove duplicates by region type and aggregate data
    const regionMap = new Map();
    allRegions.forEach((region) => {
      const key = region.region;
      if (regionMap.has(key)) {
        const existing = regionMap.get(key);
        // Aggregate the data
        existing.leads += region.leads || 0;
        existing.revenue += region.revenue || 0;
        existing.impr += region.impr || 0;
        existing.clicks += region.clicks || 0;
        existing.cost += region.cost || 0;
        // For ROI, recalculate based on aggregated data
        existing.roi =
          existing.revenue > 0 && existing.cost > 0
            ? ((existing.revenue - existing.cost) / existing.cost) * 100
            : region.roi;
        // For CPL, recalculate based on aggregated data
        existing.cpl = existing.leads > 0 ? existing.cost / existing.leads : 0;
        existing.roas = existing.roas || region.roas || 0;
      } else {
        regionMap.set(key, {
          region: region.region,
          leads: region.leads || 0,
          revenue: region.revenue || 0,
          roi: region.roi || 0,
          impr: region.impr || 0,
          clicks: region.clicks || 0,
          cost: region.cost || 0,
          cpl: region.cpl || 0,
          roas: region.roas || 0,
        });
      }
    });

    const aggregatedRegions = Array.from(regionMap.values());

    // Sort by leads first (descending), then by revenue if leads are the same
    return aggregatedRegions
      .sort((a, b) => {
        const aLeads = a.leads || 0;
        const bLeads = b.leads || 0;

        if (aLeads !== bLeads) {
          return bLeads - aLeads; // Descending order for top performing
        }

        // If leads are the same, sort by revenue
        const aRevenue = a.revenue || 0;
        const bRevenue = b.revenue || 0;
        return bRevenue - aRevenue;
      })
      .slice(0, 5); // Take only top 5 performing
  };

  // Helper function to get combined callouts from all customers
  const getCombinedCallouts = () => {
    if (!calloutsData?.results) return [];

    // Flatten all callouts from all customers
    const allCallouts = calloutsData.results.reduce((acc, customer) => {
      return acc.concat(customer.extensions || []);
    }, [] as any[]);

    // Remove duplicates by region type and aggregate data
    const calloutMap = new Map();
    allCallouts.forEach((callout) => {
      const key = callout.callout;
      if (calloutMap.has(key)) {
        const existing = calloutMap.get(key);
        // Aggregate the data
        existing.leads += callout.leads || 0;
        existing.revenue += callout.revenue || 0;
        existing.impr += callout.impr || 0;
        existing.clicks += callout.clicks || 0;
        existing.cost += callout.cost || 0;
        // For ROI, recalculate based on aggregated data
        existing.roi =
          existing.revenue > 0 && existing.cost > 0
            ? ((existing.revenue - existing.cost) / existing.cost) * 100
            : callout.roi;
        // For CPL, recalculate based on aggregated data
        existing.cpl = existing.leads > 0 ? existing.cost / existing.leads : 0;
        existing.roas = existing.roas || callout.roas || 0;
      } else {
        calloutMap.set(key, {
          callout: callout.callout,
          leads: callout.leads || 0,
          revenue: callout.revenue || 0,
          roi: callout.roi || 0,
          impr: callout.impr || 0,
          clicks: callout.clicks || 0,
          cost: callout.cost || 0,
          cpl: callout.cpl || 0,
          roas: callout.roas || 0,
        });
      }
    });

    const aggregatedCallouts = Array.from(calloutMap.values());

    // Sort by leads first (descending), then by revenue if leads are the same
    return aggregatedCallouts
      .sort((a, b) => {
        const aLeads = a.leads || 0;
        const bLeads = b.leads || 0;

        if (aLeads !== bLeads) {
          return bLeads - aLeads; // Descending order for top performing
        }

        // If leads are the same, sort by revenue
        const aRevenue = a.revenue || 0;
        const bRevenue = b.revenue || 0;
        return bRevenue - aRevenue;
      })
      .slice(0, 5); // Take only top 5 performing
  };

  // Helper function to get top 5 zip codes based on metric (legacy function - can be removed)
  const getTop5ZipCodes = (
    data: IZipCodePerformance[] | undefined,
    metric: "leads" | "revenue" | "roas"
  ) => {
    if (!data) return [];
    return [...data]
      .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
      .slice(0, 5);
  };

  // Transform API data into chart format
  const transformData = (): ChartData => {
    switch (viewKey) {
      case "campaigns":
        const combinedCampaigns = getCombinedCampaigns();
        return {
          title: "Lowest performing campaigns",
          labels: combinedCampaigns.map((c) => c.name) || [],
          leads: combinedCampaigns.map((c) => c.leads) || [],
          revenue: combinedCampaigns.map((c) => c.revenue) || [],
          roi: combinedCampaigns.map((c) => c.roi) || [],
          color: "#BBCBFF",
        };
      case "zipcodes":
        const combinedZipCodes = getCombinedZipCodes();
        return {
          title: "Top performing zip-codes",
          labels: combinedZipCodes.map((z) => z.zip_code) || [],
          leads: combinedZipCodes.map((z) => z.leads) || [],
          revenue: combinedZipCodes.map((z) => z.revenue) || [],
          roi: combinedZipCodes.map((z) => z.roi) || [],
          color: "#D8FF8B",
        };
      case "topKeywords":
        const combinedTopKeywords = getCombinedTopKeywords();
        return {
          title: "Top keywords",
          labels: combinedTopKeywords.map((k) => k.keyword) || [],
          leads: combinedTopKeywords.map((k) => k.leads) || [],
          revenue: combinedTopKeywords.map((k) => k.revenue) || [],
          roi: combinedTopKeywords.map((k) => k.roi) || [],
          color: "#D8CBFF",
        };
      case "lowestKeywords":
        return {
          title: "Lowest keywords",
          labels: getCombinedLowestKeywords().map((k) => k.keyword) || [],
          leads: getCombinedLowestKeywords().map((k) => k.leads) || [],
          revenue: getCombinedLowestKeywords().map((k) => k.revenue) || [],
          roi: getCombinedLowestKeywords().map((k) => k.roi) || [],
          color: "#FFE58B",
        };
      case "zipPerformance":
        const combinedZipPerformance = getCombinedZipPerformance(
          activeTab === "leads"
            ? "leads"
            : activeTab === "revenue"
              ? "revenue"
              : "roas"
        );

        return {
          title: "Zip-code performance",
          labels: combinedZipPerformance.map((z) => z.zip_code),
          leads: combinedZipPerformance.map((z) => z.leads),
          revenue: combinedZipPerformance.map((z) => z.revenue),
          roi: combinedZipPerformance.map((z) => z.roas || 0),
          color: "#8BE8CB",
        };
      case "extensions":
        const combinedExtensions = getCombinedExtensions();
        return {
          title: "Extensions performance",
          labels: combinedExtensions.map((e) => e.extension) || [],
          leads: combinedExtensions.map((e) => e.leads) || [],
          revenue: combinedExtensions.map((e) => e.revenue) || [],
          roi: combinedExtensions.map((e) => e.roi || 0) || [],
          cpl: combinedExtensions.map((e) => e.cpl || 0) || [],
          roas: combinedExtensions.map((e) => e.roas || 0) || [],
          color: "#C9BFFD",
        };
      case "regions":
        const combinedRegions = getCombinedRegions();
        return {
          title: "Regions performance",
          labels: combinedRegions.map((r) => r.region) || [],
          leads: combinedRegions.map((r) => r.leads) || [],
          revenue: combinedRegions.map((r) => r.revenue) || [],
          roi: combinedRegions.map((r) => r.roi || 0) || [],
          cpl: combinedRegions.map((r) => r.cpl || 0) || [],
          roas: combinedRegions.map((r) => r.roas || 0) || [],
          color: "#B7CBFF",
        };
      case "callouts":
        const combinedCallouts = getCombinedCallouts();

        return {
          title: "Callouts performance",
          labels: combinedCallouts.map((c) => c.callout) || [],
          leads: combinedCallouts.map((c) => c.leads) || [],
          revenue: combinedCallouts.map((c) => c.revenue) || [],
          roi: combinedCallouts.map((c) => c.roi || 0) || [],
          cpl: combinedCallouts.map((c) => c.cpl || 0) || [],
          roas: combinedCallouts.map((c) => c.roas || 0) || [],
          color: "#FFDE7A",
        };
      default:
        return {
          title: "",
          labels: [],
          leads: [],
          revenue: [],
          roi: [],
          cpl: [],
          roas: [],
          color: "#BBCBFF",
        };
    }
  };

  const currentViewData = transformData();

  // Add window resize listener to track screen width
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getActiveData = () => {
    switch (activeTab) {
      case "leads":
        return currentViewData.leads;
      case "revenue":
        return currentViewData.revenue;
      case "roi":
        return currentViewData.roi;
      case "cpl":
        return currentViewData.cpl;
      case "roas":
        return currentViewData.roas;
      case "callouts":
        return currentViewData.callouts;
      default:
        return currentViewData.leads;
    }
  };

  const formatValue = (value: number) => {
    if (activeTab === "revenue" || activeTab === "roi")
      return `${CURRENCY_SYMBOL}${value?.toLocaleString()}`;
    return value?.toLocaleString();
  };

  // Calculate label display based on screen size and container width
  const getDisplayLabel = (label: string) => {
    let maxLength = 30; // Default for larger screens

    if (screenWidth < 375) {
      maxLength = 8;
    } else if (screenWidth < 640) {
      maxLength = 15;
    } else if (screenWidth < 768) {
      maxLength = 20;
    }

    return label.length > maxLength ? label.slice(0, maxLength) + "..." : label;
  };

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    const data = getActiveData();
    const labels = currentViewData.labels;

    // Adjust chart sizing based on screen width
    const getBarPercentage = () => {
      if (screenWidth < 375) return 0.5; // Very small screens
      if (screenWidth < 640) return 0.6; // Small screens
      return 0.7; // Default
    };

    chartInstance.current = new Chart(ctx as CanvasRenderingContext2D, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            data: data ?? [],
            backgroundColor: currentViewData.color,
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: getBarPercentage(),
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
              value: data?.[index] || 0,
              change: index === 2 ? "+1%" : null,
            });

            if (event && event.native) {
              setTooltipPosition({
                x: event?.x ?? 0,
                y: event?.y ?? 0,
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
          padding: {
            top: 15,
            bottom: 10,
            // Add responsive padding based on screen size
            left: screenWidth < 375 ? 0 : 5,
            right: screenWidth < 375 ? 0 : 5,
          },
        },
      },
    });

    return () => {
      chartInstance.current?.destroy();
    };
  }, [
    activeTab,
    viewKey,
    screenWidth,
    // Add these data dependencies
    lowestCampaignsData,
    topZipCodesData,
    topKeywordsData,
    lowestKeywordsData,
    zipPerformanceData,
    extensionsData,
    regionData,
    calloutsData,
  ]); // Add data dependencies to the dependency array

  // Determine size of icons and text based on screen size
  const isSmallScreen = screenWidth < 640;
  const iconSize = isSmallScreen ? 14 : 16;

  // Add loading state handling
  const isLoading =
    isLoadingCampaigns ||
    isLoadingZipCodes ||
    isLoadingTopKeywords ||
    isLoadingLowestKeywords ||
    isLoadingZipPerformance ||
    isLoadingRegions ||
    isLoadingCallouts ||
    isLoadingExtensions;

  // const conditionalLoading =
  //   ((viewKey === "campaigns") && isLoadingCampaigns) ||
  //   ((viewKey === "zipcodes") && isLoadingZipCodes) ||
  //   ((viewKey === "topKeywords") && isLoadingTopKeywords) ||
  //   ((viewKey === "lowestKeywords") && isLoadingLowestKeywords) ||
  //   ((viewKey === "regions") && isLoadingRegions) ||
  //   ((viewKey === "zipPerformance") && isLoadingZipPerformance) ||
  //   ((viewKey === "extensions") && isLoadingExtensions) ||
  //   ((viewKey === "callouts") && isLoadingCallouts)

  if (isLoading) {
    return <ChartSkeleton height="h-72" />;
  }
  return (
    <div className="bg-white rounded-xl w-full h-full overflow-x-auto">
      <div className="p-3 sm:p-4 md:p-5">
        <h2 className="text-gray-500 text-sm sm:text-base md:text-lg font-normal mb-2 sm:mb-3 md:mb-4 truncate">
          {currentViewData.title}
        </h2>

        <div className="flex bg-gray-100 rounded-full mt-3 md:mt-0 w-[90%] border border-neutral-50 justify-center mx-auto align-center text-center m-0">
          {isInsight ? (
            <DynamicTabs
              tabs={[
                { key: "roas", label: "ROAS", icon: "/Dollar_arrows.svg" },
                {
                  key: "costPerLead",
                  label: "Cost per Lead",
                  icon: "/Dollar_arrows.svg",
                },
              ]}
              metric={activeTab}
              onTabChange={setActiveTab}
            />
          ) : (
            <div className="flex w-full gap-2 mx-auto my-0">
              {["leads", "revenue", "roi"].map((tab) => (
                <button
                  key={tab}
                  className={`flex items-center justify-center flex-1 gap-1 px-1 md:px-2 py-0.5 sm:py-2 text-xs md:text-sm rounded-full transition-colors duration-200 whitespace-nowrap 
        ${activeTab === tab
                      ? "bg-white shadow-sm text-gray-800"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {activeTab === tab && (
                    <>
                      {tab === "leads" && <img src="/Hand-heart.svg" />}
                      {tab === "revenue" && (
                        <DollarSign size={iconSize} className="mr-1 sm:mr-2" />
                      )}
                      {tab === "roi" && (
                        <BarChart2 size={iconSize} className="mr-1 sm:mr-2" />
                      )}
                    </>
                  )}
                  {tab === 'roi' ? tab.toUpperCase() : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative h-36 sm:h-40 md:h-44 mb-2">
          {getActiveData()?.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
          <canvas ref={chartRef} />
          {/* {hoveredBarData && hoveredIndex === 2 && (
            <div
              className="absolute bg-gray-100 bg-opacity-90 rounded-md shadow z-20 text-xs sm:text-sm py-1 px-2 sm:px-3 flex items-center"
              style={{
                left: tooltipPosition.x - 20,
                top: tooltipPosition.y - 30,
              }}
            >
              <span className="text-green-500 font-medium mr-1">+1%</span>
              <ChevronUp size={iconSize - 2} className="text-green-500" />
            </div>
          )} */}
        </div>

        <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
          {currentViewData.labels.map((label, index) => (
            <div
              key={index}
              className={`flex justify-between py-1 sm:py-1.5 md:py-2 px-1 ${index % 2 === 1 ? "bg-gray-50" : ""
                } ${hoveredIndex === index
                  ? "hover-gradient text-[#707889]"
                  : "cursor-pointer"
                }`}
            >
              <span className="truncate pr-2" title={label}>
                {getDisplayLabel(label)}
              </span>
              <span className="font-medium whitespace-nowrap">
                {formatValue(getActiveData()?.[index] ?? 0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
