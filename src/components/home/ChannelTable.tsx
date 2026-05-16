"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { FaSort } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { HiOutlineExternalLink } from "react-icons/hi";
import { TbArrowBounce } from "react-icons/tb";
import { RiUserSearchLine } from "react-icons/ri";
import { formatCompactNumber, getSourceIcon } from "@/lib/utils";
import { CURRENCY_SYMBOL } from "@/constants";
import Image from "next/image";
export interface IChannelStat {
  channel: string;
  traffic: number;
  leads: number;
  sales: number;
  revenue: number;
  spend: number;
  roas: number;
}

interface ChannelTableProps {
  data?: IChannelStat[];
  channelsLoading: boolean;
}

const channelMeta: Record<
  IChannelStat["channel"],
  { label: string; icon: React.ReactElement | string }
> = {
  organic: {
    label: "Organic",
    icon: '/Search.svg',
  },
  direct: {
    label: "Direct",
    icon: '/Direct.svg',
  },
  retargeting: {
    label: "Retargeting",
    icon: "/Refresh.svg",
  },
  referral: {
    label: "Referral",
    icon: "/Link.svg",
  },
  google_ads: {
    label: "Google Ads",
    icon: "/GoogleAdsIcon.svg",
  },
  bing_ads: {
    label: "Bing Ads",
    icon: "/BingAdsIcon.svg",
  },
  facebook_ads: {
    label: "Facebook Ads",
    icon: "/FacebookIcon.svg",
  },
  instagram_ads: {
    label: "Instagram Ads",
    icon: "/InstagramIcon.svg",
  },
  email: {
    label: "Email",
    icon: <AiOutlineSearch className="mr-2 h-4 w-4 text-green-500" />,
  },

  local_service_ads: {
    label: "Local Service Ads",
    icon: <RiUserSearchLine className="mr-2 h-4 w-4 text-purple-500" />,
  },
  googleads: {
    label: "Google Ads",
    icon: "/GoogleAdsIcon.svg",
  },
  googleBusinessAds: {
    label: "My Business",
    icon: "/GoogleBusinessIcon.svg",
  },
  my_business: {
    label: "My Business",
    icon: "/GoogleBusinessIcon.svg",
  },
  facebook: {
    label: "Facebook",
    icon: "/FacebookIcon.svg",
  },
  instagram: {
    label: "Instagram",
    icon: "/InstagramIcon.svg",
  },
  youtube: {
    label: "Youtube",
    icon: "/YouTubeIcon.svg",
  },
  pinterest: {
    label: "Pinterest",
    icon: "/Pinterest.svg",
  },
};

const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const SortHeader: React.FC<{ column: any; title: string }> = ({
  column,
  title,
}) => (
  <Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    className="flex w-full items-center justify-between text-inherit px-1 sm:px-2"
  >
    <span className="text-xs sm:text-sm truncate">{title}</span>
    <FaSort className="h-2 w-2 text-[#B5BAC4]" />
  </Button>
);

export function ChannelTable({ data, channelsLoading }: ChannelTableProps) {
  const router = useRouter();

  const displayData = data && data.length > 0 ? data : [];

  const mkNumberCol = (
    key: keyof IChannelStat,
    title: string,
    digits = 0
  ): ColumnDef<IChannelStat> => ({
    accessorKey: key,
    header: ({ column }) => <SortHeader column={column} title={title} />,
    cell: ({ row }) =>
      (row.getValue(key) as number).toLocaleString("en-US", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }),
  });

  const columns: ColumnDef<IChannelStat>[] = [
    {
      accessorKey: "channel",
      header: ({ column }) => <SortHeader column={column} title="Channels" />,
      cell: ({ row }) => {
        const key = row.getValue("channel") as IChannelStat["channel"];
        const { label, icon } = channelMeta[key?.replace(/\s+/g, "_")?.toLowerCase()] ?? channelMeta["direct"];
        return (
          <div className="flex items-center">
            <Image
              src={getSourceIcon(label) as string}
              alt={label}
              width={12}
              height={12}
              className="mr-2"
            />
            <span className="capitalize">{label}</span>
          </div>
        );
      },
    },
    mkNumberCol("traffic", "Traffic"),
    {
      accessorKey: "leads",
      header: ({ column }) => <SortHeader column={column} title="Leads" />,
      cell: ({ row }) => {
        const leads = row.getValue("leads") as number;
        const channel = row.getValue("channel") as string;
        const href = `/contacts?channel=${channel}&activeTab=leads`;
        return (
          <a
            href={href}
            className="text-blue-600 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              router.push(href);
            }}
          >
            {leads.toLocaleString()}
          </a>
        );
      },
    },
    {
      accessorKey: "sales",
      header: ({ column }) => <SortHeader column={column} title="Cases" />,
      cell: ({ row }) => {
        const sales = row.getValue("sales") as number;
        const channel = row.getValue("channel") as string;
        const href = `/contacts?channel=${channel}&activeTab=deals`;
        return (
          <a
            href={href}
            className="text-blue-600 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              router.push(href);
            }}
          >
            {sales.toLocaleString()}
          </a>
        );
      },
    },
    {
      accessorKey: "revenue",
      header: ({ column }) => <SortHeader column={column} title="Revenue" />,
      cell: ({ row }) => (
        <span>
          {CURRENCY_SYMBOL}
          {(Math.round(row.getValue("revenue")) as unknown as string).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "spend",
      header: ({ column }) => <SortHeader column={column} title="Spend" />,
      cell: ({ row }) => (
        <span>
          {CURRENCY_SYMBOL}
          {(Math.round(row.getValue("spend")) as unknown as string).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "roas",
      header: ({ column }) => <SortHeader column={column} title="ROAS" />,
      cell: ({ row }) => (
        <span>{formatCompactNumber(Number(row.getValue("roas")))}</span>
      ),
    },
  ];
  return (
    <div className="rounded-3xl bg-white p-4">
      <p className="text-neutral-500 mb-5">Channels overview</p>
      <DataTable
        columns={columns}
        data={displayData}
        hidePageSizeDropdown
        hidePagination
        isDataLoading={channelsLoading}
      />
    </div>
  );
}
