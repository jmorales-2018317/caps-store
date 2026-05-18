import Image from "next/image";

type CatalogEntityDetailViewProps = {
  label: string;
  description?: string;
  image?: string;
};

export function CatalogEntityDetailView({
  label,
  description,
  image,
}: CatalogEntityDetailViewProps) {
  return (
    <section className="grid gap-6 rounded-xl border border-border bg-surface p-5 lg:grid-cols-[240px_1fr]">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-surface-2">
        {image ? (
          <Image
            src={image}
            alt={label}
            fill
            className="object-cover"
            sizes="240px"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted">
            Sin imagen
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
            Nombre
          </p>
          <p className="mt-1 text-lg font-semibold text-text">{label}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
            Descripcion
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
            {description?.trim() || "Sin descripcion."}
          </p>
        </div>
      </div>
    </section>
  );
}
