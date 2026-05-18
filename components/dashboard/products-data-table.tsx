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
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/types";
import { dashboardRoutes } from "@/lib/dashboard-routes";
import { useProducts } from "@/hooks/use-products";
import { useDeleteProduct } from "@/hooks/mutations/use-delete-product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
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

function createColumns(onDelete: (p: Product) => void): ColumnDef<Product>[] {
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
      id: "images",
      accessorFn: (row) => row.images?.[0] ?? "",
      header: () => (
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
          Imagenes
        </div>
      ),
      cell: ({ row }) => {
        const images = row.original.images ?? [];
        const cover = images[0];
        const extra = Math.max(images.length - 1, 0);

        if (!cover) {
          return (
            <div className="size-10 rounded border border-border bg-surface-2 flex items-center justify-center text-muted text-xs">
              —
            </div>
          );
        }

        return (
          <Link
            href={dashboardRoutes.productos.detail(row.original.id)}
            className="group flex items-center gap-1"
            title="Ver detalle"
          >
            <div className="size-10 z-1 overflow-hidden rounded border border-border">
              <Image src={cover} alt={row.original.name} width={40} height={40} className="size-full object-cover" />
            </div>
            {extra > 0 && (
              <div className="size-10 rounded border border-border bg-surface-2 text-xs font-bold text-muted flex items-center justify-end group-hover:border-accent group-hover:text-accent -ml-5 pr-1.5">
                +{extra}
              </div>
            )}
          </Link>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nombre" />
      ),
      cell: ({ row }) => (
        <Link
          href={dashboardRoutes.productos.detail(row.original.id)}
          className="font-medium text-text hover:text-accent"
        >
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      id: "hat_style",
      accessorFn: (row) => row.hat_style?.label ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estilo" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted">{row.getValue("hat_style")}</span>
      ),
    },
    {
      id: "categories",
      accessorFn: (row) => row.categories?.map((c) => c.label).join(", ") ?? "",
      header: () => (
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
          Categorias
        </div>
      ),
      cell: ({ row }) => {
        const cats = row.original.categories ?? [];
        if (cats.length === 0) return <span className="text-muted text-sm">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {cats.map((c) => (
              <span
                key={c.id}
                className="inline-block rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted"
              >
                {c.label}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: "discounts",
      accessorFn: (row) => row.discounts?.map((d) => d.name).join(", ") ?? "",
      header: () => (
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
          Descuentos
        </div>
      ),
      cell: ({ row }) => {
        const discounts = row.original.discounts ?? [];
        if (discounts.length === 0)
          return <span className="text-muted text-sm">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {discounts.map((d) => (
              <span
                key={d.id}
                className="inline-block rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted"
              >
                {d.name}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Precio" />
      ),
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));
        return (
          <span className="font-medium tabular-nums">
            {new Intl.NumberFormat("es-GT", {
              style: "currency",
              currency: "GTQ",
            }).format(price)}
          </span>
        );
      },
    },
    {
      id: "created_at",
      accessorFn: (row) => row.created_at ?? "",
      header: () => (
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
          Fecha de creación
        </div>
      ),
      cell: ({ row }) => {
        const raw = row.original.created_at;
        if (!raw)
          return <span className="text-muted text-sm">—</span>;
        const d = new Date(raw);
        if (Number.isNaN(d.getTime()))
          return <span className="text-muted text-sm">—</span>;
        return (
          <span className="text-sm tabular-nums text-muted">
            {d.toLocaleDateString("es-GT", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
      enableSorting: true,
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon-sm" asChild title="Editar">
            <Link href={dashboardRoutes.productos.editar(row.original.id)}>
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

export function ProductsDataTable() {
  const { data = [], isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [deletingProduct, setDeletingProduct] = React.useState<Product | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const columns = React.useMemo(() => createColumns(setDeletingProduct), []);

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
    if (!deletingProduct) return;
    setError(null);
    deleteProduct.mutate(deletingProduct.id, {
      onSuccess: (result) => {
        if (result.error) setError(result.error);
        setDeletingProduct(null);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted text-sm">
        Cargando productos...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

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
          deleteMutation={deleteProduct}
          getRowId={(row) => row.id}
          resourcePlural="productos"
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
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      <DeleteConfirmDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        title={`¿Eliminar Producto?`}
        description="Se eliminará el producto permanentemente."
        isPending={deleteProduct.isPending}
        onConfirm={handleDelete}
      />

    </div>
  );
}
