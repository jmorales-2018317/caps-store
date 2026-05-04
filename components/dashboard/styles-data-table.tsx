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
import type { HatStyle } from "@/types";
import { useStyles } from "@/hooks/use-styles";
import { useDeleteStyle } from "@/hooks/mutations/use-delete-style";
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
import { EditStyleDialog } from "./edit-style-sheet";

function createColumns(
  onEdit: (s: HatStyle) => void,
  onDelete: (s: HatStyle) => void
): ColumnDef<HatStyle>[] {
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
      id: "image",
      accessorFn: (row) => row.image ?? "",
      header: () => (
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
          Imagen
        </div>
      ),
      cell: ({ row }) => {
        const src = row.original.image;
        return src ? (
          <div className="size-10 overflow-hidden rounded border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={row.original.label}
              className="size-full object-cover"
            />
          </div>
        ) : (
          <div className="size-10 rounded border border-border bg-surface-2 flex items-center justify-center text-muted text-xs">
            —
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "label",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nombre" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-text">{row.getValue("label")}</span>
      ),
    },
    {
      accessorKey: "description",
      header: () => (
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
          Descripcion
        </div>
      ),
      cell: ({ row }) => (
        <span className="max-w-xs truncate text-sm text-muted">
          {row.getValue<string | undefined>("description") ?? "—"}
        </span>
      ),
      enableSorting: false,
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

export function StylesDataTable() {
  const { data = [], isLoading } = useStyles();
  const deleteStyle = useDeleteStyle();

  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [editingStyle, setEditingStyle] = React.useState<HatStyle | null>(null);
  const [deletingStyle, setDeletingStyle] = React.useState<HatStyle | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const columns = React.useMemo(
    () => createColumns(setEditingStyle, setDeletingStyle),
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
    if (!deletingStyle) return;
    setError(null);
    deleteStyle.mutate(deletingStyle.id, {
      onSuccess: (result) => {
        if (result.error) setError(result.error);
        setDeletingStyle(null);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted text-sm">
        Cargando estilos...
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
          value={
            (table.getColumn("label")?.getFilterValue() as string) ?? ""
          }
          onChange={(e) =>
            table.getColumn("label")?.setFilterValue(e.target.value)
          }
          className="h-8 max-w-sm text-sm"
        />
        <DataTableViewOptions table={table} />
        <DataTableBulkDelete
          table={table}
          deleteMutation={deleteStyle}
          getRowId={(row) => row.id}
          resourcePlural="estilos"
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

      {editingStyle && (
        <EditStyleDialog
          open={!!editingStyle}
          onOpenChange={(open) => !open && setEditingStyle(null)}
          style={editingStyle}
        />
      )}

      <DeleteConfirmDialog
        open={!!deletingStyle}
        onOpenChange={(open) => !open && setDeletingStyle(null)}
        title={`¿Eliminar "${deletingStyle?.label}"?`}
        description="Se eliminará el estilo permanentemente."
        isPending={deleteStyle.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
