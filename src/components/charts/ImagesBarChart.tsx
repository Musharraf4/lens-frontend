'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import DynamicTabs from './DynamicTabs';
import { usegetGAdsImages } from '@/services/googleAds.api';

// Helper: Round up max value to a nicer number
const getNiceMaxValue = (max: number) => {
  if (max === 0) return 1;
  const exponent = Math.floor(Math.log10(max));
  const factor = Math.pow(10, exponent);
  return Math.ceil(max / factor) * factor;
};

interface ImagesBarChartProps {
  className?: string;
  configId: string;
  date_range: string
}

export default function ImagesBarChart({ className, configId, date_range }: ImagesBarChartProps) {
  const [metric, setMetric] = useState<'roas' | 'costPerLead'>('roas');
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const { data, isLoading } = usegetGAdsImages(configId, date_range);
  const transformData = data ? data?.results?.[0]?.performance?.map((item) => ({
    id: item.campaign_id,
    value: item.images?.map(img => metric === 'roas' ? img.roas : img.cpl).reduce((a, b) => a + b, 0) || 0,
    alt: item.campaign_name,
    image: item.images?.[0]?.url
  }))?.sort((a, b) => b.value - a.value) : [];
  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Calculate the max value for scaling
  const maxValueRaw = Math.max(...transformData.map((item) => item.value));
  const minValueRaw = Math.min(...transformData.map((item) => item.value));
  const maxValue = getNiceMaxValue(maxValueRaw);
  const range = maxValue === minValueRaw ? maxValue || 1 : maxValue - minValueRaw;
  const stepSize = range / 5;

  // Get value for tooltip
  const getTooltipValue = (index: number) => {
    const rawValue = transformData[index].value;
    const formattedValue =
      rawValue >= 1 ? rawValue.toFixed(1) : rawValue.toFixed(3);

    return {
      value: `${formattedValue} ▲`,
      image: transformData[index].image
    };
  };

  return (
    <Card className={className} style={{ boxShadow: 'none', border: 'none' }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Images</CardTitle>
        <div className="flex bg-gray-100 rounded-full mt-3 md:mt-0 w-fit border border-neutral-50 justify-center mx-auto md:mx-0 md:ml-auto">
          <DynamicTabs
            tabs={[
              { key: 'roas', label: 'ROAS', icon: '/Dollar_arrows.svg' },
              { key: 'costPerLead', label: 'Cost per Lead', icon: '/Dollar_arrows.svg' }
            ]}
            metric={metric}
            onTabChange={setMetric}
          />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="w-full h-[300px] relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-sm text-gray-500">
            {[...Array(6)].map((_, i) => {
              const value = maxValue - i * stepSize;
              const formatted = value < 1 ? value.toFixed(3) : value.toFixed(1);
              return <div key={i}>{formatted !== 'NaN' ? formatted : i}</div>;
            })}
          </div>

          {/* Horizontal grid lines */}
          <div className="absolute left-[40px] right-0 top-0 h-full">
            {[0, 1, 2, 3, 4, 5].map((_, index) => (
              <div
                key={index}
                className="absolute w-full border-t border-gray-200"
                style={{ top: `${index * 20}%` }}
              />
            ))}
          </div>

          {/* Chart bars */}
          <div className="absolute left-[50px] right-0 top-0 bottom-0 flex justify-around items-end">
            {isLoading ? (
              // Skeleton loading state
              [1, 2, 3, 4, 5].map((_, index) => (
                <div key={index} className="flex flex-col items-center w-[18%]">
                  <Skeleton className="w-full aspect-video mb-2 rounded-lg" />
                  <Skeleton className="w-full h-[150px] rounded-lg" />
                </div>
              ))
            ) : (
              // Actual chart bars with images
              transformData.map((item, index) => {
                const heightPercentage = (item.value / maxValue) * 100;

                return (
                  <div
                    key={item.id}
                    className="w-[18%] h-full relative"
                    onMouseEnter={() => { item.value > 0 && setHoveredBar(index) }}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Gray bar with image inside - visible and fixed at bottom */}
                    <div
                      className="absolute bottom-0 left-0 w-full bg-gray-100 rounded-lg border-2 border-white overflow-hidden"
                      style={{ height: `${heightPercentage}%` }}
                    >
                      {/* Image container - inside top part of the bar */}
                      <div className="absolute top-0 left-0 w-full p-2 aspect-video overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.alt}
                          className="w-full h-full object-cover border-3 border-white rounded"
                        />
                      </div>
                    </div>

                    {/* Tooltip */}
                    {hoveredBar === index && (
                      <div
                        className="absolute bg-white border border-gray-200 z-50 rounded-lg p-3 flex flex-col items-center justify-center shadow-lg"
                        style={{
                          bottom: `calc(${heightPercentage}% + 10px)`,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '300px'
                        }}
                      >
                        <div className="w-full aspect-video rounded-md overflow-hidden mb-2">
                          <img
                            src={getTooltipValue(index).image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="font-bold text-primary text-center">
                          {getTooltipValue(index).value}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
