import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { getDiscounts } from "@/services/discounts";
import { CreateDiscountAction } from "@/components/dashboard/create-discount-dialog";
import { DiscountsDataTable } from "@/components/dashboard/discounts-data-table";
import { EntityHeader } from "@/components/dashboard/entity-header";

export default async function DashboardDescuentosPage() {
  const supabase = await createClient();
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.discounts.all(),
    queryFn: () => getDiscounts(supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <EntityHeader
          badge="Entidades"
          title="Descuentos"
          description="Administracion de descuentos por porcentaje o monto fijo."
          action={<CreateDiscountAction />}
        />
        <DiscountsDataTable />
      </div>
    </HydrationBoundary>
  );
}
