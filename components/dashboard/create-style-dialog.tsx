"use client";

import * as React from "react";
import { type FormEvent, useState, useTransition } from "react";
import { createStyle } from "@/app/actions/dashboard";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
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

type CreateStyleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateStyleDialog({ open, onOpenChange }: CreateStyleDialogProps) {
  const queryClient = useQueryClient();
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    if (open) {
      setLabel("");
      setDescription("");
      setImage("");
      setError(null);
    }
  }, [open]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!image.trim()) {
      setError("La imagen es obligatoria.");
      return;
    }

    startTransition(async () => {
      const result = await createStyle({
        label: label.trim(),
        description: description.trim() || null,
        image: image.trim(),
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
          <DialogTitle>Crear estilo</DialogTitle>
          <DialogDescription>
            Nuevo estilo visual. Imagen obligatoria (JPG/PNG) via Storage caps-store.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1">
            <label htmlFor="create-style-label" className="text-sm font-medium">
              Nombre
            </label>
            <Input
              id="create-style-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="create-style-description" className="text-sm font-medium">
              Descripcion
            </label>
            <Input
              id="create-style-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="w-full space-y-2">
            <span className="text-sm font-medium">Imagen (obligatoria)</span>
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
              {isPending ? "Creando..." : "Crear estilo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateStyleAction() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Crear estilo
      </Button>
      <CreateStyleDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
