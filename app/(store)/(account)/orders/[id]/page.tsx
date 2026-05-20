import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatPriceDecimal } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { getOrderById } from "@/services/orders";
import type { OrderWithItems } from "@/types";

function customerOwnsOrder(
  order: OrderWithItems,
  userId: string,
  userEmail: string | undefined
): boolean {
  if (order.user_id && order.user_id === userId) return true;
  const email = userEmail?.trim().toLowerCase();
  const orderEmail = order.contact_email?.trim().toLowerCase();
  if (!order.user_id && email && orderEmail === email) return true;
  return false;
}

function formatOrderPlacedDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-GT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/orders/${id}`)}`);
  }

  const order = await getOrderById(supabase, id);
  if (!order) notFound();

  if (!customerOwnsOrder(order, user.id, user.email ?? undefined)) {
    notFound();
  }

  const short = order.id.slice(0, 8).toUpperCase();
  const displayId = `ORD-${short}`;
  const placedLabel = formatOrderPlacedDate(order.created_at);
  const items = order.items ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/orders"
        className="inline-flex text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground cursor-pointer motion-reduce:transition-none"
      >
        ← Volver a mis pedidos
      </Link>

      <article className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                Pedido #{displayId}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              Realizado el {placedLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:shrink-0">
            <Link
              href={`/orders/${order.id}#envio`}
              className="inline-flex h-10 min-h-11 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-semibold text-background transition-colors duration-200 hover:bg-foreground/90 cursor-pointer motion-reduce:transition-none"
            >
              Seguimiento
            </Link>
          </div>
        </div>

        <section
          id="envio"
          className="mt-8 scroll-mt-24 rounded-lg border border-border bg-muted/30 p-4 sm:p-5"
        >
          <h2 className="text-sm font-semibold text-foreground">
            Envío y contacto
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Nombre</dt>
              <dd className="font-medium text-foreground">{order.contact_name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Correo</dt>
              <dd className="font-medium text-foreground">{order.contact_email}</dd>
            </div>
            {order.contact_phone ? (
              <div>
                <dt className="text-muted-foreground">Teléfono</dt>
                <dd className="font-medium text-foreground">{order.contact_phone}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted-foreground">Método de envío</dt>
              <dd className="font-medium text-foreground">{order.shipping_method}</dd>
            </div>
            {(order.address || order.city || order.state) && (
              <div>
                <dt className="text-muted-foreground">Dirección</dt>
                <dd className="font-medium text-foreground">
                  {[order.address, order.city, order.state].filter(Boolean).join(", ")}
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold text-foreground">Artículos</h2>
          {items.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No hay líneas guardadas para este pedido.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
              {items.map((item) => {
                const lineTotal = item.quantity * item.unit_price;
                const meta = [
                  item.color_name ? `Color: ${item.color_name}` : null,
                  item.size ? `Talla: ${item.size}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <li
                    key={item.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <Link
                        href={`/products/${item.product_id}`}
                        className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-20"
                      >
                        {item.product_image_url ? (
                          <Image
                            src={item.product_image_url}
                            alt={item.product_name}
                            fill
                            className="object-cover object-center"
                            sizes="80px"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Package className="size-6 opacity-40" aria-hidden />
                          </span>
                        )}
                      </Link>
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.product_id}`}
                          className="text-sm font-semibold text-foreground underline-offset-4 hover:underline cursor-pointer"
                        >
                          {item.product_name}
                        </Link>
                        {meta ? (
                          <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
                        ) : null}
                        <p className="mt-1 text-xs text-muted-foreground">
                          Cantidad {item.quantity} × {formatPriceDecimal(item.unit_price)}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground pl-[calc(4rem+0.75rem)] sm:pl-0">
                      {formatPriceDecimal(lineTotal)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="mt-8 space-y-2 border-t border-border pt-5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums text-foreground">
              {formatPriceDecimal(order.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Envío</span>
            <span className="tabular-nums text-foreground">
              {formatPriceDecimal(order.shipping_cost)}
            </span>
          </div>
          <div className="flex items-end justify-between gap-3 pt-2">
            <span className="text-base font-semibold text-muted-foreground">
              Total del pedido
            </span>
            <span className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">
              {formatPriceDecimal(order.total)}
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}
