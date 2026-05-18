import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { getCategories } from "@/services/categories";
import { CategoriesDataTable } from "@/components/dashboard/categories-data-table";
import Link from "next/link";
import { EntityHeader } from "@/components/dashboard/entity-header";
import { Button } from "@/components/ui/button";
import { dashboardRoutes } from "@/lib/dashboard-routes";

export default async function DashboardCategoriasPage() {
  const supabase = await createClient();
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.categories.all(),
    queryFn: () => getCategories(supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <EntityHeader
          badge="Entidades"
          title="Categorias"
          description="Control de categorias para organizar productos y mejorar filtros de compra."
          action={
            <Button asChild>
              <Link href={dashboardRoutes.categorias.crear()}>Crear categoria</Link>
            </Button>
          }
        />
        <CategoriesDataTable />
      </div>
    </HydrationBoundary>
  );
}
