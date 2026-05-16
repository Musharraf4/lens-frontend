import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FormSelect } from "@/components/ui/inputs/Select";
import { StripeInvoice } from "@/types";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BiExport } from "react-icons/bi";
import {
  downloadInvoicePDF,
  downloadInvoicesAsCSV,
  downloadMultipleInvoicePDFs
} from "@/utils/exportUtils";
import { showToast } from "@/components/Toast";

type ExportAllModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: StripeInvoice[];
  selectedInvoices?: StripeInvoice[];
};

type FormData = {
  fileType: string;
};

export const ExportAllModal: FC<ExportAllModalProps> = ({
  onOpenChange,
  open,
  invoice = [],
  selectedInvoices = []
}) => {
  const [isExporting, setIsExporting] = useState(false);

  // Determine which invoices to export
  const invoicesToExport = selectedInvoices.length > 0 ? selectedInvoices : invoice;
  const isMultipleSelection = selectedInvoices.length > 1;

  // Determine available file types based on selection
  const fileTypeOptions = isMultipleSelection ? ["CSV"] : ["PDF", "CSV"];

  const { register, control, handleSubmit, watch, reset } = useForm<FormData>({
    defaultValues: { fileType: isMultipleSelection ? "CSV" : "PDF" },
  });

  const selectedFileType = watch("fileType");

  const onSubmit = async (data: FormData) => {
    if (!invoicesToExport || invoicesToExport.length === 0) {
      showToast({
        title: "No invoices to export",
        type: "error"
      });
      return;
    }

    setIsExporting(true);

    try {
      if (data.fileType === "PDF") {
        if (invoicesToExport.length === 1) {
          // Single PDF download
          await downloadInvoicePDF(invoicesToExport[0]);
          showToast({
            title: "PDF downloaded successfully",
            type: "success"
          });
        } else {
          // Multiple PDF downloads
          await downloadMultipleInvoicePDFs(invoicesToExport);
          showToast({
            title: `${invoicesToExport.length} PDFs are being downloaded`,
            type: "success"
          });
        }
      } else if (data.fileType === "CSV") {
        // CSV download
        await downloadInvoicesAsCSV(invoicesToExport);
        showToast({
          title: "CSV downloaded successfully",
          type: "success"
        });
      }

      // Small delay to ensure user sees the success message
      setTimeout(() => {
        onOpenChange(false);
      }, 500);
    } catch (error) {
      console.error("Export failed:", error);
      showToast({
        title: "Export failed. Please try again.",
        type: "error"
      });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (open) {
      // Reset the form when the modal is opened
      // This ensures the last selected option is always the default
      // and the form is ready for the next export
      reset({ fileType: isMultipleSelection ? "CSV" : "PDF" });
    }
  }, [open, isMultipleSelection, reset])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-lg p-8 rounded-2xl text-left max-h-[90vh] overflow-y-auto">
        <div>
          <DialogTitle className="text-2xl text-black">Export Billing Data</DialogTitle>
        </div>

        <div className="border-t border-neutral-50 my-3" />

        {/* Selection Info */}
        {/* <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {selectedInvoices.length > 0 
              ? `Exporting ${selectedInvoices.length} selected invoice${selectedInvoices.length > 1 ? 's' : ''}`
              : `Exporting all ${invoice.length} invoices`
            }
          </p>
          {isMultipleSelection && (
            <p className="text-xs text-orange-600 mt-1">
              Note: Multiple PDFs will be downloaded individually. For bulk PDF export, consider using CSV format.
            </p>
          )}
        </div> */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormSelect
            label="File Type"
            name="fileType"
            options={fileTypeOptions.map((fileType) => ({
              label: fileType,
              value: fileType,
            }))}
            register={register}
            control={control}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full"
              disabled={isExporting}
            >
              <BiExport className="h-2 w-2" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
