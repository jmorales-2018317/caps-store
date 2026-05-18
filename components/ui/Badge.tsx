import { cn } from "@/lib/utils";
import type { Badge as BadgeType } from "@/types";

const badgeConfig: Record<BadgeType, { label: string; className: string }> = {
  new: { label: "Novedad", className: "bg-accent text-bg" },
  reciente: { label: "Recién ingreso", className: "bg-accent text-bg" },
  limited: {
    label: "Edición limitada",
    className: "bg-surface-2 text-muted border border-border",
  },
  bestseller: {
    label: "Más vendido",
    className: "bg-surface-2 text-text border border-border",
  },
};

interface BadgeProps {
  type: BadgeType | string;
  className?: string;
}

export function Badge({ type, className }: BadgeProps) {
  const config = badgeConfig[type as BadgeType];
  return (
    <span
      className={cn(
        "inline-block text-[10px] font-black uppercase tracking-[0.15em] px-2 py-0.5",
        config?.className ?? "bg-surface-2 text-text border border-border",
        className
      )}
    >
      {config?.label ?? type}
    </span>
  );
}
