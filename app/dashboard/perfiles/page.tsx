import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { getProfiles } from "@/services/profiles";
import { EntityHeader } from "@/components/dashboard/entity-header";
import { ProfilesDataTable } from "@/components/dashboard/profiles-data-table";

export default async function DashboardPerfilPage() {
  const supabase = await createClient();
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.profiles.all(),
    queryFn: () => getProfiles(supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <EntityHeader
          badge="Configuracion"
          title="Perfiles"
          description="Informacion de perfiles con acceso para editar y administrar usuarios."
        />
        <ProfilesDataTable />
      </div>
    </HydrationBoundary>
  );
}
