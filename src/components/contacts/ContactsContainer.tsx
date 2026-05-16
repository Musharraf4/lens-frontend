"use client";

import { FilterDefinition, FiltersBar } from "@/components/FiltersBar";
import PageHeader from "@/components/PageHeader";
import { Tabs } from "@/components/Tabs";
import { Input } from "@/components/ui/input";
import { fmt, formatChannel, formatPhoneNumberUniversal, getBaseUrl, getSourceIcon } from "@/lib/utils";
import {
  IContact,
  IGetContactsParams,
  useGetContactCountsQuery,
  useGetContactsQuery,
  useGetJobTypeOptionQuery,
  useGetLandingPagesOptionQuery,
} from "@/services/contacts.api";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { ActiveFilter } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import debounce from "debounce";
import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaSort } from "react-icons/fa";
import { MdCall, MdOutlineChat, MdOutlineMessage } from "react-icons/md";
import { NoDataPage } from "../common/NoDataPage";
import { DateSelector } from "../home/DateSelector";
import { Button } from "../ui/button";
import { GenericTable } from "../ui/GenericTable";
import { useRouter, useSearchParams } from "next/navigation";
import { CURRENCY_SYMBOL } from "@/constants";
import Image from "next/image";

// Define the ActiveFilter type to match FiltersBar component

