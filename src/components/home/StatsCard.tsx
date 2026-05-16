'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  title?: string;
  value: string;
  change: string;
  isPositive?: boolean;
  subtitle?: string;
  subtitleValue?: string;
  subtitleChange?: string;
  subtitleIsPositive?: boolean;
  headerContent?: ReactNode;
}

export function StatsCard({
  title,
  value,
  change,
  isPositive = true,
  subtitle,
  subtitleValue,
  subtitleChange,
  subtitleIsPositive = true,
  headerContent
}: StatsCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm w-full">
      {/* Header Section */}
      {headerContent ? (
        <div className="mb-3 sm:mb-4">{headerContent}</div>
      ) : (
        title && (
          <span className="text-xs sm:text-sm text-gray-600 block mb-2 sm:mb-3">
            {title}
          </span>
        )
      )}

      {/* Main Value Section */}
      <div className="mb-1 sm:mb-2">
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold truncate">
            {value}
          </span>
          <span
            className={`text-xs sm:text-sm ${isPositive ? 'text-green-500' : 'text-red-500'
              } whitespace-nowrap`}
          >
            {change}
          </span>
        </div>
      </div>

      {/* Subtitle Section */}
      {subtitle && (
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
          <span className="text-xs sm:text-sm text-gray-600">{subtitle}</span>
          <div className="flex justify-between items-baseline mt-1 gap-2">
            <span className="text-base sm:text-lg font-bold truncate">
              {subtitleValue}
            </span>
            <span
              className={`text-xs sm:text-sm ${subtitleIsPositive ? 'text-green-500' : 'text-red-500'
                } whitespace-nowrap`}
            >
              {subtitleChange}
            </span>
          </div>
        </div>
      )}

      {/* Responsive CSS for very small screens */}
      <style jsx>{`
        @media (max-width: 360px) {
          .text-xl {
            font-size: 1.125rem;
            line-height: 1.75rem;
          }
          .text-base {
            font-size: 0.9375rem;
            line-height: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}