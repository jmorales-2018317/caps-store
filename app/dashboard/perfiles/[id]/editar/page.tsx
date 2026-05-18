import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/services/profiles";
import { EntityFormShell } from "@/components/dashboard/entity-form-shell";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { dashboardBreadcrumbs } from "@/lib/dashboard-breadcrumbs";

type EditarPerfilPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarPerfilPage({ params }: EditarPerfilPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getProfileById(supabase, id);

  if (!profile) {
    notFound();
  }

  return (
    <EntityFormShell
      breadcrumbs={dashboardBreadcrumbs.perfiles.editar(
        profile.full_name?.trim() || "Perfil sin nombre",
        id
      )}
      badge="Perfiles"
      title="Editar perfil"
      description="Actualiza la informacion del perfil."
    >
      <ProfileForm profile={profile} />
    </EntityFormShell>
  );
}
