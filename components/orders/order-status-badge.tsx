import { cn } from "@/lib/utils";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";

export type { OrderStatus } from "@/lib/order-status";
export { normalizeOrderStatus } from "@/lib/order-status";

export const ORDER_STATUS_BADGE_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pendiente",
    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  shipped: {
    label: "Enviado",
    className: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
  delivered: {
    label: "Entregado",
    className: "bg-green-500/15 text-green-400 border-green-500/30",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

/** Opciones para filtros / selects (orden fijo). */
export const ORDER_STATUS_FILTER_OPTIONS: {
  value: OrderStatus;
  label: string;
}[] = ORDER_STATUSES.map((value) => ({
  value,
  label: ORDER_STATUS_BADGE_CONFIG[value].label,
}));

type OrderStatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const cfg = ORDER_STATUS_BADGE_CONFIG[status] ?? {
    label: status,
    className: "bg-surface-2 text-muted border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        cfg.className,
        className
      )}
    >
      {cfg.label}
    </span>
  );
}
