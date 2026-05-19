"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HatStyle, Category } from "@/types";

/** Filtros alineados con badges derivados (sin columna en BD). */
const collectionFilters = [
  { param: "reciente" as const, label: "Recién ingreso" },
  { param: "oferta" as const, label: "En oferta" },
];

const priceRanges = [
  { id: "0-350", label: "Menos de Q350" },
  { id: "350-450", label: "Q350 – Q450" },
  { id: "450-550", label: "Q450 – Q550" },
  { id: "550-9999", label: "Más de Q550" },
];

interface FiltersSidebarProps {
  hatStyles: HatStyle[];
  categories: Category[];
  onClose?: () => void;
}

export function FiltersSidebar({
  hatStyles,
  categories,
  onClose,
}: FiltersSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedStyle = searchParams.get("style") ?? "";
  const selectedCategory = searchParams.get("category") ?? "";
  const recienteOn = searchParams.get("reciente") === "1";
  const ofertaOn = searchParams.get("oferta") === "1";
  const selectedPrice = searchParams.get("price") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);
    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
  }, [pathname, router, searchParams]);

  const hasFilters =
    selectedStyle || selectedCategory || recienteOn || ofertaOn || selectedPrice;

  return (
    <aside className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text">
          Filtros
        </h2>
        <div className="flex items-center gap-3">
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-[10px] uppercase tracking-widest text-primary hover:text-primary/90 font-bold transition-colors"
            >
              Borrar todo
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-muted hover:text-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Estilo (hat_style) */}
        {hatStyles.length > 0 && (
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-4">
              Estilo
            </h3>
            <div className="space-y-2">
              {hatStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() =>
                    updateParam(
                      "style",
                      selectedStyle === style.id ? "" : style.id
                    )
                  }
                  className={cn(
                    "w-full flex items-center justify-between text-xs py-2 border-b border-border/50 transition-colors duration-150",
                    selectedStyle === style.id
                      ? "text-text font-bold"
                      : "text-muted hover:text-text"
                  )}
                >
                  <span>{style.label}</span>
                  {selectedStyle === style.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categoría temática */}
        {categories.length > 0 && (
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-4">
              Categoría
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    updateParam(
                      "category",
                      selectedCategory === cat.id ? "" : cat.id
                    )
                  }
                  className={cn(
                    "w-full flex items-center justify-between text-xs py-2 border-b border-border/50 transition-colors duration-150",
                    selectedCategory === cat.id
                      ? "text-text font-bold"
                      : "text-muted hover:text-text"
                  )}
                >
                  <span>{cat.label}</span>
                  {selectedCategory === cat.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-4">
            Colección
          </h3>
          <div className="space-y-2">
            {collectionFilters.map(({ param, label }) => {
              const isOn = param === "reciente" ? recienteOn : ofertaOn;
              return (
                <button
                  key={param}
                  type="button"
                  onClick={() =>
                    updateParam(param, isOn ? "" : "1")
                  }
                  className={cn(
                    "w-full flex items-center justify-between text-xs py-2 border-b border-border/50 transition-colors duration-150",
                    isOn ? "text-text font-bold" : "text-muted hover:text-text"
                  )}
                >
                  <span>{label}</span>
                  {isOn ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Precio */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-4">
            Precio
          </h3>
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <button
                key={range.id}
                onClick={() =>
                  updateParam(
                    "price",
                    selectedPrice === range.id ? "" : range.id
                  )
                }
                className={cn(
                  "w-full flex items-center justify-between text-xs py-2 border-b border-border/50 transition-colors duration-150",
                  selectedPrice === range.id
                    ? "text-text font-bold"
                    : "text-muted hover:text-text"
                )}
              >
                <span>{range.label}</span>
                {selectedPrice === range.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
