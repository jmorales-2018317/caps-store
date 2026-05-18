import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrderById } from "@/services/orders";
import { EntityDetailShell } from "@/components/dashboard/entity-detail-shell";
import { OrderDetailView } from "@/components/dashboard/order-detail-view";
import { Button } from "@/components/ui/button";
import { dashboardRoutes } from "@/lib/dashboard-routes";
import { dashboardBreadcrumbs } from "@/lib/dashboard-breadcrumbs";

type OrdenDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrdenDetailPage({ params }: OrdenDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const order = await getOrderById(supabase, id);

  if (!order) {
    notFound();
  }

  const shortId = id.slice(-8).toUpperCase();

  return (
    <EntityDetailShell
      breadcrumbs={dashboardBreadcrumbs.ordenes.detail(shortId)}
      badge="Ordenes"
      title={`Orden #${shortId}`}
      description={order.contact_name}
      actions={
        <Button asChild size="sm">
          <Link href={dashboardRoutes.ordenes.editar(order.id)}>
            <Pencil className="mr-2 size-4" />
            Editar
          </Link>
        </Button>
      }
    >
      <OrderDetailView order={order} />
    </EntityDetailShell>
  );
}
