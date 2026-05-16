"use client";

import { NoDataPage } from "@/components/common/NoDataPage";
import { SortButton } from "@/components/common/SortButton";
import { FilterDefinition, FiltersBar } from "@/components/FiltersBar";
import { DateSelector } from "@/components/home/DateSelector";
import PageHeader from "@/components/PageHeader";
import { GenericTable } from "@/components/ui/GenericTable";
import TooltipWrapper from "@/components/ui/TooltipWrapper";
import { CURRENCY_SYMBOL } from "@/constants";
import { formatTime, getBaseUrl } from "@/lib/utils";
import { fmt, IGetOrganicParams, useOrganicList } from "@/services/organic.api";
import { useDateFilter } from "@/store/DateFilterContext";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { ActiveFilter } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { HelpCircleIcon } from "lucide-react";
import { useMemo, useState } from "react";

export interface IOrganicRow {
  id: string;
  landing_page: string;
  traffic: number;
  leads: number;
  deals: number;
  revenue: number;
  rps: number;
  bounce_rate: number;
  avg_session_duration: string;
}

export default function OrganicAcquisitionPage() {
  const { selectedCompany } = useSelectedCompanyStore();
  const { timeRange, setTimeRange } = useDateFilter();
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const filtersBarConfig: FilterDefinition[] = [
    {
      name: "Channel",
      type: "select",
      options: [
        { name: "Google Ads", value: "google_ads" },
        { name: "Organic", value: "organic" },
        { name: "Referral", value: "referral" },
        { name: "Direct", value: "direct" },
      ],
    },
    {
      name: "Revenue",
      type: "select",
      options: [
        { name: "$0-$100", value: "low" },
        { name: "$100-$500", value: "medium" },
        { name: "$500+", value: "high" },
      ],
    },
    {
      name: "RPS",
      type: "select",
      options: [
        { name: "0$ - $5", value: "5" },
        { name: "5$ - $10", value: "10" },
        { name: "10$ - $20", value: "20" },
        { name: "$20+", value: "20+" },
      ],
    },
    {
      name: "Conversion Rate",
      type: "select",
      options: [
        { name: "0% - 20%", value: "20" },
        { name: "20% - 40%", value: "40" },
        { name: "40% - 60%", value: "60" },
        { name: "60% - 80%", value: "80" },
        { name: "80% - 100%", value: "100" },
      ],
    },
    {
      name: "Avg session duration",
      type: "select",
      options: [
        { name: "0 - 5 min", value: "5" },
        { name: "5 - 10 min", value: "10" },
        { name: "10 - 15 min", value: "15" },
        { name: "15+ min", value: "15+" },
      ],
    },
  ];

  const landingPageParams = useMemo((): IGetOrganicParams => {
    const p: IGetOrganicParams = {
      date_range: fmt(timeRange),
    };

    activeFilters.forEach(({ name, value }) => {
      if (!value) return;

      switch (name) {
        case "Channel":
          p.channel = `${value}`;
          break;

        case "Revenue":
          if (value === "low") {
            p.revenue_min = 0;
            p.revenue_max = 100;
          } else if (value === "medium") {
            p.revenue_min = 100;
            p.revenue_max = 500;
          } else if (value === "high") {
            p.revenue_min = 500;
          }
          break;
        case "Avg session duration":
          if (value === "5") {
            p.avg_sec_min = 0;
            p.avg_sec_max = 5;
          } else if (value === "10") {
            p.avg_sec_min = 5;
            p.avg_sec_max = 10;
          } else if (value === "15") {
            p.avg_sec_min = 10;
            p.avg_sec_max = 15;
          } else if (value === "15+") {
            p.avg_sec_min = 15;
          }
          break;
        case "Conversion Rate":
          if (value === "20") {
            p.conv_min = 0;
            p.conv_max = 20;
          } else if (value === "40") {
            p.conv_min = 20;
            p.conv_max = 40;
          } else if (value === "60") {
            p.conv_min = 40;
            p.conv_max = 60;
          } else if (value === "80") {
            p.conv_min = 60;
            p.conv_max = 80;
          } else if (value === "100") {
            p.conv_min = 80;
            p.conv_min = 100;
          }
          break;
        case "RPS":
          if (value === "5") {
            p.rps_min = 0;
            p.rps_max = 5;
          } else if (value === "10") {
            p.rps_min = 5;
            p.rps_max = 10;
          } else if (value === "20") {
            p.rps_min = 10;
            p.rps_max = 20;
          } else if (value === "20+") {
            p.rps_min = 20;
          }
          break;

        default:
          break;
      }
    });

    return p;
  }, [activeFilters, timeRange]);

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
            className="text-gray-600 hover:underline truncate max-w-[220px] block"
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
      cell: ({ row }) => <p className="text-gray-600">{row.original.leads.toLocaleString()}</p>,
    },
    {
      accessorKey: "deals",
      header: ({ column }) => (
        <SortButton
          column={column}
          label="Cases"
        />
      ),
      cell: ({ row }) => <p className="text-gray-600">{row.original.deals.toLocaleString()}</p>,
    },
    {
      accessorKey: "revenue",
      header: ({ column }) => (
        <SortButton
          column={column}
          label="Revenue"
        />
      ),
      cell: ({ row }) => <span>
        {`${CURRENCY_SYMBOL}${(Math.round(row.getValue("revenue")) as unknown as string).toLocaleString()}`}
      </span>
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
          label="Conv. Rate"
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

  const { data, isLoading } = useOrganicList({
    size,
    page,
    ...landingPageParams,
    companyId: selectedCompany?.company?.id,
  });

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 sm:mb-2">
        <PageHeader
          title="Landing Pages"
          breadcrumbs={[
            { label: "Acquisition" },
            { label: "Landing Pages", href: "/acquisition/landing-pages" },
          ]}
          data-tour="landing-pages-page-header"
        />
        <div className="ml-auto" data-tour="landing-pages-date-selector">
          {isLoading ? (
            <div className="skeleton-gradient w-32 h-10 rounded-md" />
          ) : (
            <DateSelector
              selected={timeRange}
              onChange={setTimeRange}
            />
          )}
        </div>
      </div>

      <div>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4" data-tour="landing-pages-filters">
          <FiltersBar
            disabled={isLoading}
            filters={filtersBarConfig}
            onChange={setActiveFilters}
          />
        </div>
        {!isLoading && !data?.items?.length ? (
          <div>
            <NoDataPage
              heading="You haven't any landing pages"
              subHeading="Looks like you haven't added any landing pages yet — there's nothing here"
            />
          </div>
        ) : (
          <div data-tour="landing-pages-table">
            {/* filters */}

            <GenericTable
              columns={columns}
              data={data?.items || []}
              isLoading={isLoading}
              pageIndex={page}
              pageSize={size}
              totalItems={data?.total}
              onPageChange={setPage}
              onPageSizeChange={(pageSize) => {
                setSize(pageSize);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
