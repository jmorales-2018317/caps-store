"use client";

import { type FormEvent, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions/dashboard";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { dashboardRoutes } from "@/lib/dashboard-routes";
import type { Profile } from "@/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DashboardForm,
  FormActions,
  FormField,
  FormImagePanel,
  FormSection,
  formFieldsStackClass,
  formPageGridClass,
} from "@/components/dashboard/form-layout";
import { cn } from "@/lib/utils";

type ProfileFormProps = {
  profile: Profile;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [role, setRole] = useState(profile.role || "user");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFullName(profile.full_name ?? "");
    setAvatarUrl(profile.avatar_url ?? "");
    setRole(profile.role || "user");
    setError(null);
  }, [profile]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateProfile({
        id: profile.id,
        full_name: fullName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        role,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.profiles.current() });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.profiles.detail(profile.id),
      });
      router.push(dashboardRoutes.perfiles.detail(profile.id));
    });
  }

  const initials = (fullName || profile.email || "?")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DashboardForm onSubmit={handleSubmit} className="space-y-4">
      <FormActions
        cancelHref={dashboardRoutes.perfiles.detail(profile.id)}
        submitLabel="Guardar cambios"
        pendingLabel="Guardando..."
        isPending={isPending}
        error={error}
      />

      <div className={formPageGridClass}>
        <div className={formFieldsStackClass}>
          <FormSection title="Perfil de usuario" description="Datos visibles en el panel y el menu lateral.">
            <FormField label="Nombre completo" htmlFor="profile-full-name" size="md">
              <Input
                id="profile-full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Administrador Crea Caps"
              />
            </FormField>

            <FormField label="Rol" htmlFor="profile-role" required size="md">
              <Select value={role} onValueChange={(value) => setRole(value)}>
                <SelectTrigger id="profile-role" className="w-full">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormSection>
        </div>

        <FormImagePanel
          title="Avatar"
          description="Vista previa del avatar en el menu y la ficha de perfil."
          footer="Pega un enlace HTTPS a una imagen cuadrada (JPG o PNG)."
        >
          <div
            className={cn(
              "relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-xl border border-border bg-surface-2",
              !avatarUrl && "border-dashed"
            )}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={fullName || "Avatar"}
                fill
                className="object-cover"
                sizes="240px"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface-2/80">
                <span className="text-3xl font-bold text-muted">{initials}</span>
              </div>
            )}
          </div>

          <FormField
            label="URL del avatar"
            htmlFor="profile-avatar-url"
            size="full"
            className="pt-1"
          >
            <Input
              id="profile-avatar-url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              type="url"
            />
          </FormField>
        </FormImagePanel>
      </div>
    </DashboardForm>
  );
}
