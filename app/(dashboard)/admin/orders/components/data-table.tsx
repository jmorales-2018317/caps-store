"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Search,
} from "lucide-react"

import { DataTableColumnHeader } from "@/app/(dashboard)/tasks/components/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface Order {
  id: number
  orderId: string
  orderDate: string
  customerName: string
  customerAddress: string
  status: string
  itemCount: number
  total: number
  paymentMethod: string
}

interface DataTableProps {
  orders: Order[]
}

const exactFilter = (row: Row<Order>, columnId: string, value: string) => {
  return row.getValue(columnId) === value
}

function getStatusStyles(status: string) {
  switch (status) {
    case "Delivered":
      return "border-transparent bg-emerald-50 text-emerald-800 hover:bg-emerald-50/90 dark:bg-emerald-950/40 dark:text-emerald-300"
    case "Shipped":
      return "border-transparent bg-sky-50 text-sky-800 hover:bg-sky-50/90 dark:bg-sky-950/40 dark:text-sky-300"
    case "Processing":
      return "border-transparent bg-amber-50 text-amber-900 hover:bg-amber-50/90 dark:bg-amber-950/40 dark:text-amber-200"
    case "Cancelled":
      return "border-transparent bg-red-50 text-red-800 hover:bg-red-50/90 dark:bg-red-950/40 dark:text-red-300"
    default:
      return "border-transparent bg-muted text-muted-foreground"
  }
}

function ordersGlobalFilterFn(
  row: Row<Order>,
  _columnId: string,
  filterValue: string
) {
  const q = String(filterValue).toLowerCase().trim()
  if (!q) return true
  const o = row.original
  return (
    o.orderId.toLowerCase().includes(q) ||
    o.customerName.toLowerCase().includes(q) ||
    o.customerAddress.toLowerCase().includes(q)
  )
}

