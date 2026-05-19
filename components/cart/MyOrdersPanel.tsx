"use client";

import { LogIn, Package } from "lucide-react";
import { useMyOrders } from "@/hooks/use-my-orders";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  AccountEmptyState,
  AccountPanelLoading,
} from "@/components/cart/AccountEmptyState";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatPriceDecimal } from "@/lib/utils";
import type { OrderWithItems } from "@/types";

function OrderCard({
  order,
  short,
  date,
}: {
  order: OrderWithItems;
  short: string;
  date: string;
}) {
  const items = order.items ?? [];

  return (
    <article className="border border-border bg-surface-2 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.25em] text-muted">
            Pedido #{short}
          </p>
          <p className="truncate text-sm font-medium text-text">{order.contact_name}</p>
          <p className="mt-0.5 text-[11px] text-muted">{date}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end sm:shrink-0">
          <OrderStatusBadge status={order.status} />
          <span className="text-sm font-black tabular-nums text-text">
            {formatPriceDecimal(order.total)}
          </span>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mt-5 border-t border-border pt-5">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-muted">
            Artículos
          </p>
          <ul className="space-y-4">
            {items.map((item) => {
              const lineTotal = item.quantity * item.unit_price;
              const meta = [item.color_name, item.size ? `Talla ${item.size}` : null]
                .filter(Boolean)
                .join(" · ");

              return (
                <li
                  key={item.id}
                  className="flex gap-3 border-b border-border/60 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex min-w-0 flex-1 gap-3">
                    {item.color_hex ? (
                      <span
                        className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-border shadow-inner"
                        style={{ backgroundColor: item.color_hex }}
                        aria-hidden
                      />
                    ) : (
                      <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-dashed border-border bg-bg" aria-hidden />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug text-text">
                        {item.product_name}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted">
                        {meta ? `${meta} · ` : null}
                        {item.quantity} × {formatPriceDecimal(item.unit_price)}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-text">
                    {formatPriceDecimal(lineTotal)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="mt-5 border-t border-border pt-5 text-center text-[11px] text-muted">
          No hay líneas guardadas para este pedido.
        </p>
      )}
    </article>
  );
}

export function MyOrdersPanel() {
  const { data: user, isPending: userPending } = useCurrentUser();
  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersErrorDetail,
  } = useMyOrders(Boolean(user));

  if (userPending) {
    return <AccountPanelLoading label="Comprobando sesión…" />;
  }

  if (!user) {
    return (
      <AccountEmptyState
        icon={LogIn}
        eyebrow="Sesión"
        title="Entra para ver tus pedidos"
        description="Asociamos cada compra a tu cuenta para que puedas revisar el estado del envío y el total en un solo lugar."
        primaryAction={{
          href: `/login?redirect=${encodeURIComponent("/orders")}`,
          label: "Iniciar sesión",
        }}
        secondaryAction={{
          href: `/signup?redirect=${encodeURIComponent("/orders")}`,
          label: "Crear cuenta",
        }}
      />
    );
  }

  if (ordersLoading) {
    return <AccountPanelLoading label="Cargando pedidos…" />;
  }

  if (ordersError) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-5 py-6 text-center">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          No se pudieron cargar tus pedidos.
        </p>
        <p className="mt-2 text-xs text-muted">
          {ordersErrorDetail instanceof Error
            ? ordersErrorDetail.message
            : "Intenta recargar la página."}
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <AccountEmptyState
        icon={Package}
        eyebrow="Mis pedidos"
        title="Aún no tienes pedidos"
        description="Cuando completes el pago, verás aquí el número de pedido, el importe y el estado en tiempo real."
        primaryAction={{ href: "/products", label: "Explorar la tienda" }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const short = order.id.slice(0, 8).toUpperCase();
        const date = new Date(order.created_at).toLocaleDateString("es-GT", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        return (
          <OrderCard key={order.id} order={order} short={short} date={date} />
        );
      })}
    </div>
  );
}
