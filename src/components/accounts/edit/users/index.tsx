import { AgencyUserType } from "@/app/(protected)/accounts/switch-to-accounts/[id]/UsersTable";
import DataTable from "@/components/DataTable";
import { showToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash } from "lucide-react";
import React, { useState } from "react";
import { LuChevronsUpDown } from "react-icons/lu";
import { EditRoleModal } from "./EditRoleModal";
import { InviteUserModal } from "./InviteUserModal";
import { InvitationType, Role } from "@/enums";
import { CompanyUser } from "@/types";
import dayjs from "dayjs";
import {
  useCheckPlanUsed,
  useDeleteCompaniesUser,
  useInvitationResponse,
} from "@/services/user.api";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { getInviteCompanyStatus, getInviteUserStatus } from "@/lib/utils";
import RoleBadge from "../../RoleBadge";
import { useAuth } from "@/store/AuthContext";
import { IoCheckmarkOutline, IoClose } from "react-icons/io5";
import { IoIosAlert } from "react-icons/io";
import TooltipWrapper from "@/components/ui/TooltipWrapper";

export const ClientUsers = ({
  users,
  companyId,
}: {
  users: CompanyUser[];
  companyId: string;
}) => {
  const { data, isLoading } = useCheckPlanUsed(companyId ?? "");
  const { selectedCompany } = useSelectedCompanyStore();
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState<null | string>(null);
  const [showEditModal, setShowEditModal] = useState<null | string>(null);
  const [showInviteUserModal, setShowInviteUserModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<
    null | string
  >(null);
  const [declineRequestModal, setDeclineRequestModal] = useState<null | string>(
    null
  );
  const disabledActions =
    ((selectedCompany?.role !== Role.Admin) && (selectedCompany?.role !== Role.Owner)) ||
    users?.filter((item) => item?.role === "admin")?.length < 2;
  const { mutateAsync: deleteUser, isPending } = useDeleteCompaniesUser();
  const { mutateAsync: handleResponse, isPending: isResponsePending } =
    useInvitationResponse();
  const isNotAdmin = ((selectedCompany?.role !== Role.Admin) && (selectedCompany?.role !== Role.Owner));
  const isUserLimitReached = data && data.allowed && !data.allowed.users;

  const isButtonDisabled = isLoading || isUserLimitReached;

  let tooltipMessage = "";
  if (isNotAdmin) {
    tooltipMessage = "You have no access for this action.";
  } else if (isUserLimitReached) {
    tooltipMessage = "Limit reached for your current plan.";
  }

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
      <LuChevronsUpDown />
    </Button>
  );

  const columns: ColumnDef<AgencyUserType>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <SortHeader column={column} title="Name" />,
      cell: ({ row }) => {
        return (
          <div className="flex flex-col">
            <span className="text-sm text-black">{row.getValue("name")}</span>
            <small className="text-xs text-neutral-500 font-light">
              {row.original?.email}
            </small>
          </div>
        );
      },
    },
    {
      accessorKey: "first_activity",
      header: ({ column }) => (
        <SortHeader column={column} title="First Activity" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("first_activity") as string;
        const status = row.original.status;
        const invitationId = row.original.invitation_id;
        const invitationType = row.original.invitation_type;
        const lastActivity = row.original.last_activity;

        const showData = invitationId
          ? invitationType === InvitationType.UserInvite
            ? getInviteUserStatus(status)
            : getInviteCompanyStatus(status)
          : null;

        return (
          <span>
            {showData
              ? showData
              : date || lastActivity
                ? dayjs(date || lastActivity).format("DD-MM-YYYY")
                : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "last_activity",
      header: ({ column }) => (
        <SortHeader column={column} title="Last Activity" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("last_activity") as string;
        const firstActivity = row.original.first_activity;

        return <span>{date || firstActivity ? dayjs(date || firstActivity).format("DD-MM-YYYY") : "-"}</span>;
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => <SortHeader column={column} title="Role" />,
      cell: ({ row }) => {
        const invitationId = row.original.invitation_id;
        const invitationType = row.original.invitation_type;
        const role = row.getValue("role") as Role;
        return invitationId &&
          invitationType === InvitationType.CompanyInvite ? (
          "-"
        ) : (
          <RoleBadge role={role} />
        );
      },
    },
    {
      accessorKey: "action",
      header: ({ column }) => <SortHeader column={column} title="" />,
      cell: ({ row }) => {
        const invitationId = row.original.invitation_id;
        const invitationType = row.original.invitation_type;
        const role = row.original.role;
        const disabledEdit =
          Boolean(row.original.invitation_id) ||
          ((selectedCompany?.role !== Role.Admin) && (selectedCompany?.role !== Role.Owner)) ||
          row.original.id === user?.id || (role == Role.Owner);
        const disabledDelete =
          ((selectedCompany?.role !== Role.Admin) && (selectedCompany?.role !== Role.Owner)) || row.original.id === user?.id || (role == Role.Owner);
        const tooltipDisableMessage = row.original.invitation_id
          ? "You can't edit role for pending invitation."
          : row.original.id === user?.id
            ? "You can't edit your own role."
            : isNotAdmin
              ? "You have no access for this action."
              : "";
        const toolTipDisableDeleteMessage =
          row.original.id === user?.id
            ? "You can't delete yourself."
            : isNotAdmin
              ? "You have no access for this action."
              : "";
        return (
          <div className="flex justify-center space-x-2">
            {invitationId && invitationType === InvitationType.CompanyInvite ? (
              <>
                <TooltipWrapper
                  message={tooltipMessage}
                  show={Boolean(isNotAdmin)}
                >
                  <button
                    onClick={() => {
                      setShowConfirmationModal(
                        row.original.invitation_id as string
                      );
                    }}
                    className="w-7 h-7 border disabled:cursor-not-allowed disabled:opacity-50  border-green-500 text-green-500 rounded-full flex items-center justify-center hover:bg-green-50 transition"
                    disabled={((selectedCompany?.role !== Role.Admin) && (selectedCompany?.role !== Role.Owner))}
                  >
                    <IoCheckmarkOutline />
                  </button>
                </TooltipWrapper>
                <TooltipWrapper
                  message={tooltipMessage}
                  show={Boolean(isNotAdmin)}
                >
                  <button
                    onClick={() => {
                      setDeclineRequestModal(
                        row.original.invitation_id as string
                      );
                    }}
                    className="w-7 h-7 border disabled:cursor-not-allowed disabled:opacity-50 border-red-500 text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 transition"
                    disabled={((selectedCompany?.role !== Role.Admin) && (selectedCompany?.role !== Role.Owner))}
                  >
                    <IoClose />
                  </button>
                </TooltipWrapper>
              </>
            ) : (
              <>
                <TooltipWrapper
                  message={tooltipDisableMessage}
                  show={Boolean(disabledEdit)}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={disabledEdit}
                    className="disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setShowEditModal(row.original.id)}
                  >
                    <Pencil />
                  </Button>
                </TooltipWrapper>
                <TooltipWrapper
                  message={toolTipDisableDeleteMessage}
                  show={Boolean(disabledDelete)}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={disabledDelete}
                    onClick={() => setShowDeleteModal(row.original.id)}
                    className="disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash />
                  </Button>
                </TooltipWrapper>
              </>
            )}
          </div>
        );
      },
    },
  ];
  return (
    <div className="space-y-3">
      <DataTable
        hidePageSizeDropdown
        columns={columns}
        data={users}
        hidePagination
      />
      <div className="w-full">
        <TooltipWrapper
          message={tooltipMessage}
          show={Boolean(isButtonDisabled)}
          fullWidth
        >
          <Button
            variant="outline"
            className="rounded-full w-full"
            onClick={() => setShowInviteUserModal(true)}
            disabled={isButtonDisabled}
          >
            <Plus />
            Invite user
          </Button>
        </TooltipWrapper>
      </div>

      {Boolean(showDeleteModal) && (
        <ConfirmationModal
          icon={<Trash className="w-12 h-12" />}
          open={Boolean(showDeleteModal)}
          title={`Are you sure you want to delete ${users?.find((user) => user?.id === showDeleteModal)?.name
            }?`}
          subTitle={`This action will permanently remove ${users?.find((user) => user?.id === showDeleteModal)?.name
            } from team, and it cannot be undone.`}
          onOpenChange={setShowDeleteModal}
          handleAction={() => {
            const invitationId = users?.find(
              (user) => user?.id === showDeleteModal
            )?.invitation_id;
            deleteUser(
              {
                companyId,
                userId: showDeleteModal as string,
                invitationId: invitationId as string,
              },
              {
                onSuccess: () => {
                  showToast({
                    title: "User deleted Successfully",
                    type: "success",
                  });
                  setShowDeleteModal(null);
                },
                onError: (error: any) => {
                  const errorMsg = error?.response?.data?.detail;
                  setDeclineRequestModal(null);
                  showToast({
                    title: "Error",
                    description:
                      errorMsg ||
                      "There was an error deleting the user. Please try again.",
                    type: "error",
                  });
                },
              }
            );
          }}
          actionButtonText={"Delete"}
          disabled={isPending}
        />
      )}
      {Boolean(showEditModal) && (
        <EditRoleModal
          open={Boolean(showEditModal)}
          onOpenChange={setShowEditModal}
          data={users.find((user) => user.id === showEditModal)}
          companyId={companyId}
        />
      )}
      {showInviteUserModal && (
        <InviteUserModal
          open={showInviteUserModal}
          onOpenChange={setShowInviteUserModal}
          companyId={companyId}
        />
      )}
      {Boolean(showConfirmationModal) && (
        <EditRoleModal
          open={Boolean(showConfirmationModal)}
          onOpenChange={setShowConfirmationModal}
          data={users.find(
            (user) => user.invitation_id === showConfirmationModal
          )}
          companyId={companyId}
          acceptInvitation
        />
      )}
      {Boolean(declineRequestModal) && (
        <ConfirmationModal
          icon={<IoIosAlert className="w-12 h-12" />}
          open={Boolean(declineRequestModal)}
          title={`Are you sure you want to decline ${users?.find((user) => user?.invitation_id === declineRequestModal)
            ?.name
            }'s request?`}
          subTitle={`If you decline, user won’t be able to join your company account unless invited.`}
          onOpenChange={setDeclineRequestModal}
          handleAction={() => {
            handleResponse(
              {
                data: {
                  invitation_id: declineRequestModal,
                  is_invitation_response: false,
                },
              },
              {
                onSuccess: () => {
                  setDeclineRequestModal(null);
                  showToast({
                    title: `Invitation from ${users?.find(
                      (user) => user?.invitation_id === declineRequestModal
                    )?.name
                      } is declined`,
                    type: "success",
                  });
                },
                onError: (error: any) => {
                  const errorMsg = error?.response?.data?.detail;
                  setDeclineRequestModal(null);
                  showToast({
                    title: "Error",
                    description:
                      errorMsg ||
                      "There was an error declining the invitation. Please try again.",
                    type: "error",
                  });
                },
              }
            );
          }}
          actionButtonText={"Decline"}
          disabled={isPending || isResponsePending}
        />
      )}
    </div>
  );
};
