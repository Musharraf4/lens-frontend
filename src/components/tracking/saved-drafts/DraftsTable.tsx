"use client";

import React from "react";
import DataTable from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { LuChevronsUpDown } from "react-icons/lu";
import { Trash2 } from "lucide-react";
import { ActionDialog } from "@/components/ActionDialog";
import {
  IPhoneNumberDraft,
  usePhoneNumberDrafts,
  useDeletePhoneNumberDraft,
} from "@/services/phoneNumberDrafts.api";
import { useNumberContext } from "@/store/CreateNumberContext";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { Role } from "@/enums";
import { usePlanUsage } from "@/store/PlanUsageContext";
import TooltipWrapper from "@/components/ui/TooltipWrapper";

export function DraftsTable() {
  const { selectedCompany } = useSelectedCompanyStore();
  const { data: planUsageData, isLoading: isPlanLoading } = usePlanUsage();
  const { setCreateNumberModalOpen, handleContinueFromDraft } =
    useNumberContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [rowToDelete, setRowToDelete] =
    React.useState<IPhoneNumberDraft | null>(null);

  const isViewer = selectedCompany?.role === Role.Viewer;
  const isTrackingNumbersLimitReached =
    planUsageData &&
    planUsageData.allowed &&
    !planUsageData.allowed.tracking_numbers;

  const isButtonDisabled =
    isViewer || isPlanLoading || isTrackingNumbersLimitReached;

  let tooltipMessage = "";
  if (isViewer) {
    tooltipMessage = "You have no access for this action.";
  } else if (isTrackingNumbersLimitReached) {
    tooltipMessage = "You have reached your tracking numbers limit.";
  }

  // Fetch drafts using the hook
  const {
    data: draftsResponse,
    isLoading,
    refetch,
  } = usePhoneNumberDrafts({
    page: 1,
    size: 10,
  });

  // Delete draft mutation
  const { mutate: deleteDraftMutation } = useDeletePhoneNumberDraft();

  const handleDeleteClick = (row: IPhoneNumberDraft) => {
    setRowToDelete(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (rowToDelete) {
      deleteDraftMutation(rowToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setRowToDelete(null);
          refetch();
        },
        onError: (error) => {
          console.error("Failed to delete draft:", error);
        },
      });
    }
  };

  const columns: ColumnDef<IPhoneNumberDraft>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Name
          <LuChevronsUpDown className="h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Creation date
          <LuChevronsUpDown className="h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
    {
      accessorKey: "step_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-between w-full"
        >
          Progress
          <LuChevronsUpDown className="h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const draft = row.original;
        return (
          <span>
            {draft.step_number}. {draft.step_name} / {draft.total_steps}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end items-center">
          <TooltipWrapper
            message={tooltipMessage}
            show={Boolean(isButtonDisabled)}
          >
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border border-neutral-300 w-fit h-fit flex items-center justify-center p-2"
              onClick={() => handleDeleteClick(row.original)}
              disabled={isViewer}
            >
              <Trash2 className="w-4 h-4 text-gray-500" />
            </Button>
          </TooltipWrapper>
          <TooltipWrapper
            message="You have no access for this action."
            show={Boolean(isViewer)}
          >
            <Button
              variant="default"
              className="rounded-full px-6 py-2"
              onClick={() => handleContinueFromDraft(row.original)}
              disabled={isViewer}
            >
              Continue set up
            </Button>
          </TooltipWrapper>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={draftsResponse?.items || []}
        hidePageSizeDropdown
        isDataLoading={isLoading}
      />
      <ActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        type="alert"
        title={`Are you sure you want to delete ${rowToDelete?.name}?`}
        description="This action will permanently remove the draft and cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        icon={<Trash2 className="mx-auto mb-2 text-destructive" size={36} />}
      />
    </>
  );
}

export default DraftsTable;
