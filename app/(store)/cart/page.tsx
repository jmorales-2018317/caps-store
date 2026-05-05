"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import { ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { AccountEmptyState, AccountPanelLoading } from "@/components/cart/AccountEmptyState";
import { CartItem } from "@/components/cart/CartItem";
import { MyOrdersPanel } from "@/components/cart/MyOrdersPanel";
import { Button } from "@/components/ui/button";
import {
  cn,
  formatPrice,
  formatPriceDecimal,
  FREE_SHIPPING_MINIMUM_GTQ,
  SHIPPING_STANDARD_GTQ,
} from "@/lib/utils";

function CartPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTabState] = useState<"cart" | "orders">(
    tabParam === "orders" ? "orders" : "cart"
  );

  useEffect(() => {
    if (tabParam === "orders") setActiveTabState("orders");
    if (tabParam === "cart") setActiveTabState("cart");
  }, [tabParam]);

  const setActiveTab = useCallback(
    (next: "orders" | "cart") => {
      setActiveTabState(next);
      if (next === "orders") {
        router.replace("/cart?tab=orders", { scroll: false });
      } else {
        router.replace("/cart?tab=cart", { scroll: false });
      }
    },
    [router]
  );

  const { items, cartTotal, clearCart } = useCart();

  const shipping =
    cartTotal >= FREE_SHIPPING_MINIMUM_GTQ ? 0 : SHIPPING_STANDARD_GTQ;
  const total = cartTotal + shipping;

  const cartTabBody =
    items.length === 0 ? (
      <AccountEmptyState
        icon={ShoppingBag}
        eyebrow="Tu selección"
        title="Tu carrito está vacío"
        description="Explora la tienda, elige colores y talla, y vuelve aquí para finalizar tu pedido cuando quieras."
        primaryAction={{ href: "/products", label: "Ver tienda" }}
      />
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <span className="text-[11px] uppercase tracking-widest text-muted">
              {items.length} {items.length === 1 ? "artículo" : "artículos"}
            </span>
            <button
              type="button"
              onClick={clearCart}
              className="text-[10px] uppercase tracking-widest text-muted hover:text-accent transition-colors font-bold"
            >
              Vaciar carrito
            </button>
          </div>

          <div>
            {items.map((item) => (
              <CartItem
                key={`${item.product.id}-${item.selectedColor.name}-${item.selectedSize}`}
                item={item}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-surface border border-border p-6 sticky top-24">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text mb-6">
              Resumen del pedido
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Subtotal</span>
                <span className="text-sm font-bold text-text">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Envío</span>
                <span className="text-sm font-bold text-text">
                  {shipping === 0 ? (
                    <span className="text-green-500">Gratis</span>
                  ) : (
                    formatPriceDecimal(shipping)
                  )}
                </span>
              </div>

              {shipping > 0 && (
                <div className="text-[11px] text-muted bg-surface-2 px-3 py-2.5 border-l-2 border-accent">
                  Añade{" "}
                  <span className="text-text font-bold">
                    {formatPrice(FREE_SHIPPING_MINIMUM_GTQ - cartTotal)}
                  </span>{" "}
                  más para envío gratis
                </div>
              )}

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-text">
                  Total
                </span>
                <span className="text-xl font-black text-text">
                  {formatPriceDecimal(total)}
                </span>
              </div>
            </div>

            <Button size="lg" className="w-full" asChild>
              <Link href="/checkout">
                Ir al pago
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-[10px] uppercase tracking-widest text-muted text-center mb-3">
                Pago seguro
              </p>
              <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-faint">
                <span>Visa</span>
                <span>·</span>
                <span>Mastercard</span>
                <span>·</span>
                <span>Amex</span>
                <span>·</span>
                <span>PayPal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-accent mb-1">
            Tu cuenta
          </p>
          <h1 className="font-black uppercase text-4xl sm:text-5xl tracking-tighter text-text leading-none">
            Carrito y pedidos
          </h1>
        </div>
        <Link
          href="/products"
          className="hidden sm:flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted hover:text-text transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3 h-3" />
          Seguir comprando
        </Link>
      </div>

      <div className="flex gap-1 border-b border-border mb-10 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab("cart")}
          className={cn(
            "flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition-colors border-b-2 -mb-px",
            activeTab === "cart"
              ? "border-accent text-text"
              : "border-transparent text-muted hover:text-text"
          )}
        >
          Carrito
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={cn(
            "flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition-colors border-b-2 -mb-px",
            activeTab === "orders"
              ? "border-accent text-text"
              : "border-transparent text-muted hover:text-text"
          )}
        >
          Mis pedidos
        </button>
      </div>

      {activeTab === "cart" ? cartTabBody : <MyOrdersPanel />}
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AccountPanelLoading label="Cargando…" />
        </div>
      }
    >
      <CartPageInner />
    </Suspense>
  );
}
