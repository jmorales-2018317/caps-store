import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDiscountById } from "@/services/discounts";
import { EntityFormShell } from "@/components/dashboard/entity-form-shell";
import { DiscountForm } from "@/components/dashboard/discount-form";
import { dashboardBreadcrumbs } from "@/lib/dashboard-breadcrumbs";

type EditarDescuentoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarDescuentoPage({ params }: EditarDescuentoPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const discount = await getDiscountById(supabase, id);

  if (!discount) {
    notFound();
  }

  return (
    <EntityFormShell
      breadcrumbs={dashboardBreadcrumbs.descuentos.editar(discount.name, id)}
      badge="Descuentos"
      title="Editar descuento"
      description="Actualiza datos del descuento."
    >
      <DiscountForm mode="edit" discount={discount} />
    </EntityFormShell>
  );
}
