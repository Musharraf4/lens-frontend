import React from "react";
import { Button } from "@/components/ui/button";
import { LuChevronsUpDown } from "react-icons/lu";
import Image from "next/image";
import { IoSyncOutline } from "react-icons/io5";
import { usePhoneNumberById } from "@/services/phoneNumbers.api";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { GenericTable } from "../ui/GenericTable";
import { formatPhoneNumberUniversal, formatRelativeTime, formatString, getSourceIcon } from "@/lib/utils";

const columns = [
  {
    accessorKey: "phone_number",
    header: ({ column }: any) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center justify-between w-full text-inherit"
      >
        Number
        <LuChevronsUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }: any) => <span className="font-medium">{formatPhoneNumberUniversal(row.getValue("phone_number"))}</span>,
  },
  {
    accessorKey: "last_active",
    header: ({ column }: any) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center justify-between w-full"
      >
        Last Active
        <LuChevronsUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }: any) => <span>{formatRelativeTime(row.getValue("last_active"))}</span>,
  },
  {
    accessorKey: "source",
    header: ({ column }: any) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center justify-between w-full"
      >
        Source
        <LuChevronsUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }: any) => {
      const source = row.getValue("source");
      return (
        <div className="flex items-center capitalize">
          {typeof getSourceIcon(source) === "string" ? (
            <Image
              src={getSourceIcon(source) as string}
              alt={source}
              width={12}
              height={12}
              className="mr-2"
            />
          ) : (
            getSourceIcon(source)
          )}
          <span>{formatString(source)}</span>
        </div>
      );
    },
  },
  // {
  //   accessorKey: "keyword",
  //   header: ({ column }: any) => (
  //     <Button
  //       variant="ghost"
  //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //       className="flex items-center justify-between w-full"
  //     >
  //       Keyword
  //       <LuChevronsUpDown className="h-4 w-4" />
  //     </Button>
  //   ),
  //   cell: ({ row }: any) => <span>{row.getValue("keyword")}</span>,
  // },
  // {
  //   accessorKey: "browser",
  //   header: ({ column }: any) => (
  //     <Button
  //       variant="ghost"
  //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //       className="flex items-center justify-between w-full"
  //     >
  //       Browser
  //       <LuChevronsUpDown className="h-4 w-4" />
  //     </Button>
  //   ),
  //   cell: ({ row }: any) => <span>{row.getValue("browser")}</span>,
  // },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }: any) => (
      <div className="text-right mr-3">
        <Button
          variant="outline"
          size="icon"
          className="bg-transparent rounded-full my-1 h-fit w-fit cursor-pointer hover:bg-neutral-50"
        >
          <IoSyncOutline
            size={16}
            className="m-1"
          />
        </Button>
      </div>
    ),
  },
];

export default function NumberPoolTable({ numberPoolTableId }: { numberPoolTableId: string }) {
  const { selectedCompany } = useSelectedCompanyStore();
  const { data, isLoading } = usePhoneNumberById({
    phoneNumberId: numberPoolTableId,
    company_id: selectedCompany?.company?.id,
  });

  const transformedData = data?.tracking_numbers.map((tn) => ({
    phone_number: tn.phone_number,
    last_active: data.updated_at,
    source: data.source,
  }));

  return (
    <GenericTable
      columns={columns}
      data={transformedData || []}
      isLoading={isLoading}
      totalItems={transformedData?.length}
      hidePagination
      hidePageSizeDropdown
    />
  );
}
