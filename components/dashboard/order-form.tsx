"use client";

import { type FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrder } from "@/app/actions/dashboard";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { dashboardRoutes } from "@/lib/dashboard-routes";
import type { Order } from "@/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DashboardForm,
  FormActions,
  FormBody,
  FormField,
  FormSection,
} from "@/components/dashboard/form-layout";

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pendiente",
  shipped: "Enviada",
  delivered: "Entregada",
  cancelled: "Cancelada",
};

type OrderFormProps = {
  order: Order;
};

export function OrderForm({ order }: OrderFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Order["status"]>(order.status);
  const [contactName, setContactName] = useState(order.contact_name);
  const [address, setAddress] = useState(order.address ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setStatus(order.status);
    setContactName(order.contact_name);
    setAddress(order.address ?? "");
    setError(null);
  }, [order]);

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
      await queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(order.id),
      });
      router.push(dashboardRoutes.ordenes.detail(order.id));
    });
  }

  return (
    <DashboardForm onSubmit={handleSubmit} className="space-y-4">
      <FormActions
        cancelHref={dashboardRoutes.ordenes.detail(order.id)}
        submitLabel="Guardar cambios"
        pendingLabel="Guardando..."
        isPending={isPending}
        error={error}
      />

      <FormBody className="max-w-none">
        <FormSection
          title="Estado y envio"
          description="Actualiza el seguimiento y los datos de contacto del pedido."
        >
          <FormField label="Estado" htmlFor={`order-status-${order.id}`} required size="md">
            <Select value={status} onValueChange={(value) => setStatus(value as Order["status"])}>
              <SelectTrigger id={`order-status-${order.id}`} className="w-full">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABELS) as Order["status"][]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {STATUS_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Nombre de contacto"
            htmlFor={`order-contact-${order.id}`}
            required
            size="md"
          >
            <Input
              id={`order-contact-${order.id}`}
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
            />
          </FormField>

          <FormField
            label="Direccion de envio"
            htmlFor={`order-address-${order.id}`}
            hint="Opcional si el metodo de envio no requiere direccion."
            size="lg"
          >
            <Input
              id={`order-address-${order.id}`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle, numero, zona..."
            />
          </FormField>
        </FormSection>
      </FormBody>
    </DashboardForm>
  );
}
