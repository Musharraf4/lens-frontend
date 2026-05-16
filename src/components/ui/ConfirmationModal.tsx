import { FC, ReactNode } from "react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

type ConfirmationModalProps = {
  icon: ReactNode;
  title?: string;
  subTitle?: string;
  open: boolean;
  onOpenChange: (open: string | null) => void;
  handleAction: () => void;
  actionButtonText: string;
  disabled?: boolean
};

export const ConfirmationModal: FC<ConfirmationModalProps> = ({
  handleAction,
  onOpenChange,
  open,
  icon,
  subTitle,
  title,
  actionButtonText,
  disabled = false
}) => {
  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(null)}>
      <DialogContent className="max-w-md rounded-2xl z-[1000] overflow-hidden px-8 py-6">
        <div className="flex flex-col items-center">
          <div className="mb-6">{icon}</div>

          <div className="text-center mb-6 space-y-2">
            <DialogTitle className="text-2xl text-black">{title}</DialogTitle>
            <p className="text-neutral-500">{subTitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <Button
              variant="secondary"
              className="rounded-full cursor-pointer"
              disabled={disabled}
              onClick={() => onOpenChange(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-full cursor-pointer"
              onClick={handleAction}
              disabled={disabled}
            >
              {actionButtonText}
            </Button>
          </div>
        </div>

        {/* Background decorative icon */}
        <img
          src="/circles-bg-icon.svg"
          className="absolute inset-0 -z-10 -top-4 left-5"
        />
      </DialogContent>
    </Dialog>
  );
};
