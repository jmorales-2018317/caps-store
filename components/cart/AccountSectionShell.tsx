"use client";

import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

function accountPageTitle(pathname: string): string {
  if (pathname === "/cart") return "Carrito";
  if (pathname === "/orders" || pathname.startsWith("/orders/")) {
    return "Mis pedidos";
  }
  return "Tu cuenta";
}

function CartSubtitle() {
  const { items, cartTotal, isLoading } = useCart();

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Cargando tu carrito…</p>
    );
  }

  if (items.length > 0) {
    return (
      <p className="text-muted-foreground">
        {items.length} {items.length === 1 ? "artículo" : "artículos"} en tu
        carrito •{" "}
        <span className="text-foreground font-semibold">
          {formatPrice(cartTotal)}
        </span>
      </p>
    );
  }

  return (
    <p className="text-muted-foreground text-sm">
      Revisa tus artículos antes de pagar
    </p>
  );
}

function AccountSubtitle() {
  const pathname = usePathname();

  if (pathname === "/cart") {
    return <CartSubtitle />;
  }

  if (pathname === "/orders" || pathname.startsWith("/orders/")) {
    return (
      <p className="text-muted-foreground text-sm">
        Revisa el estado y el detalle de tus compras anteriores
      </p>
    );
  }

  return null;
}

export function AccountSectionShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-2 text-center">
        <p className="text-primary text-[11px] font-black uppercase tracking-[0.3em]">
          Tu cuenta
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {accountPageTitle(pathname)}
        </h1>
        <AccountSubtitle />
      </div>

      {children}
    </div>
  );
}
