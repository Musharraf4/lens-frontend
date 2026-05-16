import { useState } from 'react';
import { useMatchTypePerformance } from '@/services/googleAds.api';
import RevenuePieChart, { PieChartSegment, Tab } from '@/components/charts/RevenuePieChart';
import { ChartRoundSkeleton } from '../home/Skeleton';
import { Skeleton } from '../ui/skeleton';

interface MatchTypePerformancePieChartProps {
  configId: string;
  date_range: string;
  height?: number;
  width?: number;
}

const MATCH_TYPE_COLORS = {
  default: '#8A70FF',
  colors: ['#8A70FF', '#4285F4', '#B3D936', '#EEEEEE', '#FFB74D', '#4CAF50', '#F44336', '#9C27B0']
};

export default function MatchTypePerformancePieChart({
  configId,
  date_range,
  height = 400,
  width = 400
}: MatchTypePerformancePieChartProps) {
  const { data: matchTypeResponse, isLoading, error } = useMatchTypePerformance(configId, date_range);
  const [activeTab, setActiveTab] = useState<Tab>('roas');
  const transformMatchTypeData = (): PieChartSegment[] => {
    if (!matchTypeResponse?.results) return [];

    // Combine all match types from all customers and aggregate by match_type
    const aggregatedMatchTypes: Record<string, {
      match_type: string;
      impr: number;
      clicks: number;
      leads: number;
      revenue: number;
      roi: number | null;
      cpl: number;
      roas: number;
    }> = {};

    matchTypeResponse.results.forEach(customer => {
      customer.match_types?.forEach(matchType => {
        const key = matchType.match_type;

        if (!aggregatedMatchTypes[key]) {
          aggregatedMatchTypes[key] = {
            match_type: matchType.match_type,
            impr: 0,
            clicks: 0,
            leads: 0,
            revenue: 0,
            roas: 0,
            cpl: 0,
            roi: null
          };
        }

        // Aggregate the metrics
        aggregatedMatchTypes[key].impr += matchType.impr || 0;
        aggregatedMatchTypes[key].clicks += matchType.clicks || 0;
        aggregatedMatchTypes[key].leads += matchType.leads || 0;
        aggregatedMatchTypes[key].revenue += matchType.revenue || 0;
        aggregatedMatchTypes[key].roas += matchType.roas || 0;
        aggregatedMatchTypes[key].cpl += matchType.cpl || 0;

        // For ROI, we'll need to calculate it based on total revenue and cost
        // For now, we'll handle null values appropriately
        if (matchType.roi !== null && matchType.roi !== undefined) {
          if (aggregatedMatchTypes[key].roi === null) {
            aggregatedMatchTypes[key].roi = matchType.roi;
          } else {
            // Average ROI (you might want to adjust this calculation based on your business logic)
            aggregatedMatchTypes[key].roi = (aggregatedMatchTypes[key].roi + matchType.roi) / 2;
          }
        }
      });
    });

    // Convert to array and sort based on the active tab
    const matchTypesArray = Object.values(aggregatedMatchTypes)
      .filter(matchType => matchType.revenue > 0 || matchType.leads > 0) // Filter out zero values
      .sort((a, b) => {
        switch (activeTab) {
          case 'roas':
            return b.roas - a.roas;
          case 'costPerLead':
            return (b.cpl || 0) - (a.cpl || 0);
          default:
            return b.revenue - a.revenue;
        }
      })
      .slice(0, 4);

    return matchTypesArray.map((matchType, index) => ({
      name: matchType.match_type,
      value: matchType.revenue,
      color: MATCH_TYPE_COLORS.colors[index % MATCH_TYPE_COLORS.colors.length],
      leads: matchType.leads,
      cost: matchType.revenue,
      cpl: matchType.cpl,
      roas: matchType.roas,
      roi: matchType.roi || 0,
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
          <span className="text-red-500">Error loading match type data</span>
        </div>
      </div>
    );
  }

  const matchTypeData = transformMatchTypeData();

  // if (matchTypeData.length === 0) {
  //   return (
  //     <div className="bg-white rounded-xl w-full p-3 sm:p-4 md:p-6">
  //       <div className="flex items-center justify-center h-[400px]">
  //         <span className="text-gray-500">No match type data available</span>
  //       </div>
  //     </div>
  //   );
  // }

  // Calculate totals from all match types across all customers
  const totals = matchTypeResponse?.results?.reduce((acc, customer) => {
    customer.match_types?.forEach(matchType => {
      acc.revenue += matchType.revenue || 0;
      acc.leads += matchType.leads || 0;
      if (matchType.roi !== null && matchType.roi !== undefined) {
        acc.roiSum += matchType.roi;
        acc.roiCount += 1;
      }
      if (matchType.cpl !== null && matchType.cpl !== undefined) {
        acc.cpl += matchType.cpl;
      }
      if (matchType.roas !== null && matchType.roas !== undefined) {
        acc.roas += matchType.roas;
      }
    });
    return acc;
  }, { revenue: 0, leads: 0, roiSum: 0, roiCount: 0, cpl: 0, roas: 0 }) || { revenue: 0, leads: 0, roiSum: 0, roiCount: 0, cpl: 0, roas: 0 };

  const totalRevenue = totals.revenue;
  const totalLeads = totals.leads;
  const totalRoi = totals.roiCount > 0 ? totals.roiSum / totals.roiCount : 0;

  // Calculate comparison change (you might want to adjust this based on your needs)
  const comparisonChange = -5;
  return (
    <RevenuePieChart
      height={height}
      width={width}
      data={matchTypeData}
      totalRevenue={totalRevenue}
      totalLeads={totalLeads}
      totalRoi={totalRoi}
      totalCpl={totals.cpl}
      totalRoas={totals.roas}
      comparisonChange={comparisonChange}
      activeTab={activeTab}
      onTabChange={(t: Tab) => setActiveTab(t)}
      title="Match Type Performance"
      isInsight
    />
  );
}
