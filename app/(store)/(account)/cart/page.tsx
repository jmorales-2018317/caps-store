"use client";

import Link from "next/link";
import {
  CreditCard,
  MoveRight,
  Shield,
  ShoppingBag,
  Store,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import {
  AccountEmptyState,
  AccountPanelLoading,
} from "@/components/cart/AccountEmptyState";
import { CartItem } from "@/components/cart/CartItem";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  cn,
  formatPrice,
  formatPriceDecimal,
  FREE_SHIPPING_MINIMUM_GTQ,
  SHIPPING_STANDARD_GTQ,
} from "@/lib/utils";

export default function CartPage() {
  const { items, cartTotal, clearCart, isLoading } = useCart();

  const savings = items.reduce((sum, item) => {
    const original = item.product.originalPrice;
    if (original == null || original <= item.product.price) return sum;
    return sum + (original - item.product.price) * item.quantity;
  }, 0);

  const shipping =
    cartTotal >= FREE_SHIPPING_MINIMUM_GTQ ? 0 : SHIPPING_STANDARD_GTQ;
  const total = cartTotal + shipping;

  if (isLoading) {
    return <AccountPanelLoading label="Cargando tu carrito…" />;
  }

  if (items.length === 0) {
    return (
      <AccountEmptyState
        icon={ShoppingBag}
        eyebrow="Tu selección"
        title="Tu carrito está vacío"
        description="Explora la tienda, elige colores y talla, y vuelve aquí para finalizar tu pedido cuando quieras."
        primaryAction={{ href: "/products", label: "Ver tienda" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={clearCart}
            className="text-muted-foreground hover:text-destructive cursor-pointer text-xs font-medium transition-colors"
          >
            Vaciar carrito
          </button>
        </div>

        {items.map((item) => (
          <CartItem
            key={`${item.product.id}-${item.selectedColor.name}-${item.selectedSize}`}
            item={item}
          />
        ))}
      </div>

      <div className="flex w-full flex-col gap-4 lg:w-96">
        <Card className="sticky top-4 gap-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Resumen del pedido</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPriceDecimal(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span className={cn(shipping === 0 && "text-green-500")}>
                  {shipping === 0 ? "Gratis" : formatPriceDecimal(shipping)}
                </span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-sm font-medium">
                  <span>Ahorras</span>
                  <span>-{formatPriceDecimal(savings)}</span>
                </div>
              )}
            </div>

            {shipping > 0 && (
              <p className="text-muted-foreground border-primary border-l-2 bg-muted/30 px-3 py-2 text-xs">
                Añade{" "}
                <span className="text-foreground font-semibold">
                  {formatPrice(FREE_SHIPPING_MINIMUM_GTQ - cartTotal)}
                </span>{" "}
                más para envío gratis
              </p>
            )}

            <Separator className="my-2" />

            <div className="flex items-center justify-between text-base font-medium">
              <span>Total</span>
              <div className="text-end">
                <p className="text-xl font-bold">{formatPriceDecimal(total)}</p>
                <p className="text-muted-foreground text-xs">
                  impuestos incluidos, si aplican
                </p>
              </div>
            </div>

            <Button
              size="lg"
              className="mt-4 h-10 w-full cursor-pointer px-8 text-base font-medium"
              asChild
            >
              <Link href="/checkout">
                <ShoppingBag />
                Ir al pago
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed py-4">
          <CardContent className="px-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Shield className="size-5" />
              </div>
              <div>
                <h4 className="font-medium">Pago seguro</h4>
                <p className="text-muted-foreground mt-1 text-xs">
                  Tu información de pago está cifrada y protegida.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="h-9 w-full cursor-pointer px-4 py-2"
          asChild
        >
          <Link href="/products">
            <Store />
            Seguir comprando
            <MoveRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
