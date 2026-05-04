"use client";

import { type FormEvent, useEffect, useState, useTransition } from "react";
import { updateCategory } from "@/app/actions/dashboard";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Category } from "@/types";
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

type EditCategorySheetProps = {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditCategoryDialog({
  category,
  open,
  onOpenChange,
}: EditCategorySheetProps) {
  const queryClient = useQueryClient();
  const [label, setLabel] = useState(category.label);
  const [description, setDescription] = useState(category.description ?? "");
  const [image, setImage] = useState(category.image ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLabel(category.label);
    setDescription(category.description ?? "");
    setImage(category.image ?? "");
    setError(null);
  }, [category]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateCategory({
        id: category.id,
        label: label.trim(),
        description: description.trim() || null,
        image: image.trim() || null,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar categoria</DialogTitle>
          <DialogDescription>Actualiza la categoria seleccionada.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1">
            <label htmlFor={`cat-label-${category.id}`} className="text-sm font-medium">
              Nombre
            </label>
            <Input
              id={`cat-label-${category.id}`}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor={`cat-description-${category.id}`} className="text-sm font-medium">
              Descripcion
            </label>
            <Input
              id={`cat-description-${category.id}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Imagen (JPG/PNG, una)</span>
            <ImageDropzone
              multiple={false}
              folder="categories"
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
