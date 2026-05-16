import { showToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FormSelect } from "@/components/ui/inputs/Select";
import { Role } from "@/enums";
import {
  useAcceptCompanyInvite,
  useUpdateCompanyUser,
} from "@/services/user.api";
import { CompanyUser } from "@/types";
import { FC } from "react";
import { useForm } from "react-hook-form";

type EditRoleModalProps = {
  open: boolean;
  onOpenChange: (open: string | null) => void;
  data: CompanyUser | undefined;
  companyId: string;
  acceptInvitation?: boolean;
};

type FormData = {
  role: Role;
};

export const EditRoleModal: FC<EditRoleModalProps> = ({
  onOpenChange,
  open,
  data,
  companyId,
  acceptInvitation,
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isDirty },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      role: acceptInvitation ? undefined : (data?.role?.toLowerCase() as Role),
    },
  });

  const { mutateAsync: updateCompanyUser, isPending } = useUpdateCompanyUser();
  const { mutateAsync: acceptCompanyInvite, isPending: isAccepting } =
    useAcceptCompanyInvite();

  const onSubmit = (payload: FormData) => {
    acceptInvitation
      ? acceptCompanyInvite(
        {
          data: {
            invitation_id: data?.invitation_id || "",
            role: payload.role,
          },
        },
        {
          onSuccess: () => {
            reset();
            showToast({
              title: `Request from ${data?.name} is approved`,
              description: `New user can now manage ${data?.name}’s tracking, reporting, and integrations from your dashboard.`,
              type: "success"
            });
            onOpenChange(null);
          },
          onError: (error: any) => {
            const errorMsg = error.response.data.detail;
            showToast({ title: errorMsg, type: "error" });
          },
        }
      )
      : updateCompanyUser(
        {
          companyId: companyId || "",
          userId: data?.id || "",
          data: { new_role: payload.role },
        },
        {
          onSuccess: () => {
            showToast({
              title: `Role updated successfully`,
              type: "success",
            });
            reset();
            onOpenChange(null);
          },
          onError: (error: any) => {
            const errorMsg = error.response.data.detail;
            showToast({ title: errorMsg, type: "error" });
          },
        }
      );
  };
  const roleOptions = [
    ...(acceptInvitation
      ? [{ label: "Select", value: "", disabled: true }]
      : []),
    ...Object.values(Role)?.filter(item => item !== Role.Owner).map((role) => ({
      label: role.charAt(0).toUpperCase() + role.slice(1),
      value: role,
    })),
  ];
  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(null)}>
      <DialogContent className="max-w-lg p-8 rounded-2xl text-left max-h-[90vh] overflow-y-auto">
        <div>
          <DialogTitle className="text-2xl text-black">
            {acceptInvitation ? "Confirm Request from" : "Edit"} {data?.name}
          </DialogTitle>
        </div>

        <div className="border-t border-neutral-50 my-3" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormSelect
            label="Role"
            name="role"
            options={roleOptions}
            register={register}
            control={control}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => onOpenChange(null)}
              disabled={isPending || isAccepting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full"
              disabled={
                (acceptInvitation && !watch("role")) ||
                (!acceptInvitation && !isDirty) ||
                isPending || isAccepting
              }
            >
              {acceptInvitation ? "Confirm" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
