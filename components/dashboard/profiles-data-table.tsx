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
import { Pencil, Trash2, UserCircle2 } from "lucide-react";
import type { Profile } from "@/types";
import { useProfiles } from "@/hooks/use-profiles";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useDeleteProfile } from "@/hooks/mutations/use-delete-profile";
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
import { EditProfileDialog } from "./edit-profile-sheet";

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  admin: {
    label: "Admin",
    className: "bg-accent/15 text-accent border-accent/30",
  },
  user: {
    label: "Usuario",
    className: "bg-surface-2 text-muted border-border",
  },
};

function createColumns(
  onEdit: (p: Profile) => void,
  onDelete: (p: Profile) => void
): ColumnDef<Profile>[] {
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
      id: "avatar_url",
      accessorFn: (row) => row.avatar_url ?? "",
      header: () => (
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
          Avatar
        </div>
      ),
      cell: ({ row }) => {
        const src = row.original.avatar_url;
        return src ? (
          <div className="size-9 overflow-hidden rounded-full border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={row.original.full_name ?? "Avatar"}
              className="size-full object-cover"
            />
          </div>
        ) : (
          <div className="size-9 rounded-full border border-border bg-surface-2 flex items-center justify-center">
            <UserCircle2 className="size-5 text-muted/50" />
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "full_name",
      accessorFn: (row) => row.full_name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nombre" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-text">
          {row.getValue<string>("full_name") || (
            <span className="text-muted italic">Sin nombre</span>
          )}
        </span>
      ),
    },
    {
      id: "email",
      accessorFn: (row) => row.email ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted">
          {row.getValue<string>("email") || "—"}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rol" />
      ),
      cell: ({ row }) => {
        const role = row.getValue<string>("role");
        const cfg = ROLE_CONFIG[role] ?? {
          label: role,
          className: "bg-surface-2 text-muted border-border",
        };
        return (
          <span
            className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cfg.className}`}
          >
            {cfg.label}
          </span>
        );
      },
      filterFn: (row, _id, value) =>
        value === "" || row.original.role === value,
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

export function ProfilesDataTable() {
  const { data = [], isLoading } = useProfiles();
  const { data: currentUser } = useCurrentUser();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [roleFilter, setRoleFilter] = React.useState<string>("");

  const deleteProfile = useDeleteProfile();

  const [editingProfile, setEditingProfile] = React.useState<Profile | null>(null);
  const [deletingProfile, setDeletingProfile] = React.useState<Profile | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const columns = React.useMemo(
    () => createColumns(setEditingProfile, setDeletingProfile),
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

  function applyRoleFilter(value: string) {
    setRoleFilter(value);
    table.getColumn("role")?.setFilterValue(value);
  }

  function handleDelete() {
    if (!deletingProfile) return;
    setError(null);
    deleteProfile.mutate(deletingProfile.id, {
      onSuccess: (result) => {
        if (result.error) setError(result.error);
        setDeletingProfile(null);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted text-sm">
        Cargando perfiles...
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
            (table.getColumn("full_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(e) =>
            table.getColumn("full_name")?.setFilterValue(e.target.value)
          }
          className="h-8 max-w-xs text-sm"
        />

        <select
          value={roleFilter}
          onChange={(e) => applyRoleFilter(e.target.value)}
          className="h-8 rounded border border-border bg-surface px-2 text-sm text-text focus:outline-none focus:border-accent"
        >
          <option value="">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="user">Usuario</option>
        </select>

        <DataTableBulkDelete
          table={table}
          deleteMutation={deleteProfile}
          getRowId={(row) => row.id}
          resourcePlural="perfiles"
          excludeId={currentUser?.id}
          excludeOnlyMessage="No puedes eliminar tu propio perfil."
          partialDeleteDescription="Tu propio perfil no puede eliminarse; se eliminarán los demás perfiles seleccionados."
          onError={(msg) => setError(msg)}
          clearError={() => setError(null)}
        />

        <DataTableViewOptions table={table} />
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

      {editingProfile && (
        <EditProfileDialog
          open={!!editingProfile}
          onOpenChange={(open) => !open && setEditingProfile(null)}
          profile={{
            id: editingProfile.id,
            full_name: editingProfile.full_name,
            avatar_url: editingProfile.avatar_url,
            role: editingProfile.role,
          }}
        />
      )}

      <DeleteConfirmDialog
        open={!!deletingProfile}
        onOpenChange={(open) => !open && setDeletingProfile(null)}
        title="¿Eliminar este perfil?"
        description={`Se eliminará el perfil de "${deletingProfile?.full_name ?? deletingProfile?.email ?? "este usuario"}" permanentemente.`}
        isPending={deleteProfile.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
