import { FaSort } from "react-icons/fa";
import { Button } from "../ui/button";
import { Tooltip } from "../Tooltip";

export function SortButton({
  column,
  label,
  tooltipText,
}: {
  column: any;
  label: string;
  tooltipText?: string;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="flex items-center justify-between w-full text-inherit"
    >
      <div className="flex gap-1 items-center">
        {label}
        {tooltipText && <Tooltip tooltipText={tooltipText} />}
      </div>
      <FaSort className="h-2 w-2 text-[#B5BAC4]" />
    </Button>
  );
}