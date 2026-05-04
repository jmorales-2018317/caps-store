"use client";

import { type FormEvent, useEffect, useState, useTransition } from "react";
import { updateProduct } from "@/app/actions/dashboard";
import { useStyles } from "@/hooks/use-styles";
import { useCategories } from "@/hooks/use-categories";
import { useDiscounts } from "@/hooks/use-discounts";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Product } from "@/types";
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
import { MultiSelect } from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";

type EditProductSheetProps = {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditProductDialog({
  product,
  open,
  onOpenChange,
}: EditProductSheetProps) {
  const { data: hatStyles = [] } = useStyles();
  const { data: categories = [] } = useCategories();
  const { data: discounts = [] } = useDiscounts();
  const queryClient = useQueryClient();
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [description, setDescription] = useState(product.description ?? "");
  const [selectedStyleIds, setSelectedStyleIds] = useState<string[]>(
    product.hat_style?.id ? [product.hat_style.id] : []
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    (product.categories ?? []).map((c) => c.id)
  );
  const [selectedDiscountIds, setSelectedDiscountIds] = useState<string[]>(
    (product.discounts ?? []).map((d) => d.id)
  );
  const [images, setImages] = useState<string[]>(product.images ?? []);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setName(product.name);
    setPrice(String(product.price));
    setDescription(product.description ?? "");
    setSelectedStyleIds(product.hat_style?.id ? [product.hat_style.id] : []);
    setSelectedCategoryIds((product.categories ?? []).map((c) => c.id));
    setSelectedDiscountIds((product.discounts ?? []).map((d) => d.id));
    setImages(product.images ?? []);
    setError(null);
  }, [product]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const parsedPrice = Number(price);
      if (!name.trim()) {
        setError("El nombre es requerido.");
        return;
      }

      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        setError("El precio debe ser un numero mayor a 0.");
        return;
      }
      if (selectedStyleIds.length === 0) {
        setError("Selecciona un estilo de gorra.");
        return;
      }
      if (images.length === 0) {
        setError("Agrega al menos una imagen.");
        return;
      }

      const result = await updateProduct({
        id: product.id,
        name: name.trim(),
        price: parsedPrice,
        description: description.trim(),
        hat_style_id: selectedStyleIds[0],
        categories: selectedCategoryIds,
        images,
        colors: product.colors ?? [],
        sizes: product.sizes ?? [],
        discount_ids: selectedDiscountIds,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
          <DialogDescription>
            Actualiza los datos. Las imagenes se suben al bucket caps-store (JPG/PNG).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <section className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors duration-200 lg:col-span-2">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-text">Informacion basica</h3>
                <p className="text-xs text-muted">Define el contenido principal del producto.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor={`product-name-${product.id}`} className="text-sm font-medium">
                    Nombre
                  </label>
                  <Input
                    id={`product-name-${product.id}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor={`product-description-${product.id}`} className="text-sm font-medium">
                    Descripcion (opcional)
                  </label>
                  <textarea
                    id={`product-description-${product.id}`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className={cn(
                      "w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text",
                      "placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    )}
                    placeholder="Descripcion del producto..."
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`product-price-${product.id}`} className="text-sm font-medium">
                    Precio
                  </label>
                  <Input
                    id={`product-price-${product.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Estilo de gorra</label>
                  <MultiSelect
                    options={hatStyles.map((s) => ({ label: s.label, value: s.id }))}
                    value={selectedStyleIds}
                    onValueChange={(values) => setSelectedStyleIds(values.slice(-1))}
                    placeholder="Seleccionar estilo..."
                    maxCount={1}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors duration-200 lg:min-h-[280px]">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-text">Media</h3>
                <p className="text-xs text-muted">Sube imagenes claras del producto.</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Imagenes</span>
                <ImageDropzone
                  multiple
                  folder="products"
                  value={images}
                  onChange={setImages}
                  disabled={isPending}
                />
              </div>
            </section>
          </div>

          <section className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors duration-200">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-text">Clasificacion</h3>
              <p className="text-xs text-muted">Organiza el producto por categoria y promocion.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="text-sm font-medium">Categorias</span>
                <MultiSelect
                  options={categories.map((c) => ({ label: c.label, value: c.id }))}
                  value={selectedCategoryIds}
                  onValueChange={setSelectedCategoryIds}
                  placeholder="Seleccionar categorias..."
                />
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Descuentos</span>
                <MultiSelect
                  options={discounts.map((d) => ({ label: d.name, value: d.id }))}
                  value={selectedDiscountIds}
                  onValueChange={setSelectedDiscountIds}
                  placeholder="Seleccionar descuentos..."
                />
              </div>
            </div>
          </section>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
