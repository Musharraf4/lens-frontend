import { ActionDialog } from "@/components/ActionDialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  useDeletePhoneNumber,
  usePhoneNumbers,
  useUpdatePhoneNumberStatus,
} from "@/services/phoneNumbers.api";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { TrackingRecord } from "@/types";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { MdOutlineEdit } from "react-icons/md";
import { showToast } from "../Toast";
import { NoDataPage } from "../common/NoDataPage";
import { SortButton } from "../common/SortButton";
import { GenericTable } from "../ui/GenericTable";
import { formatPhoneNumberUniversal, formatString, getSourceIcon } from "@/lib/utils";
import { Role } from "@/enums";

export function TrackingTable({
  onEditNumber,
  setNumberPoolTableId,
}: {
  onEditNumber: (id: string) => void;
  setNumberPoolTableId: Dispatch<
    SetStateAction<{
      name: string;
      id: string;
    } | null>
  >;
}) {
  const [page, setPage] = useState(1);
  const { selectedCompany } = useSelectedCompanyStore();
  const { data: trackingDataAPI, isLoading: isTrackingDataLoading } =
    usePhoneNumbers({
      page,
      size: 10,
      company_id: selectedCompany?.company?.id,
    });
  const disableAction = selectedCompany?.role === Role.Viewer

  const { mutate: deleteTrackingNumber } = useDeletePhoneNumber();

  // Transform API data to table format
  const transformedData = useMemo(() => {
    if (!trackingDataAPI?.items) return [];

    return trackingDataAPI.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      source:
        item.source === "google_ads"
          ? "Google Ads"
          : item.source === "web_referral"
            ? "Web Referral"
            : item.source === "all"
              ? "All"
              : item.source,
      trackingNumber:
        item.tracking_numbers?.length > 0
          ? item.tracking_numbers.length === 1
            ? formatPhoneNumberUniversal(item.tracking_numbers[0].phone_number)
            : `${item.tracking_numbers.length} numbers`
          : "No numbers",
      callRecording: item.call_recording_enabled,
      status: item.status === "active",
      forwardTo: formatPhoneNumberUniversal(item.forwarding_number),
      type: item.pool_type,
      // Keep original API data for reference
      originalData: item,
    }));
  }, [trackingDataAPI]);

  const [data, setData] = useState<TrackingRecord[]>([]);

  // Update local data when API data changes
  useEffect(() => {
    setData(transformedData);
  }, [transformedData]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<TrackingRecord | null>(null);

  // State for enable/disable dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [rowToToggle, setRowToToggle] = useState<TrackingRecord | null>(null);
  const [toggleType, setToggleType] = useState<"default" | "alert">("default");

  // Add these for edit dialog:
  // const [editDialogOpen, setEditDialogOpen] = useState(false);
  // const [rowToEdit, setRowToEdit] = useState<TrackingRecord | null>(null);
  // const [editFormValues, setEditFormValues] = useState<Record<string, string>>({});

  // const editFields = [
  //   { id: "name", label: "Name", required: true, placeholder: "Enter name" },
  //   { id: "source", label: "Source", required: true, placeholder: "Enter source" },
  //   {
  //     id: "trackingNumber",
  //     label: "Tracking Number",
  //     required: true,
  //     placeholder: "Enter tracking number",
  //   },
  //   { id: "forwardTo", label: "Forward to", required: true, placeholder: "Enter forward number" },
  //   // Add more fields as needed
  // ];

  const handleStatusToggle = (row: TrackingRecord) => {
    setRowToToggle(row);
    setToggleType(row.status ? "alert" : "default");
    setStatusDialogOpen(true);
  };

  const {
    mutateAsync: updatePhoneNumberStatus,
    isPending: updatingPhoneStatus,
  } = useUpdatePhoneNumberStatus();
  const confirmStatusToggle = () => {
    if (rowToToggle) {
      const status = rowToToggle.status ? "disabled" : "active";
      updatePhoneNumberStatus(
        {
          phone_number_ids: [rowToToggle?.id],
          status,
          company_id: selectedCompany?.company?.id,
        },
        {
          onSuccess: () => {
            setData((prevData) =>
              prevData.map((record) =>
                record.id === rowToToggle.id
                  ? { ...record, status: !record.status }
                  : record
              )
            );
            setStatusDialogOpen(false);
            setRowToToggle(null);
          },
        }
      );
    }
  };

  const handleDeleteClick = (row: TrackingRecord) => {
    setRowToDelete(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (rowToDelete) {
      // setData(prev => prev.filter(r => r.id !== rowToDelete.id));
      deleteTrackingNumber(
        {
          phoneNumberId: rowToDelete.id.toString(),
          company_id: selectedCompany?.company?.id,
        },
        {
          onSuccess: () => {
            setRowToDelete(null);
          },
          onError: (error) => {
            console.error("Error deleting tracking number:", error);
            showToast({
              title: "Error deleting tracking number",
              description: "Please try again",
              type: "error",
            });
          },
        }
      );
      setDeleteDialogOpen(false);
    }
  };

  // const handleEditClick = (row: TrackingRecord) => {
  //   setRowToEdit(row);
  //   setEditFormValues({
  //     name: row.name,
  //     source: row.source,
  //     trackingNumber: row.trackingNumber,
  //     forwardTo: row.forwardTo,
  //     // Add more fields as needed
  //   });
  //   setEditDialogOpen(true);
  // };

  // const handleEditFieldChange = (id: string, value: string) => {
  //   setEditFormValues((prev) => ({ ...prev, [id]: value }));
  // };

  // const handleEditConfirm = () => {
  //   if (rowToEdit) {
  //     setData((prev) => prev.map((r) => (r.id === rowToEdit.id ? { ...r, ...editFormValues } : r)));
  //     setEditDialogOpen(false);
  //     setRowToEdit(null);
  //   }
  // };

  const columns = [
    {
      accessorKey: "name",
      header: ({ column }: any) => <SortButton column={column} label="Name" />,
      cell: ({ row }: any) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "source",
      header: ({ column }: any) => (
        <SortButton column={column} label="Source" />
      ),
      cell: ({ row }: any) => {
        const source = row.getValue("source");
        return (
          <div className="flex items-center">
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
    {
      accessorKey: "trackingNumber",
      header: ({ column }: any) => (
        <SortButton column={column} label="Tracking Number" />
      ),
      cell: ({ row }: any) => {
        const type = row.original.type;
        return (
          <span
            className={`${type === "dynamic"
              ? "hover:underline text-blue-400 cursor-pointer"
              : ""
              }`}
            onClick={() => {
              if (type === "dynamic") {
                sessionStorage.setItem(
                  "selectedTrackingRecord",
                  JSON.stringify(row.original)
                );
                setNumberPoolTableId({
                  id: row.original.id,
                  name: row.original.name,
                });
              }
            }}
          >
            {row.getValue("trackingNumber")}
          </span>
        );
      },
    },
    {
      accessorKey: "callRecording",
      header: ({ column }: any) => (
        <SortButton column={column} label="Call Recording" />
      ),
      cell: ({ row }: any) => (
        <span>{row.getValue("callRecording") ? "On" : "Off"}</span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }: any) => (
        <SortButton column={column} label="Status" />
      ),
      cell: ({ row, getValue }: any) => (
        <div className="flex items-center justify-between gap-2 mr-4">
          <span>{getValue("status") ? "Active" : "Disabled"}</span>
          <Switch
            checked={getValue("status")}
            className="ml-2"
            onCheckedChange={() => handleStatusToggle(row.original)}
            disabled={disableAction}
          />
        </div>
      ),
    },
    {
      accessorKey: "forwardTo",
      header: ({ column }: any) => (
        <SortButton column={column} label="Forward to" />
      ),
      cell: ({ row }: any) => <span>{row.getValue("forwardTo")}</span>,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }: any) => (
        <div className="flex gap-2 flex-1 justify-end items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEditNumber(row.original.id)}
            title="Edit"
            disabled={disableAction}
          >
            <MdOutlineEdit className="w-2 h-2" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-neutral-500 w-fit h-fit flex items-center justify-center p-1"
            onClick={() => handleDeleteClick(row.original)}
            disabled={disableAction}
          >
            <Image
              src="/TrashIcon.svg"
              alt="Delete"
              width={14}
              height={14}
              className="text-black"
            />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      {!isTrackingDataLoading && !data?.length ? (
        <div data-tour="tracking-empty-state">
          <NoDataPage
            heading="You don't have any tracking numbers yet"
            subHeading="Create a number to start tracking phone calls."
          />
        </div>
      ) : (
        <GenericTable
          columns={columns}
          data={data || []}
          isLoading={isTrackingDataLoading}
          pageIndex={page}
          pageSize={10}
          totalItems={trackingDataAPI?.total}
          onPageChange={setPage}
          hidePageSizeDropdown
        />
      )}
      {/* Delete dialog */}
      <ActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        type="alert"
        title={`Are you sure you want to delete the ${rowToDelete?.name}?`}
        description="This action will permanently remove the record and cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        icon={
          <Image src="/TrashIcon.svg" alt="Delete" width={36} height={36} />
        }
      />
      {/* Enable/Disable dialog */}
      <ActionDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        type={toggleType}
        loading={updatingPhoneStatus}
        title={
          rowToToggle
            ? rowToToggle.status
              ? `Are you sure you want to disable the ${rowToToggle.name}?`
              : `Enable ${rowToToggle.name}?`
            : ""
        }
        description={
          rowToToggle
            ? rowToToggle.status
              ? "It will stop functionality, potentially reducing ad visibility and tracking performance."
              : "It will enhance ad visibility and improve tracking performance for better campaign insights."
            : ""
        }
        confirmLabel={rowToToggle?.status ? "Disable" : "Enable"}
        cancelLabel="Cancel"
        onConfirm={confirmStatusToggle}
        icon={
          rowToToggle?.status ? (
            <Image src="/Disabled.svg" alt="Disable" width={36} height={36} />
          ) : (
            <Image src="/Enabled.svg" alt="Enable" width={36} height={36} />
          )
        }
      />
    </>
  );
}
