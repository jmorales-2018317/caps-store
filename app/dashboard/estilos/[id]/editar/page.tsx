import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStyleById } from "@/services/styles";
import { EntityFormShell } from "@/components/dashboard/entity-form-shell";
import { StyleForm } from "@/components/dashboard/style-form";
import { dashboardBreadcrumbs } from "@/lib/dashboard-breadcrumbs";

type EditarEstiloPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarEstiloPage({ params }: EditarEstiloPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const style = await getStyleById(supabase, id);

  if (!style) {
    notFound();
  }

  return (
    <EntityFormShell
      breadcrumbs={dashboardBreadcrumbs.estilos.editar(style.label, id)}
      badge="Estilos"
      title="Editar estilo"
      description="Actualiza el estilo visual seleccionado."
    >
      <StyleForm mode="edit" style={style} />
    </EntityFormShell>
  );
}
