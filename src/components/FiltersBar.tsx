import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ActiveFilter } from "@/types";
import { Check, X } from "lucide-react";
import React, { Dispatch, SetStateAction, useState } from "react";

type FilterOption = { name: string; value: string | number };
type FilterType = "select" | "date" | "input" | "range";

export type FilterDefinition = {
  name: string;
  type?: FilterType;
  options?: FilterOption[];
  multi?: boolean;
};

type FiltersBarProps = {
  disabled?: boolean;
  filters: FilterDefinition[];
  onChange: Dispatch<SetStateAction<ActiveFilter[]>>;
  initialActiveFilters?: ActiveFilter[];
};

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  onChange,
  disabled,
  initialActiveFilters = [],
}) => {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(initialActiveFilters);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  // separate states
  const [rangeFilters, setRangeFilters] = useState<{
    [key: string]: { min: number | null; max: number | null };
  }>({});
  const [popoverOpen, setPopoverOpen] = useState<{ [key: string]: boolean }>(
    {}
  );

  const availableFilters = filters.filter(
    (f) => !activeFilters.some((af) => af.name === f.name)
  );

  const handleAddFilter = (filter: FilterDefinition) => {
    setActiveFilters((prev) => [
      ...prev,
      { name: filter.name, value: filter.multi ? [] : "" },
    ]);
    setAddMenuOpen(false);
  };

  const handleToggleFilterValue = (
    name: string,
    value: string | number,
    multi?: boolean
  ) => {
    setActiveFilters((prev) =>
      prev.map((af) => {
        if (af.name !== name) return af;

        if (multi) {
          const current = Array.isArray(af.value) ? af.value : [];
          const exists = current.includes(value);
          return {
            ...af,
            value: exists
              ? current.filter((v) => v !== value)
              : [...current, value],
          };
        } else {
          return { ...af, value };
        }
      })
    );
  };

  const handleRemoveFilter = (name: string) => {
    setActiveFilters((prev) => prev.filter((af) => af.name !== name));
    setPopoverOpen((prev) => {
      const newState = { ...prev };
      delete newState[name];
      return newState;
    });
  };

  const handleResetFilters = () => {
    setActiveFilters([]);
  };

  const updateRangeFilter = (
    filterName: string,
    field: "min" | "max",
    value: number | null
  ) => {
    setRangeFilters((prev) => ({
      ...prev,
      [filterName]: {
        ...prev[filterName],
        [field]: value,
      },
    }));
  };

  React.useEffect(() => {
    onChange?.(activeFilters);
  }, [activeFilters, onChange]);

  return (
    <div className="flex items-center gap-2 flex-wrap" >
      {/* Add Filter Button */}
      <DropdownMenu open={addMenuOpen} onOpenChange={setAddMenuOpen} >
        <DropdownMenuTrigger asChild>
          <button
            className="rounded-full focus:bg-white hover:bg-white disabled:pointer-events-none p-1 text-sm font-medium text-neutral-500 disabled:text-neutral-200 flex items-center gap-1"
            disabled={availableFilters.length === 0 || disabled}
            data-tour="filters-dropdown"
          >
            <img src={"/Plus.svg"} alt="add-icon" />
            Add filter
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {availableFilters.length === 0 ? (
            <DropdownMenuItem disabled>No more filters</DropdownMenuItem>
          ) : (
            availableFilters.map((filter) => (
              <DropdownMenuItem
                key={filter.name}
                onSelect={() => handleAddFilter(filter)}
              >
                {filter.name}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filters */}
      {activeFilters.map((af) => {
        const filterDef = filters.find((f) => f.name === af.name);
        if (!filterDef) return null;

        const multi = filterDef.multi ?? false;
        const selectedValues = Array.isArray(af.value) ? af.value : [af.value];

        const label =
          multi && selectedValues.length > 1
            ? `${selectedValues.length} selected`
            : selectedValues.length === 1 && selectedValues[0]
              ? filterDef.options?.find((o) => o.value === selectedValues[0])
                ?.name ?? "Select"
              : "Select";

        return (
          <div
            key={af.name}
            className="flex items-center border rounded-full px-2 py-1 bg-white"
          >
            <span className="font-medium text-sm mr-1">{af.name}:</span>

            {filterDef.type === "select" && filterDef.options ? (
              <Popover
                open={popoverOpen[af.name]}
                onOpenChange={(open) =>
                  setPopoverOpen((prev) => ({ ...prev, [af.name]: open }))
                }
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    disabled={disabled}
                    className="px-2 py-0 h-6 text-sm"
                  >
                    <span className="truncate font-normal break-all max-w-[150px] overflow-wrap-anywhere">
                      {label}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-2 w-50 space-y-2 bg-white/30 backdrop-blur-sm rounded-2xl">
                  {filterDef.options?.length > 0 ? filterDef.options.map((opt) => {
                    const isSelected = selectedValues.includes(opt.value);
                    return (
                      <div
                        key={opt.value}
                        onClick={() => {
                          handleToggleFilterValue(af.name, opt.value, multi);
                          setPopoverOpen((prev) => ({
                            ...prev,
                            [af.name]: false,
                          }));
                        }}
                        className={`flex items-center gap-1 truncate cursor-pointer py-1 px-2 rounded 
                                    ${isSelected ? "bg-neutral-200" : "hover:bg-neutral-50"}`}
                      >
                        {isSelected && (
                          <span style={{ backgroundColor: '#000000' }}>
                            <Check className="h-4 w-4 mr text-white" />
                          </span>
                        )}
                        <p className="text-black text-sm pl-1 ">{opt.name}</p>
                      </div>
                    );
                  }) : <p className="text-black text-sm pl-1 ">No options available</p>}
                </PopoverContent>
              </Popover>
            ) : filterDef.type === "date" ? (
              <input
                type="date"
                onChange={(e) =>
                  handleToggleFilterValue(af.name, e.target.value)
                }
                className="border rounded-md px-2 py-1 text-sm"
              />
            ) : filterDef.type === "input" ? (
              <input
                type="text"
                placeholder="Enter value"
                onChange={(e) => {
                  setActiveFilters((prev) =>
                    prev.map((f) =>
                      f.name === af.name ? { ...f, value: e.target.value } : f
                    )
                  );
                }}
                className="border rounded-md px-2 py-1 text-sm"
              />
            ) : filterDef.type === "range" ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder={`Min`}
                  className="border rounded-md px-2 py-1 text-sm w-24"
                  value={rangeFilters[af.name]?.min ?? ""}
                  onChange={(e) =>
                    updateRangeFilter(
                      af.name,
                      "min",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                />
                <input
                  type="number"
                  placeholder={`Max`}
                  className="border rounded-md px-2 py-1 text-sm w-24"
                  value={rangeFilters[af.name]?.max ?? ""}
                  onChange={(e) =>
                    updateRangeFilter(
                      af.name,
                      "max",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                />
                <Button
                  variant="default"
                  size="sm"
                  disabled={
                    !(
                      rangeFilters[af.name]?.min !== null &&
                      rangeFilters[af.name]?.max !== null &&
                      !isNaN(Number(rangeFilters[af.name]?.min)) &&
                      !isNaN(Number(rangeFilters[af.name]?.max)) &&
                      Number(rangeFilters[af.name]?.min) > 0 &&
                      Number(rangeFilters[af.name]?.max) > 0
                    )
                  }
                  onClick={() => {
                    setActiveFilters((prev: any) => {
                      const exists = prev.find((f: any) => f.name === af.name);
                      if (exists) {
                        return prev.map((f: any) =>
                          f.name === af.name
                            ? {
                              ...f,
                              value: {
                                [`${af.name.toLowerCase()}_min`]:
                                  rangeFilters[af.name]?.min,
                                [`${af.name.toLowerCase()}_max`]:
                                  rangeFilters[af.name]?.max,
                              },
                            }
                            : f
                        );
                      }
                      return [
                        ...prev,
                        {
                          name: af.name,
                          value: {
                            [`${af.name.toLowerCase()}_min`]:
                              rangeFilters[af.name]?.min,
                            [`${af.name.toLowerCase()}_max`]:
                              rangeFilters[af.name]?.max,
                          },
                        },
                      ];
                    });
                  }}
                >
                  Go
                </Button>
              </div>
            ) : null}

            <Button
              variant="ghost"
              size="icon"
              disabled={disabled}
              className="ml-1 h-6 w-6"
              onClick={() => handleRemoveFilter(af.name)}
              aria-label="Remove filter"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        );
      })}

      {activeFilters.length > 0 && (
        <Button
          variant="ghost"
          disabled={disabled}
          className="hover:text-foreground px-3 py-1 text-[16px] font-medium text-neutral-500"
          onClick={handleResetFilters}
        >
          Reset
        </Button>
      )}
    </div>
  );
};
