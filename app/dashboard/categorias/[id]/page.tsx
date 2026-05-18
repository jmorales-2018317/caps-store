import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCategoryById } from "@/services/categories";
import { EntityDetailShell } from "@/components/dashboard/entity-detail-shell";
import { CatalogEntityDetailView } from "@/components/dashboard/catalog-entity-detail-view";
import { Button } from "@/components/ui/button";
import { dashboardRoutes } from "@/lib/dashboard-routes";
import { dashboardBreadcrumbs } from "@/lib/dashboard-breadcrumbs";

type CategoriaDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CategoriaDetailPage({ params }: CategoriaDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const category = await getCategoryById(supabase, id);

  if (!category) {
    notFound();
  }

  return (
    <EntityDetailShell
      breadcrumbs={dashboardBreadcrumbs.categorias.detail(category.label)}
      badge="Categorias"
      title={category.label}
      actions={
        <Button asChild size="sm">
          <Link href={dashboardRoutes.categorias.editar(category.id)}>
            <Pencil className="mr-2 size-4" />
            Editar
          </Link>
        </Button>
      }
    >
      <CatalogEntityDetailView
        label={category.label}
        description={category.description}
        image={category.image}
      />
    </EntityDetailShell>
  );
}
