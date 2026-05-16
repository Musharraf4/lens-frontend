"use client";

import { ClientPlanAndPayment } from "@/components/accounts/edit/planAndPayment.tsx";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { ColumnDef, OnChangeFn, RowSelectionState } from "@tanstack/react-table";
import { Check } from "lucide-react";
import React, { useState } from "react";
import { BiExport } from "react-icons/bi";
import { LuChevronsUpDown } from "react-icons/lu";
import { ExportAllModal } from "./ExportAllModal";
import { Chip } from "@/components/ui/Chip";
import { StripeInvoice, SubscriptionData, PlanDetail } from "@/types";
import { useGetCompnayInvoice } from "@/services/user.api";
import dayjs from "dayjs";
import { getPlanStatus } from "@/lib/utils";
import { CURRENCY_SYMBOL } from "@/constants";

export const PlanAndPayment = ({ companyId, paymentDetails }: { companyId: string, paymentDetails?: SubscriptionData }) => {
  const { data: invoiceData, isLoading: invoiceLoading } = useGetCompnayInvoice(companyId);
  const [openExportAllModal, setOpenExportAllModal] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [individualInvoice, setIndividualInvoice] = useState<StripeInvoice | null>(null);

  // Derive selected invoices from rowSelection
  const getSelectedInvoices = (): StripeInvoice[] => {
    if (!Array.isArray(invoiceData)) return [];
    const selectedIndices = Object.keys(rowSelection).filter((key) => (rowSelection as any)[key]);
    return selectedIndices.map((index) => (invoiceData as StripeInvoice[])[parseInt(index)]);
  };

  const selectedInvoices = getSelectedInvoices();
  const hasSelection = selectedInvoices.length > 0;

  // Final list to export (individual > selected > all)
  const invoicesForExport = individualInvoice
    ? [individualInvoice]
    : (hasSelection ? selectedInvoices : (Array.isArray(invoiceData) ? invoiceData : []));

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    if (typeof updaterOrValue === "function") {
      setRowSelection((prev) => updaterOrValue(prev));
    } else {
      setRowSelection(updaterOrValue);
    }
  };

  const handleExportAll = () => {
    setOpenExportAllModal(true);
  };

  const handleExportSelected = (invoice: StripeInvoice) => {
    setIndividualInvoice(invoice);
    setOpenExportAllModal(true);
  };
  const SortHeader: React.FC<{ column: any; title: string }> = ({ column, title }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="flex w-full items-center justify-between text-inherit px-1 sm:px-2"
    >
      <span className="text-xs sm:text-sm truncate">{title}</span>
      <LuChevronsUpDown />
    </Button>
  );

  const columns: ColumnDef<StripeInvoice>[] = [
    {
      accessorKey: "number",
      header: ({ column }) => (
        <SortHeader
          column={column}
          title="Invoice Number"
        />
      ),
      cell: ({ row }) => {
        return <span className="text-sm text-black">{row.getValue("number")}</span>;
      },
    },
    {
      accessorKey: "plan",
      header: ({ column }) => (
        <SortHeader
          column={column}
          title="Plan"
        />
      ),
      cell: ({ row }) => {
        const plan = row.getValue("plan") as PlanDetail;
        return <span className="text-sm capitalize text-black">{plan.product_name?.replace(/_/g, " ")}</span>;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <SortHeader
          column={column}
          title="Status"
        />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status")
        return (
          <Chip
            label={getPlanStatus(status as string)}
            variant="success"
            icon={<Check className="text-white bg-green-400 rounded-full size-3" />}
          />
        )
      },
    },
    {
      accessorKey: "created",
      header: ({ column }) => (
        <SortHeader
          column={column}
          title="Payment Date"
        />
      ),
      cell: ({ row }) => {
        const date = row.getValue("created")
        return (
          <span className="text-sm text-black">{dayjs(String(date)).format('DD.MM.YYYY')}</span>
        )
      },
    },
    {
      accessorKey: "amount_paid",
      header: ({ column }) => (
        <SortHeader
          column={column}
          title="Total"
        />
      ),
      cell: ({ row }) => {
        const amount = row.getValue("amount_paid");
        return (
          <span className="text-sm text-black">
            {CURRENCY_SYMBOL}{Number(amount) / 100}
          </span>
        );
      },
    },
    {
      accessorKey: "action",
      header: ({ column }) => (
        <SortHeader
          column={column}
          title=""
        />
      ),
      cell: ({ row }) => {
        const invoice = row.original as StripeInvoice;
        return (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportSelected(invoice)}
            >
              <BiExport />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-white p-3 sm:p-6 rounded-3xl space-y-4">
      <div className="flex justify-between mb-8">
        <p className="text-neutral-500">Plan & Payment</p>
        <Button
          variant="outline"
          className="rounded-full text-black"
          onClick={handleExportAll}
          disabled={invoiceLoading || !Array.isArray(invoiceData) || invoiceData.length === 0}
        >
          <BiExport className="h-2 w-2" />
          {hasSelection ? `Export Selected (${selectedInvoices.length})` : "Export All"}
        </Button>
      </div>

      <ClientPlanAndPayment companyId={companyId} paymentDetails={paymentDetails} />

      <DataTable
        hidePageSizeDropdown
        columns={columns}
        data={Array.isArray(invoiceData) ? invoiceData : []}
        isDataLoading={invoiceLoading}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
      />
      <ExportAllModal
        open={openExportAllModal}
        onOpenChange={(open) => {
          setOpenExportAllModal(open);
          if (!open) {
            setIndividualInvoice(null);
          }
        }}
        invoice={invoiceData}
        selectedInvoices={invoicesForExport}
      />
    </div>
  );
};
