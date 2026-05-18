import type { OrderWithItems } from "@/types";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatPrice } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type OrderDetailViewProps = {
  order: OrderWithItems;
};

function formatDate(raw: string) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString("es-GT", { dateStyle: "medium", timeStyle: "short" });
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const items = order.items ?? [];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Estado</p>
          <div className="mt-2">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Cliente</p>
          <p className="mt-1 text-sm text-text">{order.contact_name}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Email</p>
          <p className="mt-1 text-sm text-text">{order.contact_email}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Telefono</p>
          <p className="mt-1 text-sm text-text">{order.contact_phone ?? "—"}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Envio</p>
          <p className="mt-1 text-sm text-text">{order.shipping_method}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Creada</p>
          <p className="mt-1 text-sm text-text">{formatDate(order.created_at)}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Direccion</p>
          <p className="mt-1 text-sm text-text">
            {[order.address, order.city, order.state].filter(Boolean).join(", ") || "—"}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap gap-6 border-b border-border pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Subtotal</p>
            <p className="mt-1 font-semibold tabular-nums">{formatPrice(order.subtotal)}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Envio</p>
            <p className="mt-1 font-semibold tabular-nums">{formatPrice(order.shipping_cost)}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Total</p>
            <p className="mt-1 text-lg font-black tabular-nums text-accent">
              {formatPrice(order.total)}
            </p>
          </div>
        </div>

        <h2 className="mt-4 text-sm font-semibold text-text">Lineas del pedido</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Cant.</TableHead>
                <TableHead className="text-right">Precio unit.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted">
                    Sin lineas registradas.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="font-medium">{item.product_name}</span>
                      {(item.color_name || item.size) && (
                        <p className="text-xs text-muted">
                          {[item.color_name, item.size].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(item.unit_price * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
