import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrderById } from "@/services/orders";
import { EntityFormShell } from "@/components/dashboard/entity-form-shell";
import { OrderForm } from "@/components/dashboard/order-form";
import { dashboardBreadcrumbs } from "@/lib/dashboard-breadcrumbs";

type EditarOrdenPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarOrdenPage({ params }: EditarOrdenPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const order = await getOrderById(supabase, id);

  if (!order) {
    notFound();
  }

  return (
    <EntityFormShell
      breadcrumbs={dashboardBreadcrumbs.ordenes.editar(id.slice(-8).toUpperCase(), id)}
      badge="Ordenes"
      title="Editar orden"
      description="Ajusta estado y datos de envio."
    >
      <OrderForm order={order} />
    </EntityFormShell>
  );
}
