"use client";

import { type FormEvent, useEffect, useState, useTransition } from "react";
import { updateProfile } from "@/app/actions/dashboard";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Profile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EditProfileSheetProps = {
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditProfileDialog({
  profile,
  open,
  onOpenChange,
}: EditProfileSheetProps) {
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
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Actualiza la informacion del perfil logueado en el dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1">
            <label htmlFor="profile-full-name" className="text-sm font-medium">
              Nombre completo
            </label>
            <Input
              id="profile-full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Administrador Crea Caps"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="profile-avatar-url" className="text-sm font-medium">
              Avatar URL
            </label>
            <Input
              id="profile-avatar-url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="profile-role" className="text-sm font-medium">
              Rol
            </label>
            <Select value={role} onValueChange={(value) => setRole(value as Profile["role"])}>
              <SelectTrigger id="profile-role" className="w-full">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
