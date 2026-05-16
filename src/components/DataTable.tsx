"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
    RowSelectionState,
    VisibilityState,
    OnChangeFn,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dropdown } from "@/components/Dropdown"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"

interface DataTableProps {
    columns: ColumnDef<any, any>[]
    data: any[]
    hidePageSizeDropdown?: boolean
    hidePagination?: boolean
    enableRowSelection?: boolean
    isDataLoading?: boolean
    rowSelection?: RowSelectionState
    onRowSelectionChange?: OnChangeFn<RowSelectionState>
}

export function DataTable({
    columns,
    data,
    hidePageSizeDropdown,
    hidePagination = false,
    enableRowSelection = false,
    isDataLoading = false,
    rowSelection: externalRowSelection,
    onRowSelectionChange,
}: DataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [pageSize, setPageSize] = React.useState(hidePagination && data?.length > 0 ? data?.length : 10)
    const [pageIndex, setPageIndex] = React.useState(0)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isMobile, setIsMobile] = React.useState(false)

    // Use external row selection if provided, otherwise use internal
    const rowSelection = externalRowSelection !== undefined ? externalRowSelection : internalRowSelection

    // Handle both direct values and updater functions
    const handleRowSelectionChange: OnChangeFn<RowSelectionState> = React.useCallback((updaterOrValue) => {
        if (onRowSelectionChange) {
            onRowSelectionChange(updaterOrValue);
        } else {
            if (typeof updaterOrValue === 'function') {
                setInternalRowSelection(prev => updaterOrValue(prev));
            } else {
                setInternalRowSelection(updaterOrValue);
            }
        }
    }, [onRowSelectionChange]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 3000)
        return () => clearTimeout(timer)
    }, [])

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsMobile(window.innerWidth < 640)
            const handleResize = () => setIsMobile(window.innerWidth < 640)
            window.addEventListener('resize', handleResize)
            return () => window.removeEventListener('resize', handleResize)
        }
    }, [])

    // Inject checkbox column if enabled
    const finalColumns = React.useMemo(() => {
        if (!enableRowSelection) return columns
        return [
            {
                id: "select",
                header: ({ table }) => {
                    try {
                        const isAllSelected = table.getIsAllPageRowsSelected()
                        return (
                            <Checkbox
                                checked={isAllSelected}
                                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                                aria-label="Select all"
                                className="ml-2.5 bg-white"
                            />
                        )
                    } catch (error) {
                        // Fallback if table is not ready
                        return (
                            <Checkbox
                                checked={false}
                                onCheckedChange={() => { }}
                                aria-label="Select all"
                                className="ml-2.5 bg-white"
                                disabled
                            />
                        )
                    }
                },
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
        ]
    }, [columns, enableRowSelection])

    // Ensure data is valid before creating table
    const safeData = React.useMemo(() => {
        return Array.isArray(data) ? data : []
    }, [data])

    const table = useReactTable({
        data: safeData,
        columns: finalColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        onRowSelectionChange: handleRowSelectionChange,
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            rowSelection,
            columnVisibility,
            pagination: { pageIndex, pageSize },
        },
        onPaginationChange: (updater) => {
            if (typeof updater === "function") {
                const newState = updater({ pageIndex, pageSize })
                setPageIndex(newState.pageIndex)
                setPageSize(newState.pageSize)
            } else {
                setPageIndex(updater.pageIndex)
                setPageSize(updater.pageSize)
            }
        },
        initialState: {
            pagination: { pageIndex: 0, pageSize: 10 },
        },
        enableRowSelection,
    })

    const TableSkeleton = () => (
        <div className="rounded-2xl overflow-hidden border">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-[#F7F9FB]">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="first:rounded-tl-2xl last:rounded-tr-2xl text-[#707889]">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {Array(10).fill(0).map((_, index) => (
                            <TableRow key={index}>
                                {finalColumns.map((_, cellIndex) => (
                                    <TableCell key={cellIndex} className="pl-[20px]">
                                        <Skeleton className="h-7 w-[80%] rounded-md" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )

    return (
        <div>
            {isLoading || isDataLoading || !Array.isArray(data) ? (
                <TableSkeleton />
            ) : (
                <div className="rounded-2xl overflow-hidden border">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-[#F7F9FB]">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="first:rounded-tl-2xl last:rounded-tr-2xl text-[#707889]">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="pl-[20px]">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={finalColumns.length} className="h-24 text-center">
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
                <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                        <div className="px-2 text-sm font-normal">
                            Total {safeData.length} items
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
                        <Button
                            variant={"outline"}
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="border-none"
                        >
                            <FaArrowLeft className="w-3 h-3" />
                        </Button>

                        <div className="flex items-center">
                            {Array.from({ length: table.getPageCount() }, (_, i) => {
                                if (isMobile) {
                                    if (
                                        i === 0 ||
                                        i === table.getPageCount() - 1 ||
                                        i === table.getState().pagination.pageIndex
                                    ) {
                                        return (
                                            <Button
                                                key={i}
                                                variant={"outline"}
                                                size="sm"
                                                onClick={() => table.setPageIndex(i)}
                                                className={i === table.getState().pagination.pageIndex ? "" : "border-none"}
                                            >
                                                {i + 1}
                                            </Button>
                                        );
                                    }
                                    if (
                                        (i === 1 && table.getState().pagination.pageIndex > 1) ||
                                        (i === table.getPageCount() - 2 &&
                                            table.getState().pagination.pageIndex < table.getPageCount() - 2)
                                    ) {
                                        return <span key={i} className="px-1">...</span>;
                                    }
                                    return null;
                                }

                                if (
                                    i === 0 ||
                                    i === table.getPageCount() - 1 ||
                                    (i >= table.getState().pagination.pageIndex - 1 &&
                                        i <= table.getState().pagination.pageIndex + 1)
                                ) {
                                    return (
                                        <Button
                                            key={i}
                                            variant={"outline"}
                                            size="sm"
                                            onClick={() => table.setPageIndex(i)}
                                            className={i === table.getState().pagination.pageIndex ? "" : "border-none"}
                                        >
                                            {i + 1}
                                        </Button>
                                    );
                                }
                                if (
                                    i === table.getState().pagination.pageIndex - 2 ||
                                    i === table.getState().pagination.pageIndex + 2
                                ) {
                                    return <span key={i} className="px-1">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="border-none"
                        >
                            <FaArrowRight className="w-4 h-4" />
                        </Button>
                        {!hidePageSizeDropdown && (
                            <div className="flex items-center gap-2">
                                <Dropdown
                                    options={[5, 10, 20, 50]}
                                    value={table.getState().pagination.pageSize}
                                    onChange={(value) => {
                                        setPageSize(Number(value))
                                        table.setPageSize(Number(value))
                                        setPageIndex(0)
                                    }}
                                    suffix="per page"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default DataTable  
