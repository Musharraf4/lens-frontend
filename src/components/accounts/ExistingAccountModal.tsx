import { FC } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { FormInput } from "../ui/inputs/Input";
import { useAddExistingUser } from "@/services/user.api";
import { showToast } from "../Toast";

type ExistingAccountModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormData = {
  company_id: string;
  email: string;
};

export const ExistingAccountModal: FC<ExistingAccountModalProps> = ({
  onOpenChange,
  open,
}) => {
  const { mutateAsync: addExistingUser, isPending } = useAddExistingUser();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: { company_id: "", email: "" },
  });

  const onSubmit = (data: FormData) => {
    addExistingUser(data, {
      onSuccess: () => {
        showToast({
          title: "Access to existing account has been sent",
          description: "Once accepted, it will appear on your account center.",
          type: "success",
        });
        onOpenChange(false);
      },
      onError: (error: any) => {
        const errorMsg = error?.response?.data?.detail;
        showToast({
          title: "Failed to add existing account",
          description: errorMsg || "Please try again later.",
          type: "error",
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-8 rounded-2xl text-left max-h-[90vh] overflow-y-auto">
        <div>
          <DialogTitle className="text-2xl text-black">
            Add Existing Account
          </DialogTitle>
          <span className="text-sm text-neutral-500">
            To request access to an existing account enter the Account Number
            and the Administrator’s Email. We’ll contact them directly to
            approve your access.
          </span>
        </div>

        <div className="border-t border-neutral-50 my-3" />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="Account Number"
            name="company_id"
            register={register}
            rules={{
              required: "Account number is required",
              pattern: {
                value:
                  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
                message: "Enter a valid UUID",
              },
            }}
            requiredMark
            errors={errors}
          />
          <FormInput
            label="Administrator Email"
            name="email"
            register={register}
            rules={{
              required: "Administrator Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid Email",
              },
            }}
            requiredMark
            errors={errors}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="dark"
              type="submit"
              className="rounded-full"
              disabled={isPending || !isValid}
            >
              {isPending ? "Sending..." : "Request Access"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
