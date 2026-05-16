"use client";

import DataTable from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { SortButton } from "../common/SortButton";
import { IOrganicRow } from "@/app/(protected)/acquisition/landing-pages/page";

interface OrganicTableProps {
  data?: IOrganicRow[];
}

export function OrganicTable({ data }: OrganicTableProps) {
  /**********************
   * COLUMN DEFINITIONS *
   **********************/
  const columns: ColumnDef<IOrganicRow>[] = [
    {
      accessorKey: "landing_page",
      header: ({ column }) => (
        <SortButton column={column} label="Landing page" />
      ),
      cell: ({ row }) => {
        const url = row.original.landing_page;
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline truncate max-w-[220px] block"
          >
            {url}
          </a>
        );
      },
    },
    {
      accessorKey: "traffic",
      header: ({ column }) => <SortButton column={column} label="Traffic" />,
      cell: ({ row }) => <strong>{row.original.traffic.toLocaleString()}</strong>,
    },
    {
      accessorKey: "leads",
      header: ({ column }) => <SortButton column={column} label="Leads" />,
      cell: ({ row }) => row.original.leads.toLocaleString(),
    },
    {
      accessorKey: "deals",
      header: ({ column }) => <SortButton column={column} label="Cases" />,
      cell: ({ row }) => row.original.deals.toLocaleString(),
    },
    {
      accessorKey: "revenue",
      header: ({ column }) => <SortButton column={column} label="Revenue" />,
      cell: ({ row }) =>
        `$${row.original.revenue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      accessorKey: "rps",
      header: ({ column }) => <SortButton column={column} label="RPS" />,
      cell: ({ row }) =>
        `$${row.original.rps.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      accessorKey: "bounce_rate",
      header: ({ column }) => <SortButton column={column} label="Bounce rate" />,
      cell: ({ row }) => `${row.original.bounce_rate}%`,
    },
    {
      accessorKey: "avg_session_duration",
      header: ({ column }) => (
        <SortButton column={column} label="Avg session dur." />
      ),
      cell: ({ row }) => row.original.avg_session_duration,
    },
  ];

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No data available
      </div>
    );
  }

  return <DataTable columns={columns} data={data} />;
}


