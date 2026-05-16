'use client';

import { Button } from '@/components/ui/button';
import { MetricCardProps } from '@/types';

export function MetricCard({ title, value, change, bgColor, textColor, icon }: MetricCardProps) {
  const isPositiveChange = change && parseFloat(change) >= 0;
  const formattedChange = change ? 
    (change.startsWith('+') ? change : `${isPositiveChange ? '+' : ''}${change}%`) : null;
  
  return (
    <div className={`rounded-lg p-4 ${bgColor || 'bg-gray-100'}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm">{title}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-black text-white p-1">
          <span className="text-xs">↗</span>
        </Button>
      </div>
      <div className="flex flex-col">
        <span className={`text-4xl font-bold ${textColor || 'text-black'}`}>{value}</span>
        {change && (
          <div className="flex items-center mt-2">
            <span className={isPositiveChange ? 'text-green-600' : 'text-red-500'}>
              {formattedChange}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
