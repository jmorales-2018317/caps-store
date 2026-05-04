"use client";

import { type FormEvent, useEffect, useState, useTransition } from "react";
import { updateStyle } from "@/app/actions/dashboard";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { HatStyle } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageDropzone } from "@/components/dashboard/image-dropzone";

type EditStyleSheetProps = {
  style: HatStyle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditStyleDialog({ style, open, onOpenChange }: EditStyleSheetProps) {
  const queryClient = useQueryClient();
  const [label, setLabel] = useState(style.label);
  const [description, setDescription] = useState(style.description ?? "");
  const [image, setImage] = useState(style.image ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLabel(style.label);
    setDescription(style.description ?? "");
    setImage(style.image ?? "");
    setError(null);
  }, [style]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateStyle({
        id: style.id,
        label: label.trim(),
        description: description.trim() || null,
        image: image.trim() || null,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.styles.all() });
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar estilo</DialogTitle>
          <DialogDescription>Actualiza el estilo visual seleccionado.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1">
            <label htmlFor={`style-label-${style.id}`} className="text-sm font-medium">
              Nombre
            </label>
            <Input
              id={`style-label-${style.id}`}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor={`style-description-${style.id}`} className="text-sm font-medium">
              Descripcion
            </label>
            <Input
              id={`style-description-${style.id}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Imagen (JPG/PNG, una)</span>
            <ImageDropzone
              multiple={false}
              folder="hat-styles"
              value={image}
              onChange={setImage}
              disabled={isPending}
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
