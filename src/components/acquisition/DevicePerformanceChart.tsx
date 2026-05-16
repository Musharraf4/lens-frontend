import { Monitor, Smartphone, Tablet } from 'lucide-react';
import ChannelsChart, { ChannelData } from '../charts/ChannelsChart';
import { useDevicePerformance } from '@/services/googleAds.api';
import { useState } from 'react';

interface DevicePerformanceChartProps {
  configId: string;
  date_range: string
}
type ExtendedChannelData = ChannelData & {
  id: string;
  name: string;
  icon: React.ReactNode;
  channel: string;
  revenue: number;
  sales: number;
  cpl: number;
  roas: number;
};
const defaultDevices: ExtendedChannelData[] = [
  {
    id: 'DESKTOP',
    name: 'Desktop',
    icon: <Monitor className="w-4 h-4 text-gray-500" />,
    revenue: 0,
    channel: 'Desktop',
    sales: 0,
    cpl: 0,
    roas: 0
  },
  {
    id: 'MOBILE',
    name: 'Mobile',
    icon: <Smartphone className="w-4 h-4 text-gray-500" />,
    revenue: 0,
    channel: 'Mobile',
    sales: 0,
    cpl: 0,
    roas: 0
  },
  {
    id: 'TABLET',
    name: 'Tablet',
    icon: <Tablet className="w-4 h-4 text-gray-500" />,
    revenue: 0,
    channel: 'Tablet',
    sales: 0,
    cpl: 0,
    roas: 0
  }
];

export default function DevicePerformanceChart({ configId, date_range }: DevicePerformanceChartProps) {
  const { data, isLoading } = useDevicePerformance(configId, date_range);
  const [selectedChannelToggle, setSelectedChannelToggle] = useState("roas");
  // Transform API data to device data format
  const deviceData = (() => {
    if (!data?.results) return [];

    // Aggregate device performance across all customers
    const aggregatedDevices: Record<string, {
      device: string;
      impr: number;
      clicks: number;
      leads: number;
      cost: number;
      revenue: number;
      roas: number;
      cpl: number;
      roi: number | null;
    }> = {};

    data.results.forEach(customer => {
      customer.performance?.forEach(devicePerf => {
        const deviceId = devicePerf.device;

        if (!aggregatedDevices[deviceId]) {
          aggregatedDevices[deviceId] = {
            device: devicePerf.device,
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
        aggregatedDevices[deviceId].impr += devicePerf.impr || 0;
        aggregatedDevices[deviceId].clicks += devicePerf.clicks || 0;
        aggregatedDevices[deviceId].leads += devicePerf.leads || 0;
        aggregatedDevices[deviceId].cost += devicePerf.cost || 0;
        aggregatedDevices[deviceId].revenue += devicePerf.revenue || 0;
        aggregatedDevices[deviceId].roas += devicePerf.roas || 0;
        aggregatedDevices[deviceId].cpl += devicePerf.cpl || 0;


        // For ROAS, CPL, and ROI, we'll recalculate based on aggregated totals
        // rather than averaging the ratios
      });
    });

    // Calculate derived metrics after aggregation
    Object.values(aggregatedDevices).forEach(device => {
      // Recalculate ROAS (Return on Ad Spend)


      // Recalculate ROI
      device.roi = device.cost > 0 ? ((device.revenue - device.cost) / device.cost) * 100 : null;
    });
    // Map aggregated data to the expected format
    return defaultDevices.map(device => {
      const matchingDevice = aggregatedDevices[device.id];
      return {
        ...device,
        revenue: matchingDevice?.revenue || 0,
        cpl: matchingDevice?.cpl || 0,
        roas: matchingDevice?.roas || 0
      };
    });
  })();

  const chartData = deviceData.map((item) => ({
    ...item,
    channel: item.channel,
    sales: selectedChannelToggle === 'roas' ? item.roas : item.cpl,
  }));
  const maxValue = Math.max(...chartData.map(item => item.sales));
  return (
    <ChannelsChart
      data={chartData as ChannelData[]}
      loading={isLoading}
      title="Device Performance"
      maxValue={maxValue < 1 ? 5 : maxValue} // Setting max value to 5.0
      setSelectedChannelToggle={setSelectedChannelToggle}
      selectedChannelToggle={selectedChannelToggle}
      isInsight={true}
    />
  );
}
