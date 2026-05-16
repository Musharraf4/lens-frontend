"use client"

import React from 'react';
import DataTable from '@/components/DataTable';
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ICampaign, useCampaigns } from '@/services/googleAds.api';
import { FaSort } from 'react-icons/fa';
import { CURRENCY_SYMBOL } from '@/constants';

interface CampaignsTableProps {
  configId: string;
  date_range: string;
}

export function CampaignsTable({ configId, date_range }: CampaignsTableProps) {
  const { data: campaignsResponse, isLoading: isCampaignsLoading } = useCampaigns(configId, date_range);

  // Flatten campaigns from all customers into a single array
  const campaigns = React.useMemo(() => {
    if (!campaignsResponse?.campaigns) return [];

    return campaignsResponse.campaigns.flatMap(customer => customer.campaigns);
  }, [campaignsResponse]);

  const campaignColumns: ColumnDef<ICampaign>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full text-inherit"
        >
          Campaign
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        return <span className="font-medium">{name}</span>;
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
      cell: ({ row }) => `${CURRENCY_SYMBOL}${(Math.round(row.getValue("revenue")) as unknown as string).toLocaleString()}`,
    },
    {
      accessorKey: "ad_spend",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Ad spend
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("ad_spend") as number;
        return `${CURRENCY_SYMBOL}${(Math.round(row.getValue("ad_spend")) as unknown as string).toLocaleString()}`;
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
      accessorKey: "cpl",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Cost per lead
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("cpl") as number | null;
        return `${CURRENCY_SYMBOL}${(Math.round(row.getValue("cpl")) as unknown as string).toLocaleString()}`;
      },
    },
    {
      accessorKey: "deals", // Using leads as a placeholder for "Cases"
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
        // This is a placeholder - replace with actual deals data if available
        return <span>0</span>;
      },
    },
    {
      accessorKey: "deal_value", // Using revenue as a placeholder for "Deal value"
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Case value
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        // This is a placeholder - replace with actual deal value if available
        return <span>-</span>;
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
          ROI
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("roas") as number | null;
        return <span>{value ? value.toFixed(1) : "-"}</span>;
      },
    },
    {
      accessorKey: "cpc",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          CPC
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("cpc") as number | null;
        return `${CURRENCY_SYMBOL}${(Math.round(row.getValue("cpc")) as unknown as string).toLocaleString()}`;
      },
    },
  ];

  // Use the flattened campaigns data
  const tableData = campaigns.length > 0 ? campaigns : [];

  return (
    <div>
      <div className="bg-white rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Campaign Performance</h2>
        {!configId ? (
          <div className="text-amber-600 mb-4">
            Please select a customer ID to view campaign data.
          </div>
        ) : campaigns || isCampaignsLoading ? (
          <DataTable
            columns={campaignColumns}
            data={tableData}
            isDataLoading={isCampaignsLoading}
          />
        ) : null}
      </div>
    </div>
  );
}

export default CampaignsTable;
