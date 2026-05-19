import { Suspense } from "react";
import { AccountPanelLoading } from "@/components/cart/AccountEmptyState";
import { MyOrdersPanel } from "@/components/cart/MyOrdersPanel";

export default function OrdersPage() {
  return (
    <Suspense
      fallback={<AccountPanelLoading label="Cargando pedidos…" />}
    >
      <MyOrdersPanel />
    </Suspense>
  );
}
