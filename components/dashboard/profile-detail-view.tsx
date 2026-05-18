import Image from "next/image";
import type { Profile } from "@/types";

type ProfileDetailViewProps = {
  profile: Profile;
};

export function ProfileDetailView({ profile }: ProfileDetailViewProps) {
  const displayName = profile.full_name?.trim() || "Sin nombre";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-start">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-full border border-border bg-surface-2">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={displayName}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-lg font-bold text-muted">
            {initials || "?"}
          </div>
        )}
      </div>
      <div className="grid flex-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Nombre</p>
          <p className="mt-1 text-lg font-semibold text-text">{displayName}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Email</p>
          <p className="mt-1 text-sm text-text">{profile.email ?? "—"}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Rol</p>
          <p className="mt-1 text-sm capitalize text-text">{profile.role}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">ID</p>
          <p className="mt-1 font-mono text-xs text-muted">{profile.id}</p>
        </div>
      </div>
    </section>
  );
}
