"use client";

import * as React from "react";
import { type FormEvent, useState, useTransition } from "react";
import { createDiscount } from "@/app/actions/dashboard";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { DiscountType } from "@/types";
import {
  defaultDatetimeLocalRange,
  fromDatetimeLocalToIso,
} from "@/lib/discount-form-helpers";
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
import { cn } from "@/lib/utils";

type CreateDiscountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateDiscountDialog({
  open,
  onOpenChange,
}: CreateDiscountDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState<DiscountType>("percentage");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    if (!open) return;
    const { start, end } = defaultDatetimeLocalRange();
    setName("");
    setDescription("");
    setValue("");
    setType("percentage");
    setStartLocal(start);
    setEndLocal(end);
    setError(null);
  }, [open]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const parsed = Number(value);
    if (!name.trim()) {
      setError("El nombre es requerido.");
      return;
    }
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("El valor debe ser un numero valido.");
      return;
    }
    if (type === "percentage" && (parsed < 0 || parsed > 100)) {
      setError("El porcentaje debe estar entre 0 y 100.");
      return;
    }
    if (type === "fixed" && parsed <= 0) {
      setError("El monto fijo debe ser mayor a 0.");
      return;
    }
    if (!startLocal || !endLocal) {
      setError("Indica inicio y fin del descuento.");
      return;
    }
    const startIso = fromDatetimeLocalToIso(startLocal);
    const endIso = fromDatetimeLocalToIso(endLocal);
    if (new Date(endIso) < new Date(startIso)) {
      setError("La fecha de fin debe ser posterior o igual al inicio.");
      return;
    }

    startTransition(async () => {
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
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear descuento</DialogTitle>
          <DialogDescription>Define vigencia y tipo de rebaja.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="create-discount-name" className="text-sm font-medium">
                Nombre
              </label>
              <Input
                id="create-discount-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label
                htmlFor="create-discount-description"
                className="text-sm font-medium"
              >
                Descripcion (opcional)
              </label>
              <textarea
                id="create-discount-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={cn(
                  "w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text",
                  "placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                )}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="create-discount-type" className="text-sm font-medium">
                Tipo
              </label>
              <Select value={type} onValueChange={(value) => setType(value as DiscountType)}>
                <SelectTrigger id="create-discount-type" className="w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Porcentaje</SelectItem>
                  <SelectItem value="fixed">Monto fijo (GTQ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label htmlFor="create-discount-value" className="text-sm font-medium">
                Valor
              </label>
              <Input
                id="create-discount-value"
                type="number"
                min="0"
                step={type === "percentage" ? "1" : "0.01"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="create-discount-start" className="text-sm font-medium">
                Inicio
              </label>
              <Input
                id="create-discount-start"
                type="datetime-local"
                value={startLocal}
                onChange={(e) => setStartLocal(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="create-discount-end" className="text-sm font-medium">
                Fin
              </label>
              <Input
                id="create-discount-end"
                type="datetime-local"
                value={endLocal}
                onChange={(e) => setEndLocal(e.target.value)}
                required
              />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando..." : "Crear descuento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateDiscountAction() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Crear descuento
      </Button>
      <CreateDiscountDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
