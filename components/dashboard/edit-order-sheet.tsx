"use client";

import { type FormEvent, useState, useTransition } from "react";
import { updateOrder } from "@/app/actions/dashboard";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EditOrderSheetProps = {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditOrderDialog({ order, open, onOpenChange }: EditOrderSheetProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Order["status"]>(order.status);
  const [contactName, setContactName] = useState(order.contact_name);
  const [address, setAddress] = useState(order.address ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateOrder({
        id: order.id,
        status,
        contact_name: contactName.trim(),
        address: address.trim() || null,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar orden</DialogTitle>
          <DialogDescription>Ajusta estado y datos de envio.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1">
            <label htmlFor={`order-status-${order.id}`} className="text-sm font-medium">
              Estado
            </label>
            <Select value={status} onValueChange={(value) => setStatus(value as Order["status"])}>
              <SelectTrigger id={`order-status-${order.id}`} className="w-full">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">pending</SelectItem>
                <SelectItem value="confirmed">confirmed</SelectItem>
                <SelectItem value="shipped">shipped</SelectItem>
                <SelectItem value="delivered">delivered</SelectItem>
                <SelectItem value="cancelled">cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor={`order-contact-${order.id}`} className="text-sm font-medium">
              Contacto
            </label>
            <Input
              id={`order-contact-${order.id}`}
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor={`order-address-${order.id}`} className="text-sm font-medium">
              Direccion
            </label>
            <Input
              id={`order-address-${order.id}`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
