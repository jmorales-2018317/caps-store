import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStyleById } from "@/services/styles";
import { EntityDetailShell } from "@/components/dashboard/entity-detail-shell";
import { CatalogEntityDetailView } from "@/components/dashboard/catalog-entity-detail-view";
import { Button } from "@/components/ui/button";
import { dashboardRoutes } from "@/lib/dashboard-routes";
import { dashboardBreadcrumbs } from "@/lib/dashboard-breadcrumbs";

type EstiloDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EstiloDetailPage({ params }: EstiloDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const style = await getStyleById(supabase, id);

  if (!style) {
    notFound();
  }

  return (
    <EntityDetailShell
      breadcrumbs={dashboardBreadcrumbs.estilos.detail(style.label)}
      badge="Estilos"
      title={style.label}
      actions={
        <Button asChild size="sm">
          <Link href={dashboardRoutes.estilos.editar(style.id)}>
            <Pencil className="mr-2 size-4" />
            Editar
          </Link>
        </Button>
      }
    >
      <CatalogEntityDetailView
        label={style.label}
        description={style.description}
        image={style.image}
      />
    </EntityDetailShell>
  );
}
