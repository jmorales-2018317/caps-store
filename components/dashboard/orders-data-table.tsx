"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import type { Order } from "@/types";
import { useOrders } from "@/hooks/use-orders";
import { useDeleteOrder } from "@/hooks/mutations/use-delete-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableBulkDelete } from "./data-table-bulk-delete";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { EditOrderDialog } from "./edit-order-sheet";
import {
  OrderStatusBadge,
  ORDER_STATUS_FILTER_OPTIONS,
  type OrderStatus,
} from "@/components/orders/order-status-badge";

function createColumns(
  onEdit: (o: Order) => void,
  onDelete: (o: Order) => void
): ColumnDef<Order>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Seleccionar todo"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: () => (
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
          ID
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted">
          #{(row.getValue<string>("id") ?? "").slice(-8).toUpperCase()}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "contact_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cliente" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-text">
          {row.getValue("contact_name")}
        </span>
      ),
    },
    {
      accessorKey: "contact_email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted">{row.getValue("contact_email")}</span>
      ),
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">
          {new Intl.NumberFormat("es-GT", {
            style: "currency",
            currency: "GTQ",
          }).format(parseFloat(row.getValue("total")))}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estado" />
      ),
      cell: ({ row }) => (
        <OrderStatusBadge status={row.getValue<OrderStatus>("status")} />
      ),
      filterFn: (row, _id, value) =>
        value === "" || row.original.status === value,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fecha" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return (
          <span className="text-sm text-muted tabular-nums">
            {date.toLocaleDateString("es-GT", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(row.original)}
            title="Editar"
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(row.original)}
            title="Eliminar"
          >
            <Trash2 />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

export function OrdersDataTable() {
  const { data = [], isLoading } = useOrders();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [statusFilter, setStatusFilter] = React.useState<string>("");

  const deleteOrder = useDeleteOrder();

  const [editingOrder, setEditingOrder] = React.useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = React.useState<Order | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const columns = React.useMemo(
    () => createColumns(setEditingOrder, setDeletingOrder),
    []
  );

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    initialState: { pagination: { pageSize: 10 } },
  });

  function applyStatusFilter(value: string) {
    setStatusFilter(value);
    table.getColumn("status")?.setFilterValue(value);
  }

  function handleDelete() {
    if (!deletingOrder) return;
    setError(null);
    deleteOrder.mutate(deletingOrder.id, {
      onSuccess: (result) => {
        if (result.error) setError(result.error);
        setDeletingOrder(null);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted text-sm">
        Cargando ordenes...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por cliente..."
          value={
            (table
              .getColumn("contact_name")
              ?.getFilterValue() as string) ?? ""
          }
          onChange={(e) =>
            table
              .getColumn("contact_name")
              ?.setFilterValue(e.target.value)
          }
          className="h-8 max-w-xs text-sm"
        />

        <select
          value={statusFilter}
          onChange={(e) => applyStatusFilter(e.target.value)}
          className="h-8 rounded border border-border bg-surface px-2 text-sm text-text focus:outline-none focus:border-accent"
        >
          <option value="">Todos los estados</option>
          {ORDER_STATUS_FILTER_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <DataTableViewOptions table={table} />

        <DataTableBulkDelete
          table={table}
          deleteMutation={deleteOrder}
          getRowId={(row) => row.id}
          resourcePlural="órdenes"
          onError={(msg) => setError(msg)}
          clearError={() => setError(null)}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center text-muted"
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      {editingOrder && (
        <EditOrderDialog
          open={!!editingOrder}
          onOpenChange={(open) => !open && setEditingOrder(null)}
          order={editingOrder}
        />
      )}

      <DeleteConfirmDialog
        open={!!deletingOrder}
        onOpenChange={(open) => !open && setDeletingOrder(null)}
        title="¿Eliminar esta orden?"
        description={`Se eliminará la orden #${(deletingOrder?.id ?? "").slice(-8).toUpperCase()} de ${deletingOrder?.contact_name ?? ""} permanentemente.`}
        isPending={deleteOrder.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
