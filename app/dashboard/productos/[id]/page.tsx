import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProductById } from "@/services/products";
import { EntityDetailShell } from "@/components/dashboard/entity-detail-shell";
import { ProductDetailView } from "@/components/dashboard/product-detail-view";
import { Button } from "@/components/ui/button";
import { dashboardRoutes } from "@/lib/dashboard-routes";
import { dashboardBreadcrumbs } from "@/lib/dashboard-breadcrumbs";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const product = await getProductById(supabase, id);

  if (!product) {
    notFound();
  }

  return (
    <EntityDetailShell
      breadcrumbs={dashboardBreadcrumbs.productos.detail(product.name)}
      badge="Productos"
      title={product.name}
      description={product.hat_style?.label ? `Estilo: ${product.hat_style.label}` : undefined}
      actions={
        <Button asChild size="sm">
          <Link href={dashboardRoutes.productos.editar(product.id)}>
            <Pencil className="mr-2 size-4" />
            Editar
          </Link>
        </Button>
      }
    >
      <ProductDetailView product={product} />
    </EntityDetailShell>
  );
}
