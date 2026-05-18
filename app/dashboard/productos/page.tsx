import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { getProducts } from "@/services/products";
import { getStyles } from "@/services/styles";
import { getCategories } from "@/services/categories";
import { getDiscounts } from "@/services/discounts";
import Link from "next/link";
import { EntityHeader } from "@/components/dashboard/entity-header";
import { ProductsDataTable } from "@/components/dashboard/products-data-table";
import { Button } from "@/components/ui/button";
import { dashboardRoutes } from "@/lib/dashboard-routes";

export default async function DashboardProductosPage() {
  const supabase = await createClient();
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.list(),
      queryFn: () => getProducts(supabase),
    }),
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
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <EntityHeader
          badge="Entidades"
          title="Productos"
          description="Gestion de productos del catalogo con datos reales desde Supabase."
          action={
            <Button asChild>
              <Link href={dashboardRoutes.productos.crear()}>Crear producto</Link>
            </Button>
          }
        />
        <ProductsDataTable />
      </div>
    </HydrationBoundary>
  );
}
