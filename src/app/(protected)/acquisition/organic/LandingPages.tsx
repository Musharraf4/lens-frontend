import { SortButton } from "@/components/common/SortButton";
import { ColumnDef } from "@tanstack/react-table";
import React, { useState } from "react";
import { IOrganicRow } from "../landing-pages/page";
import { fmt, useOrganicList } from "@/services/organic.api";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { GenericTable } from "@/components/ui/GenericTable";
import { CURRENCY_SYMBOL } from "@/constants";
import { formatTime, getBaseUrl } from "@/lib/utils";
import TooltipWrapper from "@/components/ui/TooltipWrapper";
import { HelpCircleIcon } from "lucide-react";
import { Tooltip } from "@/components/Tooltip";

export const LandingPages = ({ timeRange }: { timeRange: string }) => {
  const { selectedCompany } = useSelectedCompanyStore();

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const { data, isLoading } = useOrganicList({
    size,
    page,
    date_range: fmt(timeRange),
    companyId: selectedCompany?.company?.id,
  });

  const columns: ColumnDef<IOrganicRow>[] = [
    {
      accessorKey: "landing_page",
      header: ({ column }) => (
        <SortButton
          column={column}
          label="Landing page"
        />
      ),
      cell: ({ row }) => {
        const url = getBaseUrl(row.original.landing_page);
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500  hover:underline truncate max-w-[220px] block"
          >
            {url}
          </a>
        );
      },
    },
    {
      accessorKey: "traffic",
      header: ({ column }) => (
        <SortButton
          column={column}
          label="Traffic"
        />
      ),
      cell: ({ row }) => <strong>{row.original.traffic.toLocaleString()}</strong>,
    },
    {
      accessorKey: "leads",
      header: ({ column }) => (
        <SortButton
          column={column}
          label="Leads"
        />
      ),
      cell: ({ row }) => row.original.leads.toLocaleString(),
    },
    {
      accessorKey: "deals",
      header: ({ column }) => (
        <SortButton
          column={column}
          label="Cases"
        />
      ),
      cell: ({ row }) => row.original.deals.toLocaleString(),
    },
    {
      accessorKey: "revenue",
      header: ({ column }) => (
        <SortButton
          column={column}
          label="Revenue"
        />
      ),
      cell: ({ row }) =>
        `${CURRENCY_SYMBOL}${(Math.round(row.getValue("revenue")) as unknown as string).toLocaleString()}`,
    },
    {
      accessorKey: "rps",
      header: ({ column }) => (
        <div className="flex items-center">
          <SortButton
            column={column}
            label="RPS"
            tooltipText={'Revenue per click shows average amount of revenue based on your conversion rate within a given campaign.'}
          />
        </div>
      ),
      cell: ({ row }) =>
        `${CURRENCY_SYMBOL}${(Math.round(row.getValue("rps")) as unknown as string).toLocaleString()}`,
    },
    {
      accessorKey: "bounce_rate",
      header: ({ column }) => (
        <SortButton
          column={column}
          label="Conv. rate"
        />
      ),
      cell: ({ row }) => `${row.original.bounce_rate}%`,
    },
    {
      accessorKey: "avg_session_duration",
      header: ({ column }) => (
        <SortButton
          column={column}
          label="Avg session duration"
        />
      ),
      cell: ({ row }) => formatTime(row.original.avg_session_duration),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl space-y-4">
      <div className="flex justify-between">
        <p className="text-neutral-500">Landing Pages</p>
      </div>

      <GenericTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        pageIndex={page}
        totalItems={data?.total}
        onPageChange={setPage}
        onPageSizeChange={(pageSize) => {
          setSize(pageSize);
          setPage(1);
        }}
        hidePageSizeDropdown
      />
    </div>
  );
};
