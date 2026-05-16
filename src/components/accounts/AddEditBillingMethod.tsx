import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FC, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "@/components/payment/PaymentForm";
import { useAttachPaymentMethod } from "@/services/user.api";
import { showToast } from "../Toast";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);
type AddEditBillingMethodProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit?: boolean;
  companyId: string;
  handleSubscription?: (() => Promise<void>) | undefined;
};

export const AddEditBillingMethodModal: FC<AddEditBillingMethodProps> = ({
  onOpenChange,
  open,
  edit,
  companyId,
  handleSubscription
}) => {
  const [paymentState, setPaymentState] = useState<{
    pending?: boolean;
    touched: boolean;
    valid: boolean;
    token?: string;
  }>({
    touched: false,
    pending: false,
    valid: false,
  });
  const { mutateAsync: attachPaymentMethod, isPending } =
    useAttachPaymentMethod();
  const handleSubmit = () => {
    const options = {
      onSuccess: () => {
        showToast({
          title: "New billing method saved",
          description:
            "You’re all set for future payments with the updated billing info.",
          type: "success",
        });
        handleSubscription?.();
        onOpenChange(false);
      },
      onError: () => {
        showToast({
          title: "Failed to save new billing method",
          description: "Please try again later.",
          type: "error",
        });
      },
    };
    attachPaymentMethod(
      {
        companyId,
        data: { stripe_token: paymentState.token, create_new: edit ? false : true },
      },
      options
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl pl-4 pr-4 pt-8 pb-8 rounded-2xl text-left max-h-[90vh] overflow-y-auto">
        <div>
          <DialogTitle className="text-2xl text-black">
            {edit ? "Edit" : "Add"} Billing Method
          </DialogTitle>
        </div>
        <div className="w-full">
          <div className="border-t border-neutral-50 my-3" />
          <Elements stripe={stripePromise}>
            <PaymentForm onChange={setPaymentState} />
          </Elements>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 ml-2 mr-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full"
              onClick={handleSubmit}
              disabled={!paymentState.valid || isPending}
            >
              Save Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
