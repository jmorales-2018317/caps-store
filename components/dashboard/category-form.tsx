"use client";

import { type FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory } from "@/app/actions/dashboard";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { dashboardRoutes } from "@/lib/dashboard-routes";
import type { Category } from "@/types";
import { Input } from "@/components/ui/input";
import { ImageDropzone } from "@/components/dashboard/image-dropzone";
import {
  DashboardForm,
  FormActions,
  FormField,
  FormImagePanel,
  FormSection,
  FormTextarea,
  formFieldsStackClass,
  formPageGridClass,
} from "@/components/dashboard/form-layout";

type CategoryFormProps = {
  mode: "create" | "edit";
  category?: Category;
};

export function CategoryForm({ mode, category }: CategoryFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [label, setLabel] = useState(category?.label ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!category || mode !== "edit") return;
    setLabel(category.label);
    setDescription(category.description ?? "");
    setImage(category.image ?? "");
    setError(null);
  }, [category, mode]);

  const cancelHref =
    mode === "edit" && category
      ? dashboardRoutes.categorias.detail(category.id)
      : dashboardRoutes.categorias.list();

  const idPrefix = mode === "edit" && category ? category.id : "create";

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (mode === "create" && !image.trim()) {
      setError("La imagen es obligatoria.");
      return;
    }

    startTransition(async () => {
      if (mode === "create") {
        const result = await createCategory({
          label: label.trim(),
          description: description.trim() || null,
          image: image.trim(),
        });

        if (result.error) {
          setError(result.error);
          return;
        }

        await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
        router.push(dashboardRoutes.categorias.list());
        return;
      }

      if (!category) return;

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
      await queryClient.invalidateQueries({
        queryKey: queryKeys.categories.detail(category.id),
      });
      router.push(dashboardRoutes.categorias.detail(category.id));
    });
  }

  const imageFooter = image
    ? "Imagen lista. Sube otra para reemplazarla."
    : mode === "create"
      ? "La imagen es obligatoria para publicar."
      : "Sin imagen cargada.";

  return (
    <DashboardForm onSubmit={handleSubmit} className="space-y-4">
      <FormActions
        cancelHref={cancelHref}
        submitLabel={mode === "create" ? "Crear categoria" : "Guardar categoria"}
        pendingLabel={mode === "create" ? "Creando..." : "Guardando..."}
        isPending={isPending}
        error={error}
      />

      <div className={formPageGridClass}>
        <div className={formFieldsStackClass}>
          <FormSection
            title="Datos de la categoria"
            description="Texto e identidad en el catalogo."
          >
            <FormField label="Nombre" htmlFor={`cat-label-${idPrefix}`} required size="md">
              <Input
                id={`cat-label-${idPrefix}`}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ej. Snapback"
                required
              />
            </FormField>

            <FormField
              label="Descripcion"
              htmlFor={`cat-description-${idPrefix}`}
              hint="Opcional. Ayuda a filtrar y describir la categoria."
              size="lg"
            >
              <FormTextarea
                id={`cat-description-${idPrefix}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Breve descripcion..."
              />
            </FormField>
          </FormSection>
        </div>

        <FormImagePanel
          title="Imagen de categoria"
          description="JPG o PNG. Se usa en filtros y tarjetas del catalogo."
          footer={imageFooter}
        >
          <ImageDropzone
            multiple={false}
            folder="categories"
            value={image}
            onChange={setImage}
            disabled={isPending}
          />
        </FormImagePanel>
      </div>
    </DashboardForm>
  );
}
