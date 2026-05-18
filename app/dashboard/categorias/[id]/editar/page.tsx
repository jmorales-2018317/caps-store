import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategoryById } from "@/services/categories";
import { EntityFormShell } from "@/components/dashboard/entity-form-shell";
import { CategoryForm } from "@/components/dashboard/category-form";
import { dashboardBreadcrumbs } from "@/lib/dashboard-breadcrumbs";

type EditarCategoriaPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarCategoriaPage({ params }: EditarCategoriaPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const category = await getCategoryById(supabase, id);

  if (!category) {
    notFound();
  }

  return (
    <EntityFormShell
      breadcrumbs={dashboardBreadcrumbs.categorias.editar(category.label, id)}
      badge="Categorias"
      title="Editar categoria"
      description="Actualiza la categoria seleccionada."
    >
      <CategoryForm mode="edit" category={category} />
    </EntityFormShell>
  );
}
