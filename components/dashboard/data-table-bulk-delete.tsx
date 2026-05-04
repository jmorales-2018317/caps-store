"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";

type MutationResult = { error?: string };

export type DataTableBulkDeleteProps<TData> = {
  table: Table<TData>;
  deleteMutation: { mutateAsync: (id: string) => Promise<MutationResult> };
  getRowId: (row: TData) => string;
  resourcePlural: string;
  excludeId?: string | null;
  excludeOnlyMessage?: string;
  partialDeleteDescription?: string;
  onError?: (message: string) => void;
  clearError?: () => void;
};

export function DataTableBulkDelete<TData>({
  table,
  deleteMutation,
  getRowId,
  resourcePlural,
  excludeId,
  excludeOnlyMessage = "Nada que eliminar.",
  partialDeleteDescription,
  onError,
  clearError,
}: DataTableBulkDeleteProps<TData>) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const idsToDelete = selectedRows
    .map((r) => getRowId(r.original))
    .filter((id) => id !== excludeId);

  const partialExclude =
    excludeId != null &&
    idsToDelete.length > 0 &&
    idsToDelete.length < selectedCount;

  async function confirm() {
    if (idsToDelete.length === 0) {
      onError?.(excludeOnlyMessage);
      setOpen(false);
      return;
    }
    setPending(true);
    try {
      for (const id of idsToDelete) {
        const result = await deleteMutation.mutateAsync(id);
        if (result.error) {
          onError?.(result.error);
          return;
        }
      }
      table.resetRowSelection();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  if (selectedCount === 0) return null;

  const title =
    partialExclude
      ? `¿Eliminar ${idsToDelete.length} de ${selectedCount} seleccionados?`
      : `¿Eliminar ${idsToDelete.length} ${resourcePlural}?`;

  const description = partialExclude
    ? (partialDeleteDescription ??
      `Se eliminarán permanentemente ${idsToDelete.length} ${resourcePlural}. Los demás seleccionados no se eliminarán.`)
    : `Se eliminarán permanentemente ${idsToDelete.length} ${resourcePlural}.`;

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="h-8 gap-1.5"
        onClick={() => {
          clearError?.();
          const ids = selectedRows
            .map((r) => getRowId(r.original))
            .filter((id) => id !== excludeId);
          if (ids.length === 0) {
            onError?.(excludeOnlyMessage);
            return;
          }
          setOpen(true);
        }}
      >
        <Trash2 className="size-4" />
        Eliminar ({selectedCount})
      </Button>

      <DeleteConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel={`Eliminar (${idsToDelete.length})`}
        isPending={pending}
        onConfirm={confirm}
      />
    </>
  );
}
