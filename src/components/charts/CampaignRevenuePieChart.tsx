import { useState } from 'react';
import { useCampaigns } from '@/services/googleAds.api';
import RevenuePieChart, { PieChartSegment, Tab } from './RevenuePieChart';
import { ChartRoundSkeleton } from '../home/Skeleton';
import { Skeleton } from '../ui/skeleton';

interface CampaignRevenuePieChartProps {
  configId: string;
  dateRange: string;
  height?: number;
  width?: number;
}

const CAMPAIGN_COLORS = [
  '#8A70FF', '#4285F4', '#B3D936', '#EEEEEE',
  '#FFB74D', '#4CAF50', '#F44336', '#9C27B0'
];

export default function CampaignRevenuePieChart({
  configId,
  dateRange,
  height = 400,
  width = 400
}: CampaignRevenuePieChartProps) {
  const { data: campaignsResponse, isLoading, error } =
    useCampaigns(configId, dateRange);

  const [activeTab, setActiveTab] = useState<Tab>('leads');

  const getAllCampaigns = () =>
    campaignsResponse?.campaigns
      ? campaignsResponse.campaigns.flatMap(cust => cust.campaigns)
      : [];

  const transform = (): PieChartSegment[] => {
    const all = getAllCampaigns();
    if (!all.length) return [];

    const top4 = [...all]
      .sort((a, b) => {
        if (activeTab === 'leads') return b.leads - a.leads;
        if (activeTab === 'roi') return (b.roi ?? 0) - (a.roi ?? 0);
        return b.revenue - a.revenue;
      })
      .slice(0, 4);

    return top4.map((c, i) => ({
      name: c.name,
      color: CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length],
      value: activeTab === 'revenue'
        ? c.revenue
        : activeTab === 'leads'
          ? c.leads
          : c.roi ?? 0,
      leads: c.leads,
      cost: 1,
      cpl: c.cpl ?? 0,
      roas: c.roas ?? 0,
      roi: c.roi ?? 0
    }));
  };

  const showMessage = (msg: string) => (
    <div className="bg-white rounded-xl w-full p-6 flex items-center justify-center h-[500px]">
      <span className="text-gray-500">{msg}</span>
    </div>
  );

  if (isLoading) return (
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
  // if (error) return showMessage('Error loading campaign data');

  const data = transform();
  // if (!data.length) return showMessage('No campaign data available');

  const all = getAllCampaigns();
  const totalRevenue = all.reduce((s, c) => s + c.revenue, 0);
  const totalLeads = all.reduce((s, c) => s + c.leads, 0);
  const totalRoi = all.reduce((s, c) => s + (c.roi ?? 0), 0);

  return (
    <RevenuePieChart
      height={height}
      width={width}
      data={data}
      totalRevenue={totalRevenue}
      totalLeads={totalLeads}
      totalRoi={totalRoi}
      comparisonChange={-5}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title="Revenue by campaign"
    />
  );
}
