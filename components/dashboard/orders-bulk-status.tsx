"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { ArrowRightLeft } from "lucide-react";
import type { Order } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ORDER_STATUS_FILTER_OPTIONS,
  OrderStatusBadge,
  type OrderStatus,
} from "@/components/orders/order-status-badge";
import { useUpdateOrdersStatus } from "@/hooks/mutations/use-update-orders-status";

type OrdersBulkStatusProps = {
  table: Table<Order>;
  onError?: (message: string) => void;
  clearError?: () => void;
};

export function OrdersBulkStatus({ table, onError, clearError }: OrdersBulkStatusProps) {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<OrderStatus>("shipped");
  const updateStatus = useUpdateOrdersStatus();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const ids = selectedRows.map((r) => r.original.id);

  if (selectedCount === 0) return null;

  function handleOpen() {
    clearError?.();
    setOpen(true);
  }

  function handleConfirm() {
    updateStatus.mutate(
      { ids, status },
      {
        onSuccess: (result) => {
          if (result.error) {
            onError?.(result.error);
            return;
          }
          table.resetRowSelection();
          setOpen(false);
        },
        onError: () => {
          onError?.("No se pudo actualizar el estado.");
        },
      }
    );
  }

  const statusLabel =
    ORDER_STATUS_FILTER_OPTIONS.find((o) => o.value === status)?.label ?? status;

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-8 gap-1.5"
        onClick={handleOpen}
      >
        <ArrowRightLeft className="size-4" />
        Cambiar estado ({selectedCount})
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Cambiar estado de {selectedCount}{" "}
              {selectedCount === 1 ? "orden" : "ordenes"}
            </DialogTitle>
            <DialogDescription>
              Todas las ordenes seleccionadas pasaran al mismo estado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm font-medium text-text">Nuevo estado</p>
            <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-muted">Vista previa:</span>
              <OrderStatusBadge status={status} />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateStatus.isPending}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={updateStatus.isPending}>
              {updateStatus.isPending
                ? "Actualizando..."
                : `Aplicar “${statusLabel}”`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
