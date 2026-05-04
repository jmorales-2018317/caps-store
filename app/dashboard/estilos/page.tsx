import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { getStyles } from "@/services/styles";
import { CreateStyleAction } from "@/components/dashboard/create-style-dialog";
import { EntityHeader } from "@/components/dashboard/entity-header";
import { StylesDataTable } from "@/components/dashboard/styles-data-table";

export default async function DashboardEstilosPage() {
  const supabase = await createClient();
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.styles.all(),
    queryFn: () => getStyles(supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <EntityHeader
          badge="Entidades"
          title="Estilos"
          description="Administracion de estilos visuales para colecciones, branding y experiencias."
          action={<CreateStyleAction />}
        />
        <StylesDataTable />
      </div>
    </HydrationBoundary>
  );
}
