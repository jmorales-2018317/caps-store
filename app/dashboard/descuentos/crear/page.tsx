import { EntityFormShell } from "@/components/dashboard/entity-form-shell";
import { DiscountForm } from "@/components/dashboard/discount-form";
import { dashboardBreadcrumbs } from "@/lib/dashboard-breadcrumbs";

export default function CrearDescuentoPage() {
  return (
    <EntityFormShell
      breadcrumbs={dashboardBreadcrumbs.descuentos.crear()}
      badge="Descuentos"
      title="Crear descuento"
      description="Define vigencia y tipo de rebaja."
    >
      <DiscountForm mode="create" />
    </EntityFormShell>
  );
}
