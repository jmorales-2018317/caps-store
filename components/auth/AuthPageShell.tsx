import type { ReactNode } from "react";
import Link from "next/link";

export function AuthPageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">
      <aside className="relative lg:w-[42%] border-b lg:border-b-0 lg:border-r border-border bg-surface overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 12px, var(--color-primary) 12px, var(--color-primary) 13px)",
          }}
          aria-hidden
        />
        <div className="relative z-10 flex flex-col justify-center px-8 py-14 lg:py-24 lg:pl-12 lg:pr-10 min-h-[200px] lg:min-h-full">
          <Link
            href="/"
            className="font-black text-2xl tracking-tighter text-text hover:text-primary transition-colors duration-200 cursor-pointer w-fit"
          >
            Crea Caps
          </Link>
          <p className="mt-6 text-sm text-muted max-w-sm leading-relaxed">
            {subtitle}
          </p>
        </div>
      </aside>

      <section className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text mb-8">
            {title}
          </h1>
          <div className="rounded-none border border-border bg-surface p-6 sm:p-8 shadow-none">
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
