"use client";

import { Button } from "@/components/ui/button";
import { fmt, IGetContactsParams, InteractionType, useContacts } from "@/services/activity.api";
import { IContact, useGetJobTypeOptionQuery } from "@/services/contacts.api";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { ActiveFilter } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaSort } from "react-icons/fa";
import { MdCall, MdOutlineChat } from "react-icons/md";
import { FilterDefinition, FiltersBar } from "../FiltersBar";
import { GenericTable } from "../ui/GenericTable";
import InteractionRevenueModal from "./InteractionRevenueModal";
import { formatChannel, formatPhoneNumberUniversal, getBaseUrl, getSourceIcon } from "@/lib/utils";
import { CURRENCY_SYMBOL } from "@/constants";
import Image from "next/image";

interface ContactsTableProps {
  timeRange: string;
  activeTab: InteractionType;
}

interface ActiveModal {
  id: string | null;
  revenue: number | string | null;
  type: string | null;
  intractionType: string | null;
}
export function ContactsTable({ timeRange, activeTab }: ContactsTableProps) {
  const router = useRouter();
  const { selectedCompany } = useSelectedCompanyStore();

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [showRevenueModal, setShowRevenueModal] = useState<ActiveModal>({
    id: null,
    revenue: null,
    type: null,
    intractionType: null
  })
  const { data: jobTypes } = useGetJobTypeOptionQuery({
    company_id: selectedCompany?.company?.id ?? '',
    type: 'activity'
  });
  const filtersBarConfig: FilterDefinition[] = [
    {
      name: "First Date",
      type: "date",
    },
    {
      name: "Channel",
      type: "select",
      options: [
        { name: "Google Ads", value: "google_ads" },
        { name: "Organic", value: "organic" },
        { name: "Referral", value: "referral" },
        { name: "Direct", value: "direct" },
        { name: "LSA", value: "local service ads" },
        { name: "Youtube", value: "youtube" },
        { name: "Facebook", value: "facebook ads" },
        { name: "Instagram", value: "instagram" },
        { name: "Pinterest", value: "pinterest" },
        { name: "My Business", value: "my business" },
      ],
    },
    {
      name: "Type",
      type: "select",
      options: [
        { name: "Lead", value: "lead" },
        { name: "Case", value: "deal" },
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
      name: "Job Type",
      type: "select",
      multi: true,
      options: jobTypes?.job_types?.map((option: string) => ({ name: option, value: option })) || [],
    },
    {
      name: "Interaction",
      type: "select",
      options: [
        { name: "Form", value: "form" },
        { name: "Call", value: "call" },
        { name: "Chat", value: "chat" },
      ],
    },
  ];

  const contactParams = useMemo((): IGetContactsParams => {
    const p: IGetContactsParams = {
      date_range: fmt(timeRange),
    };

    if (activeTab !== "summary") p.interaction_type = activeTab;

    activeFilters.forEach(({ name, value }) => {
      if (!value) return;

      switch (name) {
        case "Channel":
          p.channel = `${value}`;
          break;
        case "First Date":
          p.first_interaction_date_from = `${value}`;
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

        case "Job Type":
          if (Array.isArray(value) && value.length > 0) {
            p.job_type = value?.join(',');
          }
          break;

        case "Type":
          p.contact_type = `${String(value).toUpperCase()}`;
          break;

        case "Interaction":
          p.interaction_type = String(value).toUpperCase() as InteractionType;
          break;

        default:
          break;
      }
    });

    return p;
  }, [activeFilters, activeTab, timeRange]);

  const {
    data,
    isLoading: contactsLoading,
  } = useContacts({ size, page, ...contactParams, companyId: selectedCompany?.company?.id });

  const columns: ColumnDef<IContact>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full text-inherit"
        >
          Name
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        const email = row.original.email;
        const id = row.original.contact_id;
        return (
          <div className="flex flex-col w-50">
            <span
              className="font-medium cursor-pointer hover:underline"
              onClick={() => router.push(`/contacts/${id}`)}
            >
              {name || 'No name'}
            </span>
            <span className="text-sm text-neutral-500 truncate">{email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Phone
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const phone = row.getValue("phone") as string;
        return <span>{formatPhoneNumberUniversal(phone)}</span>;
      },
    },
    {
      accessorKey: "interaction_date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          First date
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("interaction_date") as string;
        return <span>{dayjs(date).format("DD-MM-YYYY")}</span>;
      },
    },
    {
      accessorKey: "interaction_type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Interaction
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const interaction = row.getValue("interaction_type") as string;

        // Return different icons based on interaction type
        if (interaction.toUpperCase() === "FORM") {
          return (
            <div className="flex items-center">
              <img src='/Form.svg' className="mr-2 h-4 w-4 text-neutral-500" alt="Form" />
              <span>Form</span>
            </div>
          );
        } else if (interaction.toUpperCase() === "CALL") {
          return (
            <div className="flex items-center">
              <MdCall className="mr-2 h-4 w-4 text-neutral-500" />
              <span>Call</span>
            </div>
          );
        } else if (interaction.toUpperCase() === "CHAT") {
          return (
            <div className="flex items-center">
              <MdOutlineChat className="mr-2 h-4 w-4 text-neutral-500" />
              <span>Chat</span>
            </div>
          );
        }
        return <span>{interaction}</span>;
      },
    },
    {
      accessorKey: "channel",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Channel
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const channel = row.getValue("channel") as string;
        // Return different icons based on channel

        return <div className="flex items-center">
          <Image
            src={getSourceIcon(channel) as string}
            alt={channel}
            width={12}
            height={12}
            className="mr-2"
          />
          <span className={`${channel.includes("http") ? "" : "capitalize"}`}>{formatChannel(channel)}</span>
        </div>;
      },
    },
    {
      accessorKey: "contact_type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Type
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const type = row.getValue("contact_type") as string;
        const typeToShow = type === "LEAD" ? "Lead" : "Case";

        return (
          <div
            // onClick={() => {
            //   setShowRevenueModal({
            //     id: row.original.id,
            //     revenue: row.original.revenue,
            //     type: type,
            //     intractionType: row.original.interaction_type
            //   })
            // }} 
            className="flex items-center">
            <img src={type === "LEAD" ? "/Hand-heart.svg" : "/DealIcon.svg"} className="mr-2 h-4 w-4" alt={type} />
            <span className="capitalize">{typeToShow.toLowerCase()}</span>
          </div>
        );
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
      accessorKey: "landing_page",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Landing Page
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const url = getBaseUrl(row.getValue("landing_page")) as string;
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:underline truncate max-w-[180px] block"
          >
            {url}
          </a>
        );
      },
    },
    {
      accessorKey: "job_type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Job Type
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const jobType = row.getValue("job_type") as string;
        return <span>{jobType}</span>;
      },
    },
  ];

  const tableData = data?.items && data.items.length > 0 ? data.items : [];

  useEffect(() => {
    const isFilterUpdated = activeFilters.some(
      (filter) => Array.isArray(filter.value) && filter.value.length === 0 || filter.value === ""
    );
    if (isFilterUpdated) {
      setPage(1);
    }
  }, [activeFilters]);

  useEffect(() => {
    setPage(1);
  }, [activeTab])
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4" data-tour="activity-filters">
        <FiltersBar
          disabled={contactsLoading}
          filters={filtersBarConfig}
          onChange={setActiveFilters}
        />
      </div>
      <div data-tour="activity-table">
        <GenericTable
          columns={columns}
          data={tableData}
          isLoading={contactsLoading}
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

      {showRevenueModal.id && (
        <InteractionRevenueModal
          open={!!showRevenueModal.id}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setShowRevenueModal({
                id: null,
                revenue: null,
                type: null,
                intractionType: null
              });
            }
          }}
          interactionId={showRevenueModal.id || ''}
          currentRevenue={showRevenueModal.revenue}
          currentType={showRevenueModal.type}
          intractionType={showRevenueModal.intractionType}
        />

      )}
    </div>
  );
}
