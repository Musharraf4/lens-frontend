import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Trash2, ToggleLeft } from "lucide-react";
import { StatusTag } from "./StatusTag";
import { CiLock } from "react-icons/ci";
import Image from "next/image";

export type ActionDialogField = {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  type?: string;
  inputClassName?: string;
  [key: string]: any; // for other input props
};

export type ActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "default" | "alert" | "edit";
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
  icon?: React.ReactNode;
  // Edit type props
  fields?: ActionDialogField[];
  formValues?: Record<string, string>;
  onFieldChange?: (id: string, value: string) => void;
  row?: any;
};

export const ActionDialog: React.FC<ActionDialogProps> = ({
  open,
  onOpenChange,
  type = "default",
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  loading = false,
  icon,
  fields = [],
  formValues = {},
  onFieldChange,
  row,
}) => {
  // Default icons based on type
  const defaultIcon = type === "alert" ? (
    <Trash2 className="mx-auto mb-2 text-destructive" size={36} />
  ) : (
    <ToggleLeft className="mx-auto mb-2 text-primary" size={36} />
  );

  // Default button labels
  const confirmText = confirmLabel || (type === "alert" ? "Delete" : type === "edit" ? "Save changes" : "Enable");
  const cancelText = cancelLabel || "Cancel";

  // Button color
  const confirmVariant = type === "alert" ? "destructive" : "default";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 rounded-2xl text-left max-h-[90vh] overflow-y-auto">
        <div
          className="flex relative flex-col items-center justify-center">
          {type !== "edit" && (icon || defaultIcon)}
          <img
            src="/circles-bg-icon.svg"
            className="absolute inset-0 -z-10 -top-[33px] left-[27px]"
          />
          <DialogHeader className="mb-2 w-full pl-2 pr-2 text-left">
            <DialogTitle className="text-xl font-semibold mb-1 w-full text-center flex justify-center items-center gap-2">
              {title}
              {row &&
                <StatusTag
                  type="default"
                  showIcon
                  icon={
                    row?.type === "static" ?
                      <CiLock size={16} />
                      :
                      <Image src="/DynamicNumberIcon.svg" alt="Dynamic number Icon" width={16} height={16} />
                  }
                >
                  {row?.type}
                </StatusTag>
              }
            </DialogTitle>
            {description && (
              <DialogDescription className="text-base text-muted-foreground w-full text-center">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>
        {type === "edit" && (
          <form className="flex flex-col gap-6 mt-2 w-full">
            {fields.map(field => (
              <div key={field.id} className={"flex flex-col gap-2 " + (field.className || "")}>
                <label htmlFor={field.id} className="font-medium text-base text-foreground">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </label>
                <Input
                  id={field.id}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={formValues[field.id] || ""}
                  onChange={e => onFieldChange && onFieldChange(field.id, e.target.value)}
                  type={field.type || "text"}
                  className={field.inputClassName}
                />
              </div>
            ))}
          </form>
        )}
        <DialogFooter className="mt-6 px-3 ml-1.5 flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full sticky bottom-0 bg-white pt-4">
          <DialogClose asChild>
            <Button variant="outline" type="button" disabled={loading} className="rounded-full h-10 px-8 text-base font-medium w-full sm:w-1/2">
              {cancelText}
            </Button>
          </DialogClose>
          <Button
            variant={confirmVariant}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={
              (type === "alert"
                ? "bg-destructive text-white hover:bg-destructive/90 "
                : "") +
              " rounded-full h-10 px-8 text-base font-medium w-full sm:w-1/2"
            }
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
