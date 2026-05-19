import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type AccountEmptyStateProps = {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction: {
    href: string;
    label: string;
    showArrow?: boolean;
  };
  secondaryAction?: {
    href: string;
    label: string;
  };
};

/**
 * Estado vacío unificado para Carrito / Mis pedidos (e-commerce, tipografía del sitio).
 */
export function AccountEmptyState({
  icon: Icon,
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
}: AccountEmptyStateProps) {
  const showArrow = primaryAction.showArrow !== false;

  return (
    <div className="flex justify-center py-10 md:py-14">
      <div className="w-full max-w-lg px-4 sm:px-6">
        <div className="text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-border">
            <Icon
              className="h-7 w-7 text-primary"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>

          {eyebrow ? (
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-primary">
              {eyebrow}
            </p>
          ) : null}

          <h2 className="mb-3 font-black uppercase text-2xl tracking-tighter text-text sm:text-[1.65rem] leading-tight">
            {title}
          </h2>
          <p className="mx-auto mb-10 max-w-sm text-sm leading-relaxed text-muted">
            {description}
          </p>

          <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center sm:gap-5">
            <Button size="lg" className="w-full cursor-pointer sm:w-auto sm:min-w-[220px]" asChild>
              <Link href={primaryAction.href}>
                {primaryAction.label}
                {showArrow ? (
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/button:translate-x-0.5" />
                ) : null}
              </Link>
            </Button>
            {secondaryAction ? (
              <Link
                href={secondaryAction.href}
                className="cursor-pointer text-center text-[11px] font-bold uppercase tracking-[0.2em] text-muted transition-colors duration-200 hover:text-text sm:text-left"
              >
                {secondaryAction.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccountPanelLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-[min(320px,70vh)] items-center justify-center rounded-2xl border border-dashed border-border px-6 py-16">
      <div className="flex flex-col items-center gap-4 text-muted">
        <Loader2
          className="h-8 w-8 shrink-0 animate-spin text-primary motion-reduce:animate-none"
          aria-hidden
        />
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
}
