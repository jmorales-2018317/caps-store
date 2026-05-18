import { EntityFormShell } from "@/components/dashboard/entity-form-shell";
import { StyleForm } from "@/components/dashboard/style-form";
import { dashboardBreadcrumbs } from "@/lib/dashboard-breadcrumbs";

export default function CrearEstiloPage() {
  return (
    <EntityFormShell
      breadcrumbs={dashboardBreadcrumbs.estilos.crear()}
      badge="Estilos"
      title="Crear estilo"
      description="Nuevo estilo visual. Imagen obligatoria (JPG/PNG) via Storage caps-store."
    >
      <StyleForm mode="create" />
    </EntityFormShell>
  );
}
