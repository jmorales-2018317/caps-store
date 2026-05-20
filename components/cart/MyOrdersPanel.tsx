"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LogIn, Package } from "lucide-react";
import { useCallback, useRef } from "react";
import { useMyOrders } from "@/hooks/use-my-orders";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  AccountEmptyState,
  AccountPanelLoading,
} from "@/components/cart/AccountEmptyState";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { cn, formatPriceDecimal } from "@/lib/utils";
import type { OrderItem, OrderWithItems } from "@/types";

function formatOrderPlacedDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-GT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function OrderLineItemsCarousel({ items }: { items: OrderItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const distance = Math.min(el.clientWidth * 0.85, 320);
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: dir * distance,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, []);

  const showArrows = items.length > 1;

  return (
    <div className="relative mt-6">
      {showArrows ? (
        <>
          <button
            type="button"
            aria-label="Ver artículos anteriores"
            onClick={() => scrollByDir(-1)}
            className={cn(
              "absolute left-0 top-1/2 z-10 hidden min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors duration-200 hover:bg-muted sm:flex cursor-pointer",
              "motion-reduce:transition-none"
            )}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Ver artículos siguientes"
            onClick={() => scrollByDir(1)}
            className={cn(
              "absolute right-0 top-1/2 z-10 hidden min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors duration-200 hover:bg-muted sm:flex cursor-pointer",
              "motion-reduce:transition-none"
            )}
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </>
      ) : null}

      <div
        ref={scrollerRef}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 scroll-smooth",
          showArrows ? "px-0 sm:px-12" : "px-0",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {items.map((item) => {
          const details = [
            item.color_name ? `Color: ${item.color_name}` : null,
            item.size ? `Talla: ${item.size}` : null,
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <Link
              key={item.id}
              href={`/products/${item.product_id}`}
              className="group flex w-[min(240px,78vw)] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border bg-background p-3 transition-colors duration-200 hover:border-foreground/25 cursor-pointer motion-reduce:transition-none"
            >
              <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-muted">
                {item.product_image_url ? (
                  <Image
                    src={item.product_image_url}
                    alt={item.product_name}
                    fill
                    className="object-cover object-center transition-transform duration-200 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    sizes="240px"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Package className="size-10 opacity-40" aria-hidden />
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                {item.product_name}
              </p>
              {details ? (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {details}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">—</p>
              )}
              <div className="mt-3 flex items-end justify-between gap-2 border-t border-border/60 pt-3">
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {formatPriceDecimal(item.unit_price)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Cant.: {item.quantity}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  displayId,
  placedLabel,
}: {
  order: OrderWithItems;
  displayId: string;
  placedLabel: string;
}) {
  const items = order.items ?? [];

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-foreground sm:text-lg">
              Pedido #{displayId}
            </h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Realizado el {placedLabel}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 lg:shrink-0 lg:justify-end">
          <Link
            href={`/orders/${order.id}#envio`}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-semibold text-background transition-colors duration-200 hover:bg-foreground/90 cursor-pointer motion-reduce:transition-none"
          >
            Seguimiento
          </Link>
          <Link
            href={`/orders/${order.id}`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted cursor-pointer motion-reduce:transition-none"
          >
            Ver detalle
          </Link>
        </div>
      </div>

      {items.length > 0 ? (
        <OrderLineItemsCarousel items={items} />
      ) : (
        <p className="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">
          No hay líneas guardadas para este pedido.
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-t border-border pt-4">
        <span className="text-sm font-medium text-muted-foreground">
          Total del pedido
        </span>
        <span className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">
          {formatPriceDecimal(order.total)}
        </span>
      </div>
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
        <p className="mt-2 text-xs text-muted-foreground">
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
    <div className="space-y-6">
      {orders.map((order) => {
        const short = order.id.slice(0, 8).toUpperCase();
        const displayId = `ORD-${short}`;
        const placedLabel = formatOrderPlacedDate(order.created_at);

        return (
          <OrderCard
            key={order.id}
            order={order}
            displayId={displayId}
            placedLabel={placedLabel}
          />
        );
      })}
    </div>
  );
}
