'use client'

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { StatusTag, StatusType } from "@/components/StatusTag";
import { Skeleton } from "@/components/ui/skeleton";
import ContactEmptyState from "./contactDetails/ContactEmptyState";

export interface TimelineItem {
    title: string;
    description?: string;
    datetime: string;
    status?: string;
    statusType?: StatusType;
    statusIcon?: React.ReactNode;
    icon: React.ReactNode;
    body?: React.ReactNode;
}

export interface TimelineProps {
    items: TimelineItem[];
    className?: string;
    isLoading?: boolean
}

// Timeline skeleton loader
const TimelineSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
    <div className="relative">
        <div className="flex flex-col gap-12">
            {Array.from({ length: count }).map((_, idx) => (
                <div key={idx} className="relative pl-14 min-h-[60px]">
                    {/* Vertical line segment - match gap-12 (48px) */}
                    {idx < count - 1 && (
                        <div
                            className="absolute left-5 w-px bg-neutral-200"
                            style={{ top: "20px", height: "170px" }}
                        />
                    )}
                    {/* Solid skeleton circle */}
                    <div className="absolute left-5 top-0 transform -translate-x-1/2 z-10">
                        <Skeleton className="rounded-full w-10 h-10" />
                    </div>
                    {/* Content skeleton */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-1/4 rounded mb-2" />
                            <Skeleton className="h-4 w-16 rounded" />
                        </div>
                        <div className="flex items-center justify-between gap-16">
                            <Skeleton className="h-4 w-1/2 rounded mt-1 mb-2" />
                            <Skeleton className="h-5 w-16 rounded ml-2" />
                        </div>
                        <div className="mt-3 px-6 py-4">
                            <Skeleton className="h-4 w-full rounded mb-2" />
                            <Skeleton className="h-4 w-3/4 rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const Timeline: React.FC<TimelineProps> = ({ items, className, isLoading }) => {
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [lineHeights, setLineHeights] = useState<number[]>([]);

    useEffect(() => {
        if (itemRefs.current.length === 0) return;

        const newLineHeights = items.map((_, idx) => {
            if (idx === items.length - 1) return 0; // Last item doesn't need a line

            const currentItem = itemRefs.current[idx];
            const nextItem = itemRefs.current[idx + 1];

            if (!currentItem || !nextItem) return 0;

            // Get the distance between the center of current icon and center of next icon
            const currentIconCenter = 6; // 1px (top) + 5px (half of icon)
            const nextIconTop = nextItem.offsetTop - currentItem.offsetTop;

            return nextIconTop + currentIconCenter - 5; // Subtract a bit for visual adjustment
        });

        setLineHeights(newLineHeights);
    }, [items, isLoading]);

    if (isLoading) {
        return <TimelineSkeleton count={items.length || 5} />;
    }

    if (items.length === 0) return <ContactEmptyState />
    return (
        <div className={cn("relative", className)}>
            <div className="flex flex-col gap-4">
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        ref={(el) => {
                            itemRefs.current[idx] = el;
                        }}
                        className="relative pl-14 min-h-[60px]"
                    >
                        {/* Vertical line segment - using dynamic height */}
                        {idx < items.length - 1 && (
                            <div
                                className="absolute left-5 w-px bg-neutral-200"
                                style={{
                                    top: "6px", // Center of current icon
                                    height: `${lineHeights[idx] || 'calc(3rem + 40px)'}px` // Dynamic height with fallback
                                }}
                            />
                        )}

                        {/* Icon */}
                        <div className="absolute left-5 top-1 transform -translate-x-1/2 z-10">
                            <div className="bg-white border border-neutral-200 rounded-full w-10 h-10 flex items-center justify-center shadow-sm">
                                {item.icon}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="text-black font-semibold text-base leading-6  capitalize tracking-[-0.02em] w-[90%] break-all overflow-wrap-anywhere">{item.title}</h3>

                                <span className="text-xs text-black/60 font-light leading-4 tracking-[-0.03em] text-right whitespace-nowrap">{item.datetime}</span>
                            </div>
                            <div className="flex items-center justify-between gap-16">
                                {item.description && (
                                    <div className="text-neutral-600 text-sm font-light leading-5 tracking-[-0.03em] mt-1 mb-2 truncate cursor-pointer hover:underline hover:underline-offset-2 ">{item.description}</div>
                                )}
                                {item.status && (
                                    <StatusTag type={item.statusType || "default"} className="ml-2" showIcon={true} icon={item.statusIcon}>
                                        {item.status}
                                    </StatusTag>
                                )}
                            </div>
                            {item.body && (
                                <div className="mt-3 py-2 w-[90%]">
                                    {item.body}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline; 