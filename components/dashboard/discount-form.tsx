"use client";

import * as React from "react";
import { type FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDiscount, updateDiscount } from "@/app/actions/dashboard";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { dashboardRoutes } from "@/lib/dashboard-routes";
import type { Discount, DiscountType } from "@/types";
import {
  defaultDatetimeLocalRange,
  fromDatetimeLocalToIso,
  toDatetimeLocalValue,
} from "@/lib/discount-form-helpers";
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
  FormField,
  FormSection,
  FormTextarea,
} from "@/components/dashboard/form-layout";

type DiscountFormProps = {
  mode: "create" | "edit";
  discount?: Discount;
};

function validateDiscountFields(
  name: string,
  value: string,
  type: DiscountType,
  startLocal: string,
  endLocal: string
): string | null {
  const parsed = Number(value);
  if (!name.trim()) return "El nombre es requerido.";
  if (!Number.isFinite(parsed) || parsed < 0) return "El valor debe ser un numero valido.";
  if (type === "percentage" && (parsed < 0 || parsed > 100)) {
    return "El porcentaje debe estar entre 0 y 100.";
  }
  if (type === "fixed" && parsed <= 0) return "El monto fijo debe ser mayor a 0.";
  if (!startLocal || !endLocal) return "Indica inicio y fin del descuento.";
  const startIso = fromDatetimeLocalToIso(startLocal);
  const endIso = fromDatetimeLocalToIso(endLocal);
  if (new Date(endIso) < new Date(startIso)) {
    return "La fecha de fin debe ser posterior o igual al inicio.";
  }
  return null;
}

export function DiscountForm({ mode, discount }: DiscountFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const defaultRange = defaultDatetimeLocalRange();

  const [name, setName] = useState(discount?.name ?? "");
  const [description, setDescription] = useState(discount?.description ?? "");
  const [value, setValue] = useState(discount ? String(discount.value) : "");
  const [type, setType] = useState<DiscountType>(discount?.type ?? "percentage");
  const [startLocal, setStartLocal] = useState(
    discount ? toDatetimeLocalValue(discount.start_date) : defaultRange.start
  );
  const [endLocal, setEndLocal] = useState(
    discount ? toDatetimeLocalValue(discount.end_date) : defaultRange.end
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (mode !== "create") return;
    const { start, end } = defaultDatetimeLocalRange();
    setStartLocal(start);
    setEndLocal(end);
  }, [mode]);

  useEffect(() => {
    if (!discount || mode !== "edit") return;
    setName(discount.name);
    setDescription(discount.description ?? "");
    setValue(String(discount.value));
    setType(discount.type);
    setStartLocal(toDatetimeLocalValue(discount.start_date));
    setEndLocal(toDatetimeLocalValue(discount.end_date));
    setError(null);
  }, [discount, mode]);

  const cancelHref =
    mode === "edit" && discount
      ? dashboardRoutes.descuentos.detail(discount.id)
      : dashboardRoutes.descuentos.list();

  const idPrefix = mode === "edit" && discount ? discount.id : "create";

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const validationError = validateDiscountFields(name, value, type, startLocal, endLocal);
    if (validationError) {
      setError(validationError);
      return;
    }

    const parsed = Number(value);
    const startIso = fromDatetimeLocalToIso(startLocal);
    const endIso = fromDatetimeLocalToIso(endLocal);

    startTransition(async () => {
      if (mode === "create") {
        const result = await createDiscount({
          name: name.trim(),
          description: description.trim() || null,
          value: parsed,
          type,
          start_date: startIso,
          end_date: endIso,
        });

        if (result.error) {
          setError(result.error);
          return;
        }

        await queryClient.invalidateQueries({ queryKey: queryKeys.discounts.all() });
        router.push(dashboardRoutes.descuentos.list());
        return;
      }

      if (!discount) return;

      const result = await updateDiscount({
        id: discount.id,
        name: name.trim(),
        description: description.trim() || null,
        value: parsed,
        type,
        start_date: startIso,
        end_date: endIso,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.discounts.all() });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.discounts.detail(discount.id),
      });
      router.push(dashboardRoutes.descuentos.detail(discount.id));
    });
  }

  return (
    <DashboardForm onSubmit={handleSubmit} className="space-y-4">
      <FormActions
        cancelHref={cancelHref}
        submitLabel={mode === "create" ? "Crear descuento" : "Guardar descuento"}
        pendingLabel={mode === "create" ? "Creando..." : "Guardando..."}
        isPending={isPending}
        error={error}
      />
      <div className="grid gap-6 sm:grid-cols-3">
        <FormSection title="Informacion general" description="Nombre visible del descuento en el panel.">
          <FormField label="Nombre" htmlFor={`discount-name-${idPrefix}`} required size="lg">
            <Input
              id={`discount-name-${idPrefix}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Verano 2026"
              required
            />
          </FormField>

          <FormField label="Descripcion" htmlFor={`discount-description-${idPrefix}`} size="lg">
            <FormTextarea
              id={`discount-description-${idPrefix}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </FormField>
        </FormSection>

        <FormSection title="Valor del descuento" description="Tipo de rebaja y monto aplicado.">
          <FormField label="Tipo" htmlFor={`discount-type-${idPrefix}`} required size="full">
            <Select value={type} onValueChange={(v) => setType(v as DiscountType)}>
              <SelectTrigger id={`discount-type-${idPrefix}`} className="w-full">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                <SelectItem value="fixed">Monto fijo (GTQ)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label={type === "percentage" ? "Porcentaje" : "Monto (GTQ)"}
            htmlFor={`discount-value-${idPrefix}`}
            required
            size="full"
          >
            <Input
              id={`discount-value-${idPrefix}`}
              type="number"
              min="0"
              max={type === "percentage" ? "100" : undefined}
              step={type === "percentage" ? "1" : "0.01"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </FormField>
        </FormSection>

        <FormSection title="Vigencia" description="Periodo en el que el descuento estara activo.">
          <FormField label="Inicio" htmlFor={`discount-start-${idPrefix}`} required size="full">
            <Input
              id={`discount-start-${idPrefix}`}
              type="datetime-local"
              value={startLocal}
              onChange={(e) => setStartLocal(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Fin" htmlFor={`discount-end-${idPrefix}`} required size="full">
            <Input
              id={`discount-end-${idPrefix}`}
              type="datetime-local"
              value={endLocal}
              onChange={(e) => setEndLocal(e.target.value)}
              required
            />
          </FormField>
        </FormSection>
      </div>
    </DashboardForm>
  );
}
