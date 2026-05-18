import Image from "next/image";
import type { Product } from "@/types";

type ProductDetailViewProps = {
  product: Product;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(price);
}

function formatDate(raw?: string) {
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-GT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const images = product.images ?? [];
  const categories = product.categories ?? [];
  const discounts = product.discounts ?? [];

  return (
    <div className="space-y-6">
      {images.length > 0 ? (
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-text">Imagenes</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((src, index) => (
              <div key={`${src}-${index}`} className="space-y-1">
                <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-surface-2">
                  <Image
                    src={src}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 200px"
                  />
                </div>
                <p className="text-xs text-muted">
                  {index === 0 ? "Portada" : `Imagen ${index + 1}`}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 rounded-xl border border-border bg-surface p-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
              Precio
            </p>
            <p className="mt-1 text-2xl font-black tabular-nums text-text">
              {formatPrice(product.price)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
              Estilo
            </p>
            <p className="mt-1 text-sm text-text">{product.hat_style?.label ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
              Fecha de creacion
            </p>
            <p className="mt-1 text-sm text-text">{formatDate(product.created_at)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
              Descripcion
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
              {product.description?.trim() || "Sin descripcion."}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
              Categorias
            </p>
            {categories.length === 0 ? (
              <p className="mt-1 text-sm text-muted">—</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <span
                    key={c.id}
                    className="inline-block rounded border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted"
                  >
                    {c.label}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
              Descuentos
            </p>
            {discounts.length === 0 ? (
              <p className="mt-1 text-sm text-muted">—</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {discounts.map((d) => (
                  <span
                    key={d.id}
                    className="inline-block rounded border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted"
                  >
                    {d.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
