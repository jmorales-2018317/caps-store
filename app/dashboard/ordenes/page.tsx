import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { getOrders } from "@/services/orders";
import { EntityHeader } from "@/components/dashboard/entity-header";
import { OrdersDataTable } from "@/components/dashboard/orders-data-table";

export default async function DashboardOrdenesPage() {
  const supabase = await createClient();
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.orders.all(),
    queryFn: () => getOrders(supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <EntityHeader
          badge="Entidades"
          title="Ordenes"
          description="Seguimiento de pedidos para controlar estados y tiempos de despacho."
        />
        <OrdersDataTable />
      </div>
    </HydrationBoundary>
  );
}
