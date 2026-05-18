import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { getStyles } from "@/services/styles";
import { getCategories } from "@/services/categories";
import { getDiscounts } from "@/services/discounts";
import { EntityFormShell } from "@/components/dashboard/entity-form-shell";
import { ProductForm } from "@/components/dashboard/product-form";
import { dashboardBreadcrumbs } from "@/lib/dashboard-breadcrumbs";

export default async function CrearProductoPage() {
  const supabase = await createClient();
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.styles.all(),
      queryFn: () => getStyles(supabase),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.all(),
      queryFn: () => getCategories(supabase),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.discounts.all(),
      queryFn: () => getDiscounts(supabase),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EntityFormShell
        breadcrumbs={dashboardBreadcrumbs.productos.crear()}
        badge="Productos"
        title="Crear producto"
        description="Completa los datos. Las imagenes se suben al bucket caps-store (JPG/PNG)."
      >
        <ProductForm mode="create" />
      </EntityFormShell>
    </HydrationBoundary>
  );
}
