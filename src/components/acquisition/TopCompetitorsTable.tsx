import { ICompetitorsTableRow, usegetCompetitorsTable, useTopCompetitorsInsights } from '@/services/googleAds.api';
import { ColumnDef } from '@tanstack/react-table';
import React from 'react'
import { Button } from '../ui/button';
import { FaSort } from 'react-icons/fa';
import DataTable from '../DataTable';
import DynamicTabs from '../charts/DynamicTabs';

interface TopCompetitorsTableProps {
  configId: string;
  date_range: string
}
export interface IAccountTable {
  domain: string;
  impressions: string;
  overlap_rate: string;
  position_above_rate: string;
  top_of_page_rate: string;
  abs_top_of_page_rate: string;
  outranking_share: string;
}

export interface ICampaignTable {
  domain: string;
  impressions: string;
  overlap_rate: string;
  position_above_rate: string;
  top_of_page_rate: string;
  abs_top_of_page_rate: string;
  outranking_share: string;
}

export interface IKeywordTable {
  keyword: string;
  match_type: string;
  status: string;
  max_cpc: string;
  final_url: string;
  clicks: number;
  impressions: number;
}

const accountTable: IAccountTable[] = [
  { "domain": "you", "impressions": "49.68%", "overlap_rate": "—", "position_above_rate": "—", "top_of_page_rate": "19.84%", "abs_top_of_page_rate": "19.03%", "outranking_share": "—" },
  { "domain": "www.coursera.org", "impressions": "71.66%", "overlap_rate": "51.06%", "position_above_rate": "77.46%", "top_of_page_rate": "7.56%", "abs_top_of_page_rate": "42.23%", "outranking_share": "24.04%" },
  { "domain": "www.bbc.co.uk/news", "impressions": "17.78%", "overlap_rate": "68.68%", "position_above_rate": "19.98%", "top_of_page_rate": "68.85%", "abs_top_of_page_rate": "72.27%", "outranking_share": "—" },
  { "domain": "www.cnn.com", "impressions": "20.56%", "overlap_rate": "91.91%", "position_above_rate": "32.85%", "top_of_page_rate": "59.84%", "abs_top_of_page_rate": "83.87%", "outranking_share": "—" },
  { "domain": "www.blogger.com", "impressions": "12.76%", "overlap_rate": "73.00%", "position_above_rate": "53.36%", "top_of_page_rate": "56.76%", "abs_top_of_page_rate": "49.64%", "outranking_share": "75.84%" },
  { "domain": "www.kidscorp.org", "impressions": "47.42%", "overlap_rate": "32.33%", "position_above_rate": "16.10%", "top_of_page_rate": "38.24%", "abs_top_of_page_rate": "31.58%", "outranking_share": "32.93%" },
  { "domain": "www.nytimes.com", "impressions": "81.08%", "overlap_rate": "90.07%", "position_above_rate": "83.96%", "top_of_page_rate": "32.33%", "abs_top_of_page_rate": "30.86%", "outranking_share": "17.22%" },
  { "domain": "www.wordpress.com", "impressions": "91.62%", "overlap_rate": "91.03%", "position_above_rate": "49.68%", "top_of_page_rate": "69.84%", "abs_top_of_page_rate": "72.26%", "outranking_share": "19.44%" },
  { "domain": "www.medium.com", "impressions": "19.02%", "overlap_rate": "66.62%", "position_above_rate": "41.59%", "top_of_page_rate": "81.63%", "abs_top_of_page_rate": "58.62%", "outranking_share": "76.56%" },
  { "domain": "www.wired.com", "impressions": "51.24%", "overlap_rate": "45.60%", "position_above_rate": "49.95%", "top_of_page_rate": "57.35%", "abs_top_of_page_rate": "59.00%", "outranking_share": "22.46%" }
];

