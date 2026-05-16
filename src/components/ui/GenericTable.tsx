"use client";

import { Dropdown } from "@/components/Dropdown";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getVisiblePages } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface DataTableProps {
  columns: ColumnDef<any, any>[];
  data: any[];
  isLoading?: boolean;
  enableRowSelection?: boolean;
  hidePageSizeDropdown?: boolean;
  hidePagination?: boolean;
  pageIndex?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function GenericTable({
  columns,
  data,
  isLoading,
  enableRowSelection = false,
  hidePageSizeDropdown,
  hidePagination = false,
  pageIndex = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
}: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  // Inject checkbox column if enabled`
  const finalColumns = React.useMemo(() => {
    if (!enableRowSelection) return columns;
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="ml-2.5 bg-white"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
    ];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      pagination: { pageIndex: pageIndex - 1, pageSize },
    },
    manualPagination: true,
    pageCount: Math.ceil(totalItems / pageSize),
  });


  const TableSkeleton = () => (
    <div className="rounded-2xl overflow-hidden border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-neutral-25">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="first:rounded-tl-2xl last:rounded-tr-2xl text-neutral-500"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {Array(10)
              .fill(0)
              .map((_, index) => (
                <TableRow key={index}>
                  {finalColumns.map((_, cellIndex) => (
                    <TableCell
                      key={cellIndex}
                      className="pl-[20px]"
                    >
                      <Skeleton className="h-7 w-[80%] rounded-md" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div >
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="GenericTable rounded-2xl overflow-hidden border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-25">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="first:rounded-tl-2xl last:rounded-tr-2xl text-neutral-500"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="bg-white">
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      data-tour={`${index === 0 ? 'table-row' : ''}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="pl-[20px]"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={finalColumns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {!isLoading && !hidePagination && (
        <div className="flex flex-col sm:flex-row justify-between px-2 py-4 gap-4">
          <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <div className="text-sm text-nowrap">Total {totalItems} items</div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
            <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pageIndex - 1)}
                disabled={pageIndex <= 1}
              >
                <FaArrowLeft className="w-3 h-3" />
              </Button>

              {/* numbered buttons */}
              {getVisiblePages(pageIndex, table.getPageCount()).map((page, i) =>
                page === "..." ? (
                  <span
                    key={`dots-${i}`}
                    className="px-2 text-neutral-400"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(page as number)}
                    className={
                      page === pageIndex ? "bg-neutral-100 pointer-events-none" : "border-none"
                    }
                  >
                    {page}
                  </Button>
                )
              )}

              {/* Next button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pageIndex + 1)}
                disabled={pageIndex >= table.getPageCount()}
              >
                <FaArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* page size dropdown */}
            {!hidePageSizeDropdown && (
              <Dropdown
                options={[5, 10, 20, 50]}
                value={pageSize}
                onChange={(value) => onPageSizeChange?.(Number(value))}
                suffix="per page"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
