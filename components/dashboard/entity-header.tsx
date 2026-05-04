import type { ReactNode } from "react";

type EntityHeaderProps = {
  badge: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EntityHeader({ badge, title, description, action }: EntityHeaderProps) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface px-5 py-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-accent">
          {badge}
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-text sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </section>
  );
}
