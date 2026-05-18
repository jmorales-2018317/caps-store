"use client";

import * as React from "react";
import { type FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/app/actions/dashboard";
import { useStyles } from "@/hooks/use-styles";
import { useCategories } from "@/hooks/use-categories";
import { useDiscounts } from "@/hooks/use-discounts";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { dashboardRoutes } from "@/lib/dashboard-routes";
import type { Product } from "@/types";
import { Input } from "@/components/ui/input";
import { ImageDropzone } from "@/components/dashboard/image-dropzone";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  DashboardForm,
  FormActions,
  FormField,
  FormImagePanel,
  FormSection,
  FormSubsection,
  FormTextarea,
  formFieldsStackClass,
  formPageGridClass,
} from "@/components/dashboard/form-layout";

type ProductFormProps = {
  mode: "create" | "edit";
  product?: Product;
};

export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const { data: hatStyles = [] } = useStyles();
  const { data: categories = [] } = useCategories();
  const { data: discounts = [] } = useDiscounts();
  const queryClient = useQueryClient();

  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [selectedStyleIds, setSelectedStyleIds] = useState<string[]>(
    product?.hat_style?.id ? [product.hat_style.id] : []
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    (product?.categories ?? []).map((c) => c.id)
  );
  const [selectedDiscountIds, setSelectedDiscountIds] = useState<string[]>(
    (product?.discounts ?? []).map((d) => d.id)
  );
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (mode === "create" && hatStyles[0]?.id && selectedStyleIds.length === 0) {
      setSelectedStyleIds([hatStyles[0].id]);
    }
  }, [mode, hatStyles, selectedStyleIds.length]);

  useEffect(() => {
    if (!product || mode !== "edit") return;
    setName(product.name);
    setPrice(String(product.price));
    setDescription(product.description ?? "");
    setSelectedStyleIds(product.hat_style?.id ? [product.hat_style.id] : []);
    setSelectedCategoryIds((product.categories ?? []).map((c) => c.id));
    setSelectedDiscountIds((product.discounts ?? []).map((d) => d.id));
    setImages(product.images ?? []);
    setError(null);
  }, [product, mode]);

  const cancelHref =
    mode === "edit" && product
      ? dashboardRoutes.productos.detail(product.id)
      : dashboardRoutes.productos.list();

  const idPrefix = mode === "edit" && product ? product.id : "create";

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

      if (mode === "create") {
        const result = await createProduct({
          name: name.trim(),
          price: parsedPrice,
          description: description.trim(),
          hat_style_id: selectedStyleIds[0],
          categories: selectedCategoryIds,
          discount_ids: selectedDiscountIds,
          images,
          colors: [],
          sizes: [],
        });

        if (result.error) {
          setError(result.error);
          return;
        }

        await queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
        router.push(dashboardRoutes.productos.list());
        return;
      }

      if (!product) return;

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
      await queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(product.id),
      });
      router.push(dashboardRoutes.productos.detail(product.id));
    });
  }

  const imageFooter =
    images.length === 0
      ? "Sube al menos una imagen. La primera sera la portada."
      : `${images.length} imagen${images.length === 1 ? "" : "es"} · arrastra para reordenar · la primera es portada`;

  return (
    <DashboardForm onSubmit={handleSubmit} className="space-y-4">
      <FormActions
        cancelHref={cancelHref}
        submitLabel={mode === "create" ? "Crear producto" : "Guardar producto"}
        pendingLabel={mode === "create" ? "Creando..." : "Guardando..."}
        isPending={isPending}
        error={error}
      />

      <div className={formPageGridClass}>
        <div className={formFieldsStackClass}>
          <FormSection
            title="Datos del producto"
            description="Nombre, precio y descripcion para la ficha en la tienda."
            contentClassName="space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(7.5rem,9.5rem)] md:items-start">
              <FormField label="Nombre" htmlFor={`product-name-${idPrefix}`} required size="full">
                <Input
                  id={`product-name-${idPrefix}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Gorra Classic Fit"
                  required
                />
              </FormField>

              <FormField label="Precio (GTQ)" htmlFor={`product-price-${idPrefix}`} required size="full">
                <Input
                  id={`product-price-${idPrefix}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </FormField>
            </div>

            <FormField
              label="Descripcion"
              htmlFor={`product-description-${idPrefix}`}
              hint="Opcional. Aparece en la ficha del producto."
              size="full"
            >
              <FormTextarea
                id={`product-description-${idPrefix}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Materiales, ajuste, detalles destacados..."
              />
            </FormField>

            <FormSubsection title="Catalogo">
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <FormField label="Estilo de gorra" hint="Un solo estilo." required size="full">
                  <MultiSelect
                    options={hatStyles.map((s) => ({ label: s.label, value: s.id }))}
                    value={selectedStyleIds}
                    onValueChange={(values) => setSelectedStyleIds(values.slice(-1))}
                    placeholder="Seleccionar estilo..."
                    maxCount={1}
                  />
                </FormField>

                <FormField label="Categorias" hint="Puedes elegir varias." size="full">
                  <MultiSelect
                    options={categories.map((c) => ({ label: c.label, value: c.id }))}
                    value={selectedCategoryIds}
                    onValueChange={setSelectedCategoryIds}
                    placeholder="Seleccionar categorias..."
                  />
                </FormField>

                <FormField
                  label="Descuentos"
                  hint="Opcional."
                  size="full"
                  className="sm:col-span-2 xl:col-span-1"
                >
                  <MultiSelect
                    options={discounts.map((d) => ({ label: d.name, value: d.id }))}
                    value={selectedDiscountIds}
                    onValueChange={setSelectedDiscountIds}
                    placeholder="Seleccionar descuentos..."
                  />
                </FormField>
              </div>
            </FormSubsection>
          </FormSection>
        </div>

        <FormImagePanel
          title="Galeria del producto"
          description="JPG o PNG. La primera imagen es la portada en la tienda."
          footer={imageFooter}
        >
          <ImageDropzone
            multiple
            folder="products"
            value={images}
            onChange={setImages}
            disabled={isPending}
          />
        </FormImagePanel>
      </div>
    </DashboardForm>
  );
}
