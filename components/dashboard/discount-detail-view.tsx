import type { Discount } from "@/types";

type DiscountDetailViewProps = {
  discount: Discount;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function DiscountDetailView({ discount }: DiscountDetailViewProps) {
  const products = discount.products ?? [];
  const valueLabel =
    discount.type === "percentage"
      ? `${discount.value}%`
      : new Intl.NumberFormat("es-GT", {
          style: "currency",
          currency: "GTQ",
        }).format(discount.value);

  return (
    <section className="space-y-6 rounded-xl border border-border bg-surface p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Tipo</p>
          <p className="mt-1 text-sm text-text">
            {discount.type === "percentage" ? "Porcentaje" : "Monto fijo"}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Valor</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-text">{valueLabel}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Inicio</p>
          <p className="mt-1 text-sm text-text">{formatDate(discount.start_date)}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Fin</p>
          <p className="mt-1 text-sm text-text">{formatDate(discount.end_date)}</p>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
          Descripcion
        </p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
          {discount.description?.trim() || "Sin descripcion."}
        </p>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
          Productos vinculados
        </p>
        {products.length === 0 ? (
          <p className="mt-1 text-sm text-muted">Ningun producto asociado.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {products.map((p) => (
              <li key={p.id} className="text-sm text-text">
                {p.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
