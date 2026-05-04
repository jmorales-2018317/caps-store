import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { getCategories } from "@/services/categories";
import { CategoriesDataTable } from "@/components/dashboard/categories-data-table";
import { CreateCategoryAction } from "@/components/dashboard/create-category-dialog";
import { EntityHeader } from "@/components/dashboard/entity-header";

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
          action={<CreateCategoryAction />}
        />
        <CategoriesDataTable />
      </div>
    </HydrationBoundary>
  );
}
