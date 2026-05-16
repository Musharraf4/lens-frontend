"use client"

import React from 'react';
import DataTable from '@/components/DataTable';
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useNegativeKeywordsInsights } from '@/services/googleAds.api';
import { FaSort } from 'react-icons/fa';
import { CURRENCY_SYMBOL } from '@/constants';

interface INegativeKeyword {
  keyword: string;
  impressions: number;
  clicks: number;
  leads: number;
  deals: number;
  revenue: number;
  roas: number;
  cost: number;
}

interface NegativeKeywordsTableProps {
  configId: string;
  date_range: string;
}

export function NegativeKeywordsTable({ configId, date_range }: NegativeKeywordsTableProps) {
  const { data: negativeKeywordsResponse, isLoading } = useNegativeKeywordsInsights(configId, date_range);

  // Combine insights from all customers
  const negativeKeywords = (() => {
    if (!negativeKeywordsResponse?.results) return [];

    // Aggregate insights across all customers by search term
    const aggregatedInsights: Record<string, {
      search_term: string;
      impressions: number;
      clicks: number;
      cost: number;
      leads: number;
      deals: number;
      revenue: number;
      roas: number;
    }> = {};

    negativeKeywordsResponse.results.forEach(customer => {
      customer.insights?.forEach(insight => {
        const searchTerm = insight.search_term;

        if (!aggregatedInsights[searchTerm]) {
          aggregatedInsights[searchTerm] = {
            search_term: insight.search_term,
            impressions: 0,
            clicks: 0,
            cost: 0,
            leads: 0,
            deals: 0,
            revenue: 0,
            roas: 0
          };
        }

        // Aggregate the metrics
        aggregatedInsights[searchTerm].impressions += insight.impressions || 0;
        aggregatedInsights[searchTerm].clicks += insight.clicks || 0;
        aggregatedInsights[searchTerm].cost += insight.cost || 0;
        aggregatedInsights[searchTerm].leads += insight.leads || 0;
        aggregatedInsights[searchTerm].deals += insight.deals || 0;
        aggregatedInsights[searchTerm].revenue += insight.revenue || 0;
      });
    });

    // Recalculate ROAS based on aggregated totals
    Object.values(aggregatedInsights).forEach(insight => {
      insight.roas = insight.cost > 0 ? insight.revenue / insight.cost : 0;
    });

    return Object.values(aggregatedInsights);
  })();

  const columns: ColumnDef<INegativeKeyword>[] = [
    {
      accessorKey: "search_term",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full text-inherit"
        >
          Keyword
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const keyword = row.getValue("search_term") as string;
        return <span className="font-medium">{keyword}</span>;
      },
    },
    {
      accessorKey: "impressions",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Impressions
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("impressions") as number;
        return <span>{value?.toLocaleString() || "0"}</span>;
      },
    },
    {
      accessorKey: "clicks",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Clicks
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("clicks") as number;
        return <span>{value?.toLocaleString() || "0"}</span>;
      },
    },
    {
      accessorKey: "leads",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Leads
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("leads") as number;
        return <span>{value?.toLocaleString() || "0"}</span>;
      },
    },
    {
      accessorKey: "deals",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Cases
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("deals") as number;
        return <span>{value?.toLocaleString() || "0"}</span>;
      },
    },
    {
      accessorKey: "revenue",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Revenue
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("revenue") as number;
        return <span>{CURRENCY_SYMBOL}{value?.toFixed(2) || "0.00"}</span>;
      },
    },
    {
      accessorKey: "roas",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          ROAS
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("roas") as number;
        return <span>{value?.toFixed(1) || "0.0"}</span>;
      },
    },
    {
      accessorKey: "cost",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Cost
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("cost") as number;
        return <span>{CURRENCY_SYMBOL}{value?.toFixed(2) || "0.00"}</span>;
      },
    },
  ];

  return (
    <div>
      <div className="bg-white rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Negative keyword suggestions</h2>
        {!configId ? (
          <div className="text-amber-600 mb-4">
            Please select a configuration ID to view negative keywords data.
          </div>
        ) : negativeKeywords.length === 0 && !isLoading ? (
          <div className="text-gray-500 mb-4">No negative keywords data available for this customer.</div>
        ) : null}

        <DataTable
          columns={columns}
          data={negativeKeywords}
          isDataLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default NegativeKeywordsTable;
