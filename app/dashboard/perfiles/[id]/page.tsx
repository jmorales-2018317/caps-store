import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/services/profiles";
import { EntityDetailShell } from "@/components/dashboard/entity-detail-shell";
import { ProfileDetailView } from "@/components/dashboard/profile-detail-view";
import { Button } from "@/components/ui/button";
import { dashboardRoutes } from "@/lib/dashboard-routes";
import { dashboardBreadcrumbs } from "@/lib/dashboard-breadcrumbs";

type PerfilDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PerfilDetailPage({ params }: PerfilDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getProfileById(supabase, id);

  if (!profile) {
    notFound();
  }

  return (
    <EntityDetailShell
      breadcrumbs={dashboardBreadcrumbs.perfiles.detail(
        profile.full_name?.trim() || "Perfil sin nombre"
      )}
      badge="Perfiles"
      title={profile.full_name?.trim() || "Perfil sin nombre"}
      description={profile.email ?? undefined}
      actions={
        <Button asChild size="sm">
          <Link href={dashboardRoutes.perfiles.editar(profile.id)}>
            <Pencil className="mr-2 size-4" />
            Editar
          </Link>
        </Button>
      }
    >
      <ProfileDetailView profile={profile} />
    </EntityDetailShell>
  );
}
