"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  CreditCard,
  MoveRight,
  Shield,
  ShoppingBag,
  Store,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { AccountPanelLoading } from "@/components/cart/AccountEmptyState";
import { CartItem } from "@/components/cart/CartItem";
import { MyOrdersPanel } from "@/components/cart/MyOrdersPanel";
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

  const savings = items.reduce((sum, item) => {
    const original = item.product.originalPrice;
    if (original == null || original <= item.product.price) return sum;
    return sum + (original - item.product.price) * item.quantity;
  }, 0);

  const shipping =
    cartTotal >= FREE_SHIPPING_MINIMUM_GTQ ? 0 : SHIPPING_STANDARD_GTQ;
  const total = cartTotal + shipping;

  const cartTabBody =
    items.length === 0 ? (
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1">
          <Card className="border-dashed border-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="text-muted-foreground/50 mb-4 size-12" />
              <h3 className="text-lg font-medium text-foreground">
                Tu carrito está vacío
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Explora la tienda y añade gorras a tu selección
              </p>
              <Button
                className="mt-4 h-9 cursor-pointer px-4 py-2"
                variant="outline"
                asChild
              >
                <Link href="/products">Ver tienda</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    ) : (
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
          <Card className="sticky top-4 gap-0 border-border">
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
                  <span
                    className={cn(shipping === 0 && "font-medium text-green-500")}
                  >
                    {shipping === 0 ? "Gratis" : formatPriceDecimal(shipping)}
                  </span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-sm font-medium">
                    <span>Ahorras</span>
                    <span className="text-green-500">
                      -{formatPriceDecimal(savings)}
                    </span>
                  </div>
                )}
              </div>

              {shipping > 0 && (
                <p className="text-muted-foreground border-accent border-l-2 bg-muted/30 px-3 py-2 text-xs">
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

              <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
                <CreditCard className="size-3.5 shrink-0" />
                <span>Pago seguro con cifrado SSL</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed border-border py-4">
            <CardContent className="px-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100/10 text-amber-500">
                  <Shield className="size-5" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Pago seguro</h4>
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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-2 text-center">
        <p className="text-accent text-[11px] font-black uppercase tracking-[0.3em]">
          Tu cuenta
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Carrito y pedidos
        </h1>
        {activeTab === "cart" && items.length > 0 && (
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? "artículo" : "artículos"} en tu
            carrito •{" "}
            <span className="text-foreground font-semibold">
              {formatPrice(cartTotal)}
            </span>
          </p>
        )}
        {activeTab === "cart" && items.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Revisa tus artículos antes de pagar
          </p>
        )}
      </div>

      <div className="mb-8 flex max-w-md gap-1 border-b border-border mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab("cart")}
          className={cn(
            "flex-1 cursor-pointer border-b-2 py-3 text-sm font-semibold transition-colors -mb-px",
            activeTab === "cart"
              ? "border-accent text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Carrito
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={cn(
            "flex-1 cursor-pointer border-b-2 py-3 text-sm font-semibold transition-colors -mb-px",
            activeTab === "orders"
              ? "border-accent text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
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
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <AccountPanelLoading label="Cargando…" />
        </div>
      }
    >
      <CartPageInner />
    </Suspense>
  );
}
