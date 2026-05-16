import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ColumnDef, RowSelectionState, OnChangeFn } from "@tanstack/react-table";
import { Check, CircleDollarSign, Rocket } from "lucide-react";
import { FC, useState } from "react";
import { BiExport } from "react-icons/bi";
import { LuChevronsUpDown } from "react-icons/lu";
import DataTable from "../DataTable";
import { Button } from "../ui/button";
import { Chip } from "../ui/Chip";
import { PlanDetail, StripeInvoice, SubscriptionData } from "@/types";
import { CURRENCY_SYMBOL } from "@/constants";
import { getCardLogo, getPlanStatus } from "@/lib/utils";
import { useGetCompnayInvoice } from "@/services/user.api";
import dayjs from "dayjs";
import { ExportAllModal } from "@/app/(protected)/accounts/switch-to-accounts/[id]/ExportAllModal";

type ReviewBillingDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billing?: SubscriptionData;
  companyId: string
};

export const ReviewBillingDetailsModal: FC<ReviewBillingDetailsModalProps> = ({
  onOpenChange,
  open,
  billing,
  companyId
}) => {
  const [openExportAllModal, setOpenExportAllModal] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [individualInvoice, setIndividualInvoice] = useState<StripeInvoice | null>(null);
  const { data: invoiceData, isLoading: invoiceLoading } = useGetCompnayInvoice(companyId);
  const last4Digits = billing?.stripe?.default_payment_method?.last4;
  const brand = billing?.stripe?.default_payment_method?.brand;
  const planName = billing?.plan?.name;
  const billingStatus = getPlanStatus(billing?.status)
  const isPastDue = (billingStatus !== 'Active') && (billingStatus !== 'Trial') && (billingStatus !== 'Paused');

  // Get selected invoices based on row selection
  const getSelectedInvoices = (): StripeInvoice[] => {
    if (!invoiceData) return [];
    const selectedIndices = Object.keys(rowSelection).filter(key => rowSelection[key]);
    return selectedIndices.map(index => invoiceData[parseInt(index)]);
  };

  const selectedInvoices = getSelectedInvoices();
  const hasSelection = selectedInvoices.length > 0;

  // Determine which invoices to pass to the modal
  const invoicesForExport = individualInvoice ? [individualInvoice] : (hasSelection ? selectedInvoices : invoiceData);

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    if (typeof updaterOrValue === 'function') {
      setRowSelection(prev => updaterOrValue(prev));
    } else {
      setRowSelection(updaterOrValue);
    }
  };

  const handleExportAll = () => {
    setOpenExportAllModal(true);
  };

  const handleExportSelected = (invoice: StripeInvoice) => {
    // Set individual invoice for export
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
      accessorKey: "action",
      enableSorting: false,
      header: () => <></>,
      cell: ({ row }) => {
        const invoice = row.original as StripeInvoice;
        return (
          <div className="flex justify-end">
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
  const amountPerCycle = (billing?.plan?.amount_cents || 0) / 100;
  const finalAmount = billing?.plan?.interval === 'year' ? amountPerCycle / 12 : amountPerCycle;
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-6xl p-8 rounded-2xl text-left max-h-[90vh] overflow-y-auto">
        <div>
          <DialogTitle className="text-2xl text-black">Review Billing Details</DialogTitle>
        </div>

        <div className="border-t border-neutral-50 my-3" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className={`border border-neutral-50 bg-neutral-25 rounded-3xl p-4 space-y-3 ${isPastDue ? 'ring-2 ring-red-300' : ''}`}>
            {planName ? (
              <div className="flex gap-1">
                <img src={planName === 'Starter' ? '/Rocket.svg' : '/Growth.svg'} />
                <p className="text-black font-semibold">{planName} Plan</p>
              </div>
            ) : (
              <p>No Plan Selected</p>
            )}
            {billing?.plan?.interval ? (
              <div>
                <span className="text-black font-medium">Pay {billing?.plan?.interval}ly - {CURRENCY_SYMBOL}{finalAmount} / mo, {billing?.plan?.nickname || 'early offer'}</span>
              </div>
            ) : (
              <p>No Payment Details Found</p>
            )}
          </div>

          <div className="border border-neutral-50 bg-neutral-25 rounded-3xl p-4 space-y-3">
            <div className="flex justify-between gap-2">
              <div className="flex gap-1">
                <CircleDollarSign />
                <p className="text-black font-semibold">Billing Method</p>
              </div>
            </div>
            {last4Digits ? (
              <div className="flex items-center gap-2">
                <img
                  src={getCardLogo(brand || '')}
                  alt="Card Icon"
                  className="w-7 rounded bg-white p-0.5 flex-shrink-0"
                />
                <span className=" text-black truncate">•••• •••• •••• {last4Digits}</span>
              </div>

            ) : (
              <p>No Payment Method Attched</p>
            )}
          </div>
        </div>

        <DataTable
          hidePageSizeDropdown
          hidePagination
          enableRowSelection
          columns={columns}
          data={Array.isArray(invoiceData) ? invoiceData : []}
          isDataLoading={invoiceLoading}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-full"
            onClick={handleExportAll}
            disabled={!invoiceData || invoiceData.length === 0}
          >
            <BiExport className="h-2 w-2" />
            {hasSelection ? `Export Selected (${selectedInvoices.length})` : "Export All"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
