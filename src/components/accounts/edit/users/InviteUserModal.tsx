import { showToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FormInput } from "@/components/ui/inputs/Input";
import { FormSelect } from "@/components/ui/inputs/Select";
import { Role } from "@/enums";
import { useInviteCompanyUser } from "@/services/user.api";
import { FC } from "react";
import { useForm } from "react-hook-form";

type InviteUserModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string
};

type FormData = {
  username: string;
  email: string;
  role: Role;
};

export const InviteUserModal: FC<InviteUserModalProps> = ({ onOpenChange, open, companyId }) => {
  const { mutateAsync: inviteUser, isPending } = useInviteCompanyUser()
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    mode: "all",
    defaultValues: { role: Role.Admin, username: "", email: "" },
  });

  const onSubmit = (data: FormData) => {
    inviteUser({ data: { company_id: companyId, ...data } }, {
      onSuccess: () => {
        showToast({
          title: `Invitation has been sent to ${data.username}`,
          description: ' They’ll be able to join once they accept.',
          type: "success",
        });
        onOpenChange(false);
      },
      onError: (error: any) => {
        const errorMsg = error?.response?.data?.detail;
        showToast({
          title: `Failed to send an invitation to ${data.username}`,
          description: errorMsg || 'Please try again later.',
          type: "error",
        });
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-lg p-8 rounded-2xl text-left max-h-[90vh] overflow-y-auto">
        <div>
          <DialogTitle className="text-2xl text-black">Invite User</DialogTitle>
        </div>

        <div className="border-t border-neutral-50 my-3" />
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormInput
            label="User name"
            name="username"
            register={register}
            rules={{
              required: "User name is required",
              maxLength: { value: 120, message: "Max length is 120" },
            }}
            requiredMark
            errors={errors}
          />
          <FormInput
            label="Email"
            name="email"
            register={register}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid Email",
              },
            }}
            requiredMark
            errors={errors}
          />
          <FormSelect
            label="Role"
            name="role"
            options={Object.values(Role)?.filter(item => item !== Role.Owner).map((role) => ({
              label: role.charAt(0).toUpperCase() + role.slice(1), // Capitalize
              value: role,
            }))}
            register={register}
            control={control}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full"
              disabled={isPending}
            >
              {isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
