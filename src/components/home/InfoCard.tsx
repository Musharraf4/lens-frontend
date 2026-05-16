'use client';

import { InfoCardProps } from '@/types';

export function InfoCard({ title, value, highlight }: InfoCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">{title}</span>
      </div>
      <div className="flex">
        <span className="text-lg font-semibold">{value}</span>
        {highlight && <span className="text-xs ml-2 text-gray-500">{highlight}</span>}
      </div>
    </div>
  );
}
