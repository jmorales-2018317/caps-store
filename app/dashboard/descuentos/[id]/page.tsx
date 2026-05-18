import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDiscountById } from "@/services/discounts";
import { EntityDetailShell } from "@/components/dashboard/entity-detail-shell";
import { DiscountDetailView } from "@/components/dashboard/discount-detail-view";
import { Button } from "@/components/ui/button";
import { dashboardRoutes } from "@/lib/dashboard-routes";
import { dashboardBreadcrumbs } from "@/lib/dashboard-breadcrumbs";

type DescuentoDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DescuentoDetailPage({ params }: DescuentoDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const discount = await getDiscountById(supabase, id);

  if (!discount) {
    notFound();
  }

  return (
    <EntityDetailShell
      breadcrumbs={dashboardBreadcrumbs.descuentos.detail(discount.name)}
      badge="Descuentos"
      title={discount.name}
      actions={
        <Button asChild size="sm">
          <Link href={dashboardRoutes.descuentos.editar(discount.id)}>
            <Pencil className="mr-2 size-4" />
            Editar
          </Link>
        </Button>
      }
    >
      <DiscountDetailView discount={discount} />
    </EntityDetailShell>
  );
}
