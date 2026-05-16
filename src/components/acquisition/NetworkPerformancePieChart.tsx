import { useNetworkPerformance } from '@/services/googleAds.api';
import RevenuePieChart, { PieChartSegment, Tab } from '@/components/charts/RevenuePieChart';
import { useState } from 'react';
import { ChartRoundSkeleton } from '../home/Skeleton';
import { Skeleton } from '../ui/skeleton';

interface NetworkPerformancePieChartProps {
  configId: string;
  date_range: string
  height?: number;
  width?: number;
}

// Colors for different network segments
const NETWORK_COLORS = {
  default: '#8A70FF',
  colors: ['#8A70FF', '#4285F4', '#B3D936', '#EEEEEE', '#FFB74D', '#4CAF50', '#F44336', '#9C27B0']
};

export default function NetworkPerformancePieChart({
  configId,
  date_range,
  height = 400,
  width = 400
}: NetworkPerformancePieChartProps) {
  const { data: networkResponse, isLoading, error } = useNetworkPerformance(configId, date_range);
  const [activeTab, setActiveTab] = useState<Tab>('roas');
  // Transform network data into the format expected by RevenuePieChart
  const transformNetworkData = (): PieChartSegment[] => {
    if (!networkResponse?.results) return [];

    // Combine all network performance from all customers and aggregate by network
    const aggregatedNetworks: Record<string, {
      network: string;
      impr: number;
      clicks: number;
      leads: number;
      cost: number;
      revenue: number;
      roas: number;
      cpl: number;
      roi: number | null;
    }> = {};

    networkResponse.results.forEach(customer => {
      customer.performance?.forEach(networkPerf => {
        const networkType = networkPerf.network;

        if (!aggregatedNetworks[networkType]) {
          aggregatedNetworks[networkType] = {
            network: networkPerf.network,
            impr: 0,
            clicks: 0,
            leads: 0,
            cost: 0,
            revenue: 0,
            roas: 0,
            cpl: 0,
            roi: null
          };
        }

        // Aggregate the metrics
        aggregatedNetworks[networkType].impr += networkPerf.impr || 0;
        aggregatedNetworks[networkType].clicks += networkPerf.clicks || 0;
        aggregatedNetworks[networkType].leads += networkPerf.leads || 0;
        aggregatedNetworks[networkType].cost += networkPerf.cost || 0;
        aggregatedNetworks[networkType].revenue += networkPerf.revenue || 0;
        aggregatedNetworks[networkType].roas += networkPerf.roas || 0;
        aggregatedNetworks[networkType].cpl += networkPerf.cpl || 0;
      });
    });

    // Calculate derived metrics after aggregation
    Object.values(aggregatedNetworks).forEach(network => {
      // Recalculate ROAS (Return on Ad Spend)

      // Recalculate ROI
      network.roi = network.cost > 0 ? ((network.revenue - network.cost) / network.cost) * 100 : null;

    });

    // Convert to array and sort based on the active tab
    const networksArray = Object.values(aggregatedNetworks)
      .filter(network => network.revenue > 0 || network.leads > 0) // Filter out zero values
      .sort((a, b) => {
        switch (activeTab) {
          case 'revenue':
            return b.revenue - a.revenue;
          case 'leads':
            return b.leads - a.leads;
          case 'roi':
            return (b.roi || 0) - (a.roi || 0);
          case 'roas':
            return b.roas - a.roas;
          case 'costPerLead':
            return (b.cpl || 0) - (a.cpl || 0);
          default:
            return b.revenue - a.revenue;
        }
      })
      .slice(0, 4);

    return networksArray.map((network, index) => ({
      name: network.network,
      value: network.revenue,
      color: NETWORK_COLORS.colors[index % NETWORK_COLORS.colors.length],
      leads: network.leads,
      cost: network.cost,
      cpl: network.cpl,
      roas: network.roas,
      roi: network.roi || 0
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-6 w-48 mb-4" />
        </div>
        <div className="bg p-1 flex flex-col xl:flex-row justify-between items-center lg:items-center">
          <ChartRoundSkeleton />

          {/* Text Skeletons */}
          <div className="flex flex-col">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-8 w-48 mb-4" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl w-full p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-center h-[400px]">
          <span className="text-red-500">Error loading network data</span>
        </div>
      </div>
    );
  }

  const networkData = transformNetworkData();

  // Calculate totals from all networks across all customers
  const totals = networkResponse?.results?.reduce((acc, customer) => {
    customer.performance?.forEach(networkPerf => {
      acc.revenue += networkPerf.revenue || 0;
      acc.leads += networkPerf.leads || 0;
      acc.cost += networkPerf.cost || 0;
      if (networkPerf.roi !== null && networkPerf.roi !== undefined) {
        acc.roiSum += networkPerf.roi;
        acc.roiCount += 1;
      }
      if (networkPerf.cpl !== null && networkPerf.cpl !== undefined) {
        acc.cpl += networkPerf.cpl;
      }
      if (networkPerf.roas !== null && networkPerf.roas !== undefined) {
        acc.roas += networkPerf.roas;
      }
      if (networkPerf.roi !== null && networkPerf.roi !== undefined) {
        acc.roi += networkPerf.roi;
      }
    });
    return acc;
  }, { revenue: 0, leads: 0, cost: 0, roiSum: 0, roiCount: 0, cpl: 0, roas: 0, roi: 0 }) || { revenue: 0, leads: 0, cost: 0, roiSum: 0, roiCount: 0, cpl: 0, roas: 0, roi: 0 };

  const totalRevenue = totals.revenue;
  const totalLeads = totals.leads;
  // Calculate overall ROI based on total revenue and cost
  const totalRoi = totals.roi;

  // Calculate comparison change (you might want to adjust this based on your needs)
  const comparisonChange = -5;
  return (
    <RevenuePieChart
      height={height}
      width={width}
      data={networkData}
      totalRevenue={totalRevenue}
      totalLeads={totalLeads}
      totalRoi={totalRoi}
      totalCpl={totals.cpl}
      totalRoas={totals.roas}
      comparisonChange={comparisonChange}
      activeTab={activeTab}
      onTabChange={(t: Tab) => setActiveTab(t)}
      title="Network Performance"
      isInsight
    />
  );
}