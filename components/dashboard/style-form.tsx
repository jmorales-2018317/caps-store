"use client";

import { type FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createStyle, updateStyle } from "@/app/actions/dashboard";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { dashboardRoutes } from "@/lib/dashboard-routes";
import type { HatStyle } from "@/types";
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

type StyleFormProps = {
  mode: "create" | "edit";
  style?: HatStyle;
};

export function StyleForm({ mode, style }: StyleFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [label, setLabel] = useState(style?.label ?? "");
  const [description, setDescription] = useState(style?.description ?? "");
  const [image, setImage] = useState(style?.image ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!style || mode !== "edit") return;
    setLabel(style.label);
    setDescription(style.description ?? "");
    setImage(style.image ?? "");
    setError(null);
  }, [style, mode]);

  const cancelHref =
    mode === "edit" && style
      ? dashboardRoutes.estilos.detail(style.id)
      : dashboardRoutes.estilos.list();

  const idPrefix = mode === "edit" && style ? style.id : "create";

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (mode === "create" && !image.trim()) {
      setError("La imagen es obligatoria.");
      return;
    }

    startTransition(async () => {
      if (mode === "create") {
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
        router.push(dashboardRoutes.estilos.list());
        return;
      }

      if (!style) return;

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
      await queryClient.invalidateQueries({
        queryKey: queryKeys.styles.detail(style.id),
      });
      router.push(dashboardRoutes.estilos.detail(style.id));
    });
  }

  const imageFooter = image
    ? "Imagen lista."
    : mode === "create"
      ? "Obligatoria para crear el estilo."
      : "Sin imagen cargada.";

  return (
    <DashboardForm onSubmit={handleSubmit} className="space-y-4">
      <FormActions
        cancelHref={cancelHref}
        submitLabel={mode === "create" ? "Crear estilo" : "Guardar estilo"}
        pendingLabel={mode === "create" ? "Creando..." : "Guardando..."}
        isPending={isPending}
        error={error}
      />

      <div className={formPageGridClass}>
        <div className={formFieldsStackClass}>
          <FormSection title="Datos del estilo" description="Nombre y descripcion del estilo visual.">
            <FormField label="Nombre" htmlFor={`style-label-${idPrefix}`} required size="md">
              <Input
                id={`style-label-${idPrefix}`}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ej. Trucker"
                required
              />
            </FormField>

            <FormField label="Descripcion" htmlFor={`style-description-${idPrefix}`} size="lg">
              <FormTextarea
                id={`style-description-${idPrefix}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </FormField>
          </FormSection>
        </div>

        <FormImagePanel
          title="Imagen del estilo"
          description="Representacion visual en el catalogo y filtros."
          footer={imageFooter}
        >
          <ImageDropzone
            multiple={false}
            folder="hat-styles"
            value={image}
            onChange={setImage}
            disabled={isPending}
          />
        </FormImagePanel>
      </div>
    </DashboardForm>
  );
}
