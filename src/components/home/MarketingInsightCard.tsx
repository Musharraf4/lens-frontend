'use client';

import { ReactNode } from 'react';

interface MarketingInsightCardProps {
  title: string;
  children: ReactNode;
  isLast?: boolean;
}

export function MarketingInsightCard({ title, children, isLast }: MarketingInsightCardProps) {
  return (
    <div className={`
      bg-white p-3 sm:p-4 flex-1
      border-r border-gray-200 last:border-r-0
      min-w-[150px] sm:min-w-[180px]
    `}>
      <style jsx>{`
        @media (max-width: 640px) {
          .insight-card {
            border-bottom: 1px solid #e5e7eb;
            border-right: none;
          }
          .insight-card:last-child {
            border-bottom: none;
          }
        }
      `}</style>

      <div className="insight-card">
        <h3 className="text-neutral-500 text-xs sm:text-sm mb-1 sm:mb-2">{title}</h3>
        <div className="text-xs sm:text-sm leading-tight sm:leading-normal">
          {children}
        </div>
      </div>
    </div>
  );
}