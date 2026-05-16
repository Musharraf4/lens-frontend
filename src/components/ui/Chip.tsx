import { FC, ReactNode, useMemo } from "react";

type ChipPropType = {
  variant: "success" | "warning" | "danger";
  label: string;
  icon?: ReactNode;
};

export const Chip: FC<ChipPropType> = ({ variant, label, icon }) => {
  const chipVariant = useMemo(() => {
    switch (variant) {
      case "success":
        return "text-success-400 bg-success-100";
      case "warning":
        return "text-warning-400 bg-warning-100";
      case "danger":
        return "text-destructive bg-error-100";
      default:
        break;
    }
  }, [variant]);

  return (
    <div className={`${chipVariant} rounded-full px-1.5 py-0.5 whitespace-nowrap inline-block`}>
      <div className={`flex gap-1 items-center text-xs font-semibold `}>
        <div>

          {icon}
        </div>
        {label}
      </div>
    </div>
  );
};
