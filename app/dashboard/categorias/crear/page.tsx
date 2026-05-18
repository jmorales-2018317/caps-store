import { EntityFormShell } from "@/components/dashboard/entity-form-shell";
import { CategoryForm } from "@/components/dashboard/category-form";
import { dashboardBreadcrumbs } from "@/lib/dashboard-breadcrumbs";

export default function CrearCategoriaPage() {
  return (
    <EntityFormShell
      breadcrumbs={dashboardBreadcrumbs.categorias.crear()}
      badge="Categorias"
      title="Crear categoria"
      description="Nueva categoria. Imagen obligatoria (JPG/PNG) via Storage caps-store."
    >
      <CategoryForm mode="create" />
    </EntityFormShell>
  );
}
