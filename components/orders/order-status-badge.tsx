import { cn } from "@/lib/utils";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";

export type { OrderStatus } from "@/lib/order-status";
export { normalizeOrderStatus } from "@/lib/order-status";

/** Estilo tipo píldora monocromático (referencia pedidos / estados claros). */
export const ORDER_STATUS_BADGE_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pendiente",
    className:
      "bg-muted text-foreground border-transparent dark:bg-muted dark:text-foreground",
  },
  shipped: {
    label: "Enviado",
    className:
      "bg-muted text-foreground border-transparent dark:bg-muted dark:text-foreground",
  },
  delivered: {
    label: "Entregado",
    className:
      "bg-foreground text-background border-transparent dark:bg-foreground dark:text-background",
  },
  cancelled: {
    label: "Cancelado",
    className:
      "bg-background text-muted-foreground border-border dark:bg-background dark:text-muted-foreground",
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
    className: "bg-muted text-foreground border-transparent",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-normal",
        cfg.className,
        className
      )}
    >
      {cfg.label}
    </span>
  );
}