export function DataTable({ orders }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "orderDate", desc: true },
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()

  const filteredByDate = React.useMemo(() => {
    if (!dateRange?.from) return orders
    const from = startOfDay(dateRange.from)
    const to = dateRange.to
      ? endOfDay(dateRange.to)
      : endOfDay(dateRange.from)
    return orders.filter((o) => {
      const d = startOfDay(new Date(o.orderDate))
      return isWithinInterval(d, { start: from, end: to })
    })
  }, [orders, dateRange])

  const columns = React.useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "orderId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Order ID" />
        ),
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums text-foreground">
            {row.getValue("orderId")}
          </span>
        ),
      },
      {
        accessorKey: "orderDate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date" />
        ),
        sortingFn: "datetime",
        cell: ({ row }) => {
          const raw = row.getValue("orderDate") as string
          return (
            <span className="text-muted-foreground">
              {format(new Date(raw), "MMM d, yyyy")}
            </span>
          )
        },
      },
      {
        id: "customer",
        accessorFn: (row) => row.customerName,
        header: "Customer",
        enableSorting: false,
        cell: ({ row }) => {
          const o = row.original
          return (
            <div className="flex min-w-0 max-w-[220px] flex-col gap-0.5 sm:max-w-[280px]">
              <span className="truncate font-medium text-foreground">
                {o.customerName}
              </span>
              <span
                className="truncate text-xs text-muted-foreground"
                title={o.customerAddress}
              >
                {o.customerAddress}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string
          return (
            <Badge
              variant="secondary"
              className={cn(
                "rounded-full px-2.5 py-0.5 font-medium transition-colors duration-200 motion-reduce:transition-none",
                getStatusStyles(status)
              )}
            >
              {status}
            </Badge>
          )
        },
        filterFn: exactFilter,
      },
      {
        accessorKey: "itemCount",
        header: "Items",
        cell: ({ row }) => {
          const n = row.getValue("itemCount") as number
          return (
            <span className="text-muted-foreground">
              {n} {n === 1 ? "item" : "items"}
            </span>
          )
        },
      },
      {
        accessorKey: "total",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total" />
        ),
        cell: ({ row }) => {
          const total = row.getValue("total") as number
          return (
            <span className="font-semibold tabular-nums">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(total)}
            </span>
          )
        },
      },
      {
        accessorKey: "paymentMethod",
        header: "Payment",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.getValue("paymentMethod")}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        cell: () => (
          <div className="flex items-center justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-foreground motion-reduce:transition-none"
            >
              <Eye className="size-4" />
              <span className="sr-only">View order</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-foreground motion-reduce:transition-none"
            >
              <Download className="size-4" />
              <span className="sr-only">Download invoice</span>
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredByDate,
    columns,
    globalFilterFn: ordersGlobalFilterFn,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: { pageSize: 5 },
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  })

  const statusFilter = table.getColumn("status")?.getFilterValue() as
    | string
    | undefined

  const handleExport = () => {
    const rows = table.getFilteredRowModel().rows.map((r) => r.original)
    const header = [
      "orderId",
      "orderDate",
      "customerName",
      "customerAddress",
      "status",
      "itemCount",
      "total",
      "paymentMethod",
    ]
    const lines = [
      header.join(","),
      ...rows.map((o) =>
        header
          .map((key) => {
            const v = o[key as keyof Order]
            const s = String(v)
            return s.includes(",") ? `"${s.replace(/"/g, '""')}"` : s
          })
          .join(",")
      ),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orders-export-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const filteredCount = table.getFilteredRowModel().rows.length
  const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, filteredCount)
  const pageCount = table.getPageCount()

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Order Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            View and manage customer orders
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 cursor-pointer border-border px-3 transition-colors duration-200 motion-reduce:transition-none"
            onClick={handleExport}
          >
            <Download className="mr-2 size-4" />
            Export
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 cursor-pointer border-border px-3 transition-colors duration-200 motion-reduce:transition-none"
              >
                <CalendarDays className="mr-2 size-4" />
                Date range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Filter orders by date
                </p>
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                />
                <div className="mt-2 flex justify-end border-t border-border pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setDateRange(undefined)}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="relative min-w-0 flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or customer..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-10 border-border bg-background pl-9 transition-colors duration-200 motion-reduce:transition-none"
            aria-label="Search orders"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <div className="flex min-w-[140px] flex-1 items-center gap-2 sm:flex-initial sm:min-w-[160px]">
            <Filter className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <Select
              value={statusFilter ? statusFilter : "all"}
              onValueChange={(value) =>
                table
                  .getColumn("status")
                  ?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger
                className="h-10 w-full cursor-pointer border-border bg-background transition-colors duration-200 motion-reduce:transition-none"
                aria-label="Filter by status"
              >
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  All Status
                </SelectItem>
                <SelectItem value="Delivered" className="cursor-pointer">
                  Delivered
                </SelectItem>
                <SelectItem value="Shipped" className="cursor-pointer">
                  Shipped
                </SelectItem>
                <SelectItem value="Processing" className="cursor-pointer">
                  Processing
                </SelectItem>
                <SelectItem value="Cancelled" className="cursor-pointer">
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-border hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-12 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border transition-colors duration-200 motion-reduce:transition-none hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No orders match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{from}</span> to{" "}
          <span className="font-medium text-foreground">{to}</span> of{" "}
          <span className="font-medium text-foreground">{filteredCount}</span>{" "}
          orders
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 cursor-pointer border-border transition-colors duration-200 motion-reduce:transition-none"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: pageCount }, (_, i) => (
              <Button
                key={i}
                type="button"
                variant={pageIndex === i ? "default" : "outline"}
                size="icon"
                className={cn(
                  "h-9 w-9 cursor-pointer border-border transition-colors duration-200 motion-reduce:transition-none",
                  pageIndex === i && "pointer-events-none"
                )}
                onClick={() => table.setPageIndex(i)}
                aria-label={`Page ${i + 1}`}
                aria-current={pageIndex === i ? "page" : undefined}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 cursor-pointer border-border transition-colors duration-200 motion-reduce:transition-none"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
