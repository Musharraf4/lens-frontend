'use client';

import { NoticeProps } from '@/types';

export function Notice({ count, message }: NoticeProps) {
  return (
    <div className="mb-4">
      <h3 className="font-medium mb-2">Notice:</h3>
      <div className="flex items-start">
        <span className="text-amber-500 font-medium mr-1">{count}</span>
        <span className="text-gray-800">{message}</span>
      </div>
    </div>
  );
}
