"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { CartItem } from "@/components/cart/CartItem";
import { Button } from "@/components/ui/button";
import {
  formatPrice,
  formatPriceDecimal,
  FREE_SHIPPING_MINIMUM_GTQ,
  SHIPPING_STANDARD_GTQ,
} from "@/lib/utils";

export default function CartPage() {
  const { items, cartTotal, clearCart } = useCart();

  const shipping =
    cartTotal >= FREE_SHIPPING_MINIMUM_GTQ ? 0 : SHIPPING_STANDARD_GTQ;
  const total = cartTotal + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 border border-border flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-muted" />
          </div>
          <h1 className="font-black uppercase text-3xl tracking-tighter text-text mb-3">
            Tu carrito está vacío
          </h1>
          <p className="text-sm text-muted mb-10">
            Aún no has añadido nada. Explora la colección.
          </p>
          <Button size="lg" asChild>
            <Link href="/products">
              Ver tienda
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-accent mb-1">
            Tu selección
          </p>
          <h1 className="font-black uppercase text-4xl sm:text-5xl tracking-tighter text-text leading-none">
            Carrito
          </h1>
        </div>
        <Link
          href="/products"
          className="hidden sm:flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Seguir comprando
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <span className="text-[11px] uppercase tracking-widest text-muted">
              {items.length} {items.length === 1 ? "artículo" : "artículos"}
            </span>
            <button
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

        {/* Order summary */}
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

            {/* Accepted payments */}
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
    </div>
  );
}