const campaignTable: ICampaignTable[] = [
  { domain: "you", impressions: "55.12%", overlap_rate: "—", position_above_rate: "—", top_of_page_rate: "23.45%", abs_top_of_page_rate: "21.78%", outranking_share: "—" },
  { domain: "www.udemy.com", impressions: "68.44%", overlap_rate: "49.23%", position_above_rate: "72.81%", top_of_page_rate: "10.45%", abs_top_of_page_rate: "38.96%", outranking_share: "20.54%" },
  { domain: "www.linkedin.com", impressions: "22.15%", overlap_rate: "74.12%", position_above_rate: "25.90%", top_of_page_rate: "63.12%", abs_top_of_page_rate: "69.21%", outranking_share: "15.63%" },
  { domain: "www.reddit.com", impressions: "19.84%", overlap_rate: "88.33%", position_above_rate: "29.45%", top_of_page_rate: "58.72%", abs_top_of_page_rate: "79.01%", outranking_share: "17.29%" },
  { domain: "www.quora.com", impressions: "14.93%", overlap_rate: "70.18%", position_above_rate: "47.33%", top_of_page_rate: "54.98%", abs_top_of_page_rate: "46.12%", outranking_share: "62.74%" },
  { domain: "www.edx.org", impressions: "52.41%", overlap_rate: "35.27%", position_above_rate: "19.42%", top_of_page_rate: "42.87%", abs_top_of_page_rate: "34.65%", outranking_share: "29.80%" },
  { domain: "www.wsj.com", impressions: "77.64%", overlap_rate: "84.59%", position_above_rate: "79.12%", top_of_page_rate: "35.41%", abs_top_of_page_rate: "33.17%", outranking_share: "21.49%" },
  { domain: "www.medium.com", impressions: "88.22%", overlap_rate: "86.02%", position_above_rate: "52.13%", top_of_page_rate: "72.01%", abs_top_of_page_rate: "70.33%", outranking_share: "18.22%" },
  { domain: "www.github.com", impressions: "26.38%", overlap_rate: "61.84%", position_above_rate: "39.55%", top_of_page_rate: "77.12%", abs_top_of_page_rate: "61.44%", outranking_share: "69.02%" },
  { domain: "www.stackoverflow.com", impressions: "49.75%", overlap_rate: "42.91%", position_above_rate: "53.21%", top_of_page_rate: "62.34%", abs_top_of_page_rate: "55.91%", outranking_share: "24.87%" }
];

const keywordTable: IKeywordTable[] = [
  { "keyword": "car accident attorney", "match_type": "exact match", "status": "eligible", "max_cpc": "$300.00", "final_url": "", "clicks": 32, "impressions": 675 },
  { "keyword": "motorcycle lawyers", "match_type": "exact match", "status": "eligible", "max_cpc": "$450.00", "final_url": "", "clicks": 45, "impressions": 675 },
  { "keyword": "car accident attorney n...", "match_type": "exact match", "status": "eligible", "max_cpc": "$190.44", "final_url": "", "clicks": 31, "impressions": 675 },
  { "keyword": "vehicle accident attorney", "match_type": "exact match", "status": "eligible", "max_cpc": "$1010.12", "final_url": "", "clicks": 37, "impressions": 675 },
  { "keyword": "car wreck attorney", "match_type": "exact match", "status": "eligible", "max_cpc": "$345.00", "final_url": "", "clicks": 46, "impressions": 675 },
  { "keyword": "auto crash attorney", "match_type": "exact match", "status": "eligible", "max_cpc": "$0", "final_url": "", "clicks": 45, "impressions": 675 },
  { "keyword": "car accident attorney", "match_type": "exact match", "status": "eligible", "max_cpc": "$300.00", "final_url": "", "clicks": 12, "impressions": 675 },
  { "keyword": "motorcycle attorney", "match_type": "exact match", "status": "eligible", "max_cpc": "$450.00", "final_url": "", "clicks": 45, "impressions": 675 },
  { "keyword": "car wreck attorney", "match_type": "exact match", "status": "eligible", "max_cpc": "$345.00", "final_url": "", "clicks": 46, "impressions": 675 },
  { "keyword": "car accident attorney", "match_type": "exact match", "status": "eligible", "max_cpc": "$300.00", "final_url": "", "clicks": 32, "impressions": 675 }
];

