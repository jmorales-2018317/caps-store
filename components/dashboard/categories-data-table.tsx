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
import type { Category } from "@/types";
import { useCategories } from "@/hooks/use-categories";
import { useDeleteCategory } from "@/hooks/mutations/use-delete-category";
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
import { EditCategoryDialog } from "./edit-category-sheet";
import Image from "next/image";

function createColumns(
  onEdit: (c: Category) => void,
  onDelete: (c: Category) => void
): ColumnDef<Category>[] {
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
            <Image
              src={src}
              alt={row.original.label}
              width={40}
              height={40}
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
      cell: ({ row }) => {
        const desc = row.getValue<string | undefined>("description");
        return (
          <span className="max-w-xs truncate text-sm text-muted">
            {desc ?? "—"}
          </span>
        );
      },
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

export function CategoriesDataTable() {
  const { data = [], isLoading } = useCategories();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const deleteCategory = useDeleteCategory();

  const [editingCategory, setEditingCategory] =
    React.useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] =
    React.useState<Category | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const columns = React.useMemo(
    () => createColumns(setEditingCategory, setDeletingCategory),
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

  function handleDelete() {
    if (!deletingCategory) return;
    setError(null);
    deleteCategory.mutate(deletingCategory.id, {
      onSuccess: (result) => {
        if (result.error) setError(result.error);
        setDeletingCategory(null);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted text-sm">
        Cargando categorias...
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
          deleteMutation={deleteCategory}
          getRowId={(row) => row.id}
          resourcePlural="categorías"
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

      {editingCategory && (
        <EditCategoryDialog
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
          category={editingCategory}
        />
      )}

      <DeleteConfirmDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        title={`¿Eliminar "${deletingCategory?.label}"?`}
        description="Se eliminará la categoría permanentemente."
        isPending={deleteCategory.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
