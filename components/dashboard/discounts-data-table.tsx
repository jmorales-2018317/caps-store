"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import type { Discount } from "@/types";
import { dashboardRoutes } from "@/lib/dashboard-routes";
import { useDiscounts } from "@/hooks/use-discounts";
import { useDeleteDiscount } from "@/hooks/mutations/use-delete-discount";
import { formatPrice } from "@/lib/utils";
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

function formatValueCell(d: Discount): string {
  if (d.type === "percentage") {
    return `${d.value}%`;
  }
  return formatPrice(d.value);
}

function typeLabel(t: Discount["type"]): string {
  return t === "percentage" ? "Porcentaje" : "Fijo (GTQ)";
}

function createColumns(onDelete: (d: Discount) => void): ColumnDef<Discount>[] {
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
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nombre" />
      ),
      cell: ({ row }) => (
        <Link
          href={dashboardRoutes.descuentos.detail(row.original.id)}
          className="font-medium text-text hover:text-accent"
        >
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tipo" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted">{typeLabel(row.original.type)}</span>
      ),
    },
    {
      id: "value",
      accessorFn: (row) => formatValueCell(row),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Valor" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{formatValueCell(row.original)}</span>
      ),
    },
    {
      id: "created_at",
      accessorFn: (row) => row.start_date ?? "",
      header: () => (
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
          Creado
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-muted">{new Date(row.original.start_date).toLocaleDateString("es-GT", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}</span>
      ),
      enableSorting: true,
    },
    {
      id: "end_date",
      accessorFn: (row) => row.end_date ?? "",
      header: () => (
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
          Vence
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-muted">{new Date(row.original.end_date).toLocaleDateString("es-GT", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}</span>
      ),
      enableSorting: true,
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon-sm" asChild title="Editar">
            <Link href={dashboardRoutes.descuentos.editar(row.original.id)}>
              <Pencil />
            </Link>
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

export function DiscountsDataTable() {
  const { data = [], isLoading } = useDiscounts();
  const deleteDiscount = useDeleteDiscount();

  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [deleting, setDeleting] = React.useState<Discount | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const columns = React.useMemo(
    () => createColumns(setDeleting),
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
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { columnFilters, columnVisibility, rowSelection },
    initialState: { pagination: { pageSize: 10 } },
  });

  function handleDelete() {
    if (!deleting) return;
    setError(null);
    deleteDiscount.mutate(deleting.id, {
      onSuccess: (result) => {
        if (result.error) setError(result.error);
        setDeleting(null);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted text-sm">
        Cargando descuentos...
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
          placeholder="Buscar por nombre..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
          className="h-8 max-w-sm text-sm"
        />
        <DataTableViewOptions table={table} />
        <DataTableBulkDelete
          table={table}
          deleteMutation={deleteDiscount}
          getRowId={(row) => row.id}
          resourcePlural="descuentos"
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

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`¿Eliminar Descuento?`}
        description="Se eliminará el descuento y su vínculo con productos."
        isPending={deleteDiscount.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