export function TopCompetitorsTable({ configId, date_range }: TopCompetitorsTableProps) {
  // const { data: topCompetitors, isLoading } = useTopCompetitorsInsights(configId);
  const [activeTab, setActiveTab] = React.useState('account');
  const { data: topCompetitorsTable, isLoading } = usegetCompetitorsTable(configId, date_range);
  const accountData = topCompetitorsTable?.results?.[0]?.insights?.rows || [];
  const accountColumns: ColumnDef<ICompetitorsTableRow>[] = [
    {
      accessorKey: "domain",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full text-inherit"
        >
          Domain
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const keyword = row.getValue("domain") as string;
        return <span className="font-medium">{keyword}</span>;
      },
    },
    {
      accessorKey: "impression_share",
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
        const value = row.getValue("impression_share") as number;
        return <span>{value?.toLocaleString() || "0"}%</span>;
      },
    },
    {
      accessorKey: "overlap_rate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Overlap rate
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("overlap_rate") as number;
        return <span>{value?.toLocaleString() || "0"}%</span>;
      },
    },
    {
      accessorKey: "position_above_rate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Position above rate
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("position_above_rate") as number;
        return <span>{value?.toLocaleString() || "0"}%</span>;
      },
    },
    {
      accessorKey: "top_of_page_rate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Top of page rate
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("top_of_page_rate") as number;
        return <span>{value?.toLocaleString() || "0"}%</span>;
      },
    },
    {
      accessorKey: "abs_top_of_page_rate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Abs. top of page rate
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("abs_top_of_page_rate") as number;
        return <span>{value || "0.00"}%</span>;
      },
    },
    {
      accessorKey: "outranking_share",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Outranking share
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("outranking_share") as number;
        return <span>{value || "0.0"}%</span>;
      },
    },
  ];

  const campaignColumns: ColumnDef<ICampaignTable>[] = [
    {
      accessorKey: "domain",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full text-inherit"
        >
          Domain
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const keyword = row.getValue("domain") as string;
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
      accessorKey: "overlap_rate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Overlap rate
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("overlap_rate") as number;
        return <span>{value?.toLocaleString() || "0"}</span>;
      },
    },
    {
      accessorKey: "position_above_rate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Position above rate
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("position_above_rate") as number;
        return <span>{value?.toLocaleString() || "0"}</span>;
      },
    },
    {
      accessorKey: "top_of_page_rate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Top of page rate
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("top_of_page_rate") as number;
        return <span>{value?.toLocaleString() || "0"}</span>;
      },
    },
    {
      accessorKey: "abs_top_of_page_rate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Abs. top of page rate
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("abs_top_of_page_rate") as number;
        return <span>${value || "0.00"}</span>;
      },
    },
    {
      accessorKey: "outranking_share",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Outranking share
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("outranking_share") as number;
        return <span>{value || "0.0"}</span>;
      },
    },
  ];

  const keywordColumns: ColumnDef<IKeywordTable>[] = [
    {
      accessorKey: "keyword",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Keyword
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("keyword") as string;
        return <span>{value || "N/A"}</span>;
      },
    },
    {
      accessorKey: "match_type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Match type
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("match_type") as number;
        return <span>{value?.toLocaleString() || "0"}</span>;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          <span>Status</span>
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("status") as number;
        return <span>{value || "0.00"}</span>;
      },

    },
    {
      accessorKey: "max_cpc",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          <span>Max Cpc</span>
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("max_cpc") as number;
        return <span>{value || "0.00"}</span>;
      },

    },
    {
      accessorKey: "final_url",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          <span>Final URL</span>
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("final_url") as string;
        return <span>{value || "N/A"}</span>;
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
          <span>Clicks</span>
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("clicks") as number;
        return <span>{value || "0.00"}</span>;
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
          <span>Impressions</span>
          <FaSort className="h-2 w-2 text-[#B5BAC4]" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("impressions") as number;
        return <span>{value || "0.00"}</span>;
      },

    },
  ];
  return (
    <div>
      <div className="bg-white rounded-lg p-4">
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4">
          <p className="text-xl text-neutral-300 ">TOP Competitors</p>
          <div className="flex bg-gray-100 rounded-full mt-3 md:mt-0 w-fit border border-neutral-50 justify-center mx-auto md:mx-0 md:ml-auto">
            <DynamicTabs
              tabs={[
                { key: 'account', label: 'Account', icon: '/Account.svg' },
                { key: 'campaign', label: 'Campaign', icon: '/Campaign.svg' },
                { key: 'keyword', label: 'Keyword', icon: '/Key.svg' }
              ]}
              metric={activeTab}
              onTabChange={setActiveTab}
              disbaled
            />
          </div>
        </div>
        {!configId ? (
          <div className="text-amber-600 mb-4">
            Please select a configuration ID to view top competitors data.
          </div>
        ) : accountData?.length === 0 && !isLoading ? (
          <div className="text-gray-500 mb-4">No top competitors data available for this customer.</div>
        ) : null}
        <DataTable
          columns={activeTab === 'account' ? accountColumns : activeTab === 'campaign' ? campaignColumns : keywordColumns}
          // data={activeTab === 'account' ? accountTable : activeTab === 'campaign' ? campaignTable : keywordTable}
          data={accountData}
          isDataLoading={isLoading}
        />
      </div>
    </div>
  )
}