export function ContactsContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const channel = searchParams.get("channel");
  const defaultActiveTab = searchParams.get("activeTab");
  const [activeTab, setActiveTab] = useState(defaultActiveTab ? defaultActiveTab : "all");
  const initialChannelFilter: ActiveFilter[] = channel
    ? [{ name: "Channel", value: [channel] }]
    : [];
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(initialChannelFilter);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const { selectedCompany } = useSelectedCompanyStore();
  const [dateRange, setDateRange] = useState("All Time");
  const [searchValue, setSearchValue] = useState("");
  const { data: contactsCount } = useGetContactCountsQuery({
    company_id: selectedCompany?.company?.id,
    date_range: fmt(dateRange)
  });
  useGetJobTypeOptionQuery
  const { data, isSuccess } = useGetLandingPagesOptionQuery({
    company_id: selectedCompany?.company?.id,
  });
  const { data: jobTypes } = useGetJobTypeOptionQuery({
    company_id: selectedCompany?.company?.id ?? '',
    type: 'contacts'
  });
  // Convert active filters to API parameters
  const contactParams = useMemo(() => {
    const p: IGetContactsParams = {
      date_range: fmt(dateRange),
    };

    if (searchValue) p.search_text = searchValue;

    if (activeTab === "deals") {
      p.contact_type = "DEAL";
    } else if (activeTab === "leads") {
      p.contact_type = "LEAD";
    }

    activeFilters.forEach(({ name, value }) => {
      if (!value) return;

      switch (name) {
        case "Interaction":
          if (Array.isArray(value) && value.length > 0) {
            p.interaction_type = value as string[];
          }
          break;

        case "Channel":
          if (Array.isArray(value) && value.length > 0) {
            p.channel = value as string[];
          }
          break;

        case "Revenue":
          if (
            value &&
            typeof value === "object" &&
            "revenue_min" in value &&
            "revenue_max" in value
          ) {
            const { revenue_min, revenue_max } = value as {
              revenue_min: number | null;
              revenue_max: number | null;
            };
            if (revenue_min !== null) p.revenue_min = revenue_min;
            if (revenue_max !== null) p.revenue_max = revenue_max;
          }
          break;
        case "Duration":
          if (
            value &&
            typeof value === "object" &&
            "duration_min" in value &&
            "duration_max" in value
          ) {
            const { duration_min, duration_max } = value as {
              duration_min: number | null;
              duration_max: number | null;
            };
            if (duration_min !== null) p.duration_min = duration_min;
            if (duration_max !== null) p.duration_max = duration_max;
          }
          break;

        case "Job Type":
          if (Array.isArray(value) && value.length > 0) {
            p.job_type = value as string[];
          }
          break;

        case "First Date":
          if (value) p.first_date_from = `${value}`;
          break;

        case "Landing Page":
          if (Array.isArray(value) && value.length > 0) {
            p.landing_page = value as string[];
          }
          break;

        case "Keyword":
          // if (Array.isArray(value) && value.length > 0) {
          p.keyword = value as string;
          // }
          break;

        case "Duration":
          if (Array.isArray(value) && value.length > 0) {
            p.duration = value as string[];
          }
          break;

        default:
          break;
      }
    });

    return p;
  }, [activeFilters, activeTab, dateRange, searchValue]);

  const { data: contacts, isLoading: loadingContacts } = useGetContactsQuery({
    company_id: selectedCompany?.company?.id,
    ...contactParams,
    page,
    size,
  });

  const tabOptions = [
    {
      label: "All contacts",
      value: "all",
      count: contactsCount?.contact_count,
      isDisabled: loadingContacts,
    },
    {
      label: "Leads",
      value: "leads",
      count: contactsCount?.leads_count,
      isDisabled: loadingContacts,
    },
    {
      label: "Cases",
      value: "deals",
      count: contactsCount?.deals_count,
      isDisabled: loadingContacts,
    },
  ];

  // Define filters for FiltersBar
  const filtersBarConfig: FilterDefinition[] = [
    {
      name: "Interaction",
      type: "select",
      multi: true,
      options: [
        { name: "Call", value: "CALL" },
        { name: "Chat", value: "CHAT" },
        { name: "Form", value: "FORM" },
      ],
    },
    {
      name: "Channel",
      type: "select",
      multi: true,
      options: [
        { name: "Google Ads", value: "google ads" },
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
      name: "Revenue",
      type: "range",
    },
    {
      name: "Job Type",
      type: "select",
      multi: true,
      options: jobTypes?.job_types?.map((option: string) => ({ name: option, value: option })) || [],
    },
    {
      name: "First Date",
      type: "date",
    },
    {
      name: "Landing Page",
      type: "select",
      multi: true,
      options: data?.data?.map((option: string) => ({ name: option, value: option })),
    },
    // {
    //   name: "Keyword",
    //   type: "input",
    //   // multi: true,
    //   // options: [
    //   //   { name: "Keyword 1", value: "keyword_1" },
    //   //   { name: "Keyword 2", value: "keyword_2" },
    //   //   { name: "Keyword 3", value: "keyword_3" },
    //   //   { name: "Keyword 4", value: "keyword_4" },
    //   // ],
    // },
    {
      name: "Duration",
      type: "range",
    },
  ];

  const tableData = contacts?.items && contacts.items.length > 0 ? contacts.items : [];

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
        const id = row.original.id;
        return (
          <div className="flex flex-col w-50">
            <span
              className="font-medium cursor-pointer hover:underline"
              onClick={() => router.push(`/contacts/${id}`)}
            >
              {name || "No name"}
            </span>
            <span className="text-sm text-gray-500 truncate">{email}</span>
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
      accessorKey: "first_interaction_date",
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
        const date = row.getValue("first_interaction_date") as string;
        return <span>{dayjs(date).format("DD-MM-YYYY")}</span>;
      },
    },
    {
      accessorKey: "first_interaction_type",
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
        const interaction = row.getValue("first_interaction_type") as string;

        // Return different icons based on interaction type
        if (interaction?.toUpperCase() === "FORM") {
          return (
            <div className="flex items-center">
              <MdOutlineMessage className="mr-2 h-4 w-4 text-gray-500" />
              <span>Form</span>
            </div>
          );
        } else if (interaction?.toUpperCase() === "CALL") {
          return (
            <div className="flex items-center">
              <MdCall className="mr-2 h-4 w-4 text-gray-500" />
              <span>Call</span>
            </div>
          );
        } else if (interaction?.toUpperCase() === "CHAT") {
          return (
            <div className="flex items-center">
              <MdOutlineChat className="mr-2 h-4 w-4 text-gray-500" />
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
        return <div className="flex items-center">
          <Image
            src={getSourceIcon(channel) as string}
            alt={channel}
            width={12}
            height={12}
            className="mr-2"
          />
          <span className={`${channel.includes("http") ? "" : "capitalize"}`}>{formatChannel(channel)}</span>
        </div>
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
        const id = row.original.id;
        const typeToShow = type === "LEAD" ? "Lead" : "Case";
        return (
          <div
            //  onClick={() => {
            //   router.push(`/contacts/${id}?showRevenewModal=true`);
            // }} 
            className="flex items-center " >
            <img
              src={type === "LEAD" ? "/Hand-heart.svg" : "/DealIcon.svg"}
              className="mr-2 h-4 w-4"
              alt={type}
            />
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
          URL
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const landing_page = getBaseUrl(row.getValue("landing_page")) as string;
        return (
          <a
            href={landing_page}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:underline truncate max-w-[180px] block"
          >
            {landing_page}
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

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setPage(1)
        setSearchValue(value);
      }, 500),
    []
  );

  useEffect(() => {
    const isFilterUpdated = activeFilters.some(
      (filter) => Array.isArray(filter.value) && filter.value.length === 0 || filter.value === ""
    );
    if (isFilterUpdated) {
      setPage(1);
    }
  }, [activeFilters]);

  return (
    <main>
      <div className="my-4" data-tour="contacts-page-header">
        <PageHeader
          title="Contacts"
          breadcrumbs={[{ label: "CRM", href: "/home" }, { label: "Contacts" }]}
        />
      </div>
      <div className="my-4 flex flex-wrap justify-between gap-4">
        <div data-tour="contacts-tabs">
          <Tabs
            tabs={tabOptions}
            activeTab={activeTab}
            onTabChange={((value: string) => {
              setPage(1)
              setActiveTab(value)
              // Update URL with activeTab parameter
              const params = new URLSearchParams(searchParams.toString())
              params.set('activeTab', value)
              router.push(`/contacts?${params.toString()}`)
            })}
          />
        </div>
        <div className="flex gap-3 justify-end ml-auto flex-wrap" data-tour="contacts-search-date">
          <div>
            <Input
              placeholder="Search..."
              icon={<FaSearch />}
              disabled={loadingContacts}
              iconPosition="right"
              className="w-full md:w-[200px]"
              inputSize="small"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
          <DateSelector
            selected={dateRange}
            onChange={(value) => {
              setDateRange(value)
            }}
            additional
          />
        </div>
      </div>

      <div className="my-4" >
        <FiltersBar
          disabled={loadingContacts}
          filters={filtersBarConfig}
          onChange={(value) => setActiveFilters(value)}
          initialActiveFilters={initialChannelFilter}
        />
      </div>
      {!loadingContacts && !tableData?.length ? (
        <NoDataPage
          heading="You haven't any contacts"
          subHeading="Once you start receiving calls, forms, chats the contacts will populate."
        />
      ) : (
        <div data-tour="contacts-table">
          <GenericTable
            columns={columns}
            data={tableData}
            isLoading={loadingContacts}
            pageIndex={page}
            pageSize={size}
            totalItems={contacts?.total}
            onPageChange={setPage}
            onPageSizeChange={(pageSize) => {
              setSize(pageSize);
              setPage(1);
            }}
          />
        </div>
      )}
    </main>
  );
}
