"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, Search } from "lucide-react";
import { ProductGrid } from "@/components/products/ProductGrid";
import { FiltersSidebar } from "@/components/products/FiltersSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { isProductOnSale, isProductRecent } from "@/lib/product-badges";
import type { SortOption, Product } from "@/types";
import { useProducts } from "@/hooks/use-products";
import { useStyles } from "@/hooks/use-styles";
import { useCategories } from "@/hooks/use-categories";

function productMatchesQuery(product: Product, raw: string): boolean {
  const q = raw.trim().toLowerCase();
  if (!q) return true;
  const blob = [
    product.name,
    product.description,
    product.hat_style.label,
    product.hat_style.id,
    ...product.categories.map((c) => c.label),
    ...product.colors.map((c) => c.name),
  ]
    .join(" ")
    .toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  return terms.every((t) => blob.includes(t));
}

export function ProductsContent() {
  const { data: initialProducts = [] } = useProducts();
  const { data: hatStyles = [] } = useStyles();
  const { data: categories = [] } = useCategories();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const selectedStyle = searchParams.get("style") ?? "";
  const selectedCategory = searchParams.get("category") ?? "";
  const selectedPrice = searchParams.get("price");
  const sortBy = (searchParams.get("sort") as SortOption) ?? "newest";
  const filterReciente =
    searchParams.get("reciente") === "1" ||
    searchParams.get("badge") === "new";
  const filterOferta =
    searchParams.get("oferta") === "1" ||
    searchParams.get("badge") === "sale";

  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("q") ?? ""
  );
  const paramsSnapshot = useRef(searchParams.toString());
  const skipSearchInputSyncFromUrl = useRef(false);

  paramsSnapshot.current = searchParams.toString();

  const qParam = searchParams.get("q") ?? "";
  useEffect(() => {
    if (skipSearchInputSyncFromUrl.current) {
      skipSearchInputSyncFromUrl.current = false;
      return;
    }
    setSearchInput(qParam);
  }, [qParam]);

  useEffect(() => {
    const trimmed = searchInput.trim();
    const current = (
      new URLSearchParams(paramsSnapshot.current).get("q") ?? ""
    ).trim();
    if (trimmed === current) return;

    const t = setTimeout(() => {
      const next = searchInput.trim();
      const params = new URLSearchParams(paramsSnapshot.current);
      const live = (params.get("q") ?? "").trim();
      if (next === live) return;
      if (next) {
        params.set("q", next);
      } else {
        params.delete("q");
      }
      skipSearchInputSyncFromUrl.current = true;
      const qs = params.toString();
      router.replace(qs ? `/products?${qs}` : "/products");
      paramsSnapshot.current = qs;
    }, 320);

    return () => clearTimeout(t);
  }, [searchInput, router]);

  const filtered = useMemo(() => {
    let result = [...initialProducts];

    if (selectedStyle) {
      result = result.filter((p) => p.hat_style.id === selectedStyle);
    }

    if (selectedCategory) {
      result = result.filter((p) =>
        p.categories.some((c) => c.id === selectedCategory)
      );
    }

    if (selectedPrice) {
      const [min, max] = selectedPrice.split("-").map(Number);
      result = result.filter((p) => p.price >= min && p.price <= max);
    }

    if (filterReciente) {
      result = result.filter((p) => isProductRecent(p));
    }

    if (filterOferta) {
      result = result.filter((p) => isProductOnSale(p));
    }

    if (searchInput.trim()) {
      result = result.filter((p) => productMatchesQuery(p, searchInput));
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest": {
        result.sort((a, b) => {
          const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
          const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
          return tb - ta;
        });
        break;
      }
      default:
        break;
    }

    return result;
  }, [
    initialProducts,
    selectedStyle,
    selectedCategory,
    selectedPrice,
    filterReciente,
    filterOferta,
    sortBy,
    searchInput,
  ]);

  const hasFilters =
    selectedStyle ||
    selectedCategory ||
    selectedPrice ||
    filterReciente ||
    filterOferta ||
    searchInput.trim();

  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`/products?${params.toString()}`);
  }

  // Active filter labels for display chips
  const activeStyleLabel = selectedStyle
    ? (hatStyles.find((s) => s.id === selectedStyle)?.label ?? selectedStyle)
    : null;
  const activeCategoryLabel = selectedCategory
    ? (categories.find((c) => c.id === selectedCategory)?.label ?? selectedCategory)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="mb-10">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-accent mb-2">
          Todos los estilos
        </p>
        <h1 className="font-black uppercase text-4xl sm:text-5xl tracking-tighter text-text leading-none">
          Tienda
        </h1>

        <div className="relative mt-8 max-w-xl">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <Input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nombre, estilo, categoría o color…"
            aria-label="Buscar productos"
            className="py-3.5 pl-11 pr-11"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                const params = new URLSearchParams(searchParams.toString());
                params.delete("q");
                const qs = params.toString();
                skipSearchInputSyncFromUrl.current = true;
                router.push(qs ? `/products?${qs}` : "/products");
                paramsSnapshot.current = qs;
              }}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-text transition-colors"
            >
              Limpiar
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex gap-12">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-52 shrink-0 sticky top-24 self-start">
          <FiltersSidebar hatStyles={hatStyles} categories={categories} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted hover:text-text transition-colors border border-border px-4 py-2.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filtros
                {hasFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                )}
              </button>

              {/* Active filter chips */}
              {searchInput.trim() && (
                <span className="hidden sm:flex max-w-[200px] items-center gap-1.5 truncate border border-border px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-text">
                  Búsqueda: {searchInput.trim()}
                </span>
              )}
              {activeStyleLabel && (
                <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest border border-border px-3 py-2 text-text">
                  {activeStyleLabel}
                </span>
              )}
              {activeCategoryLabel && (
                <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest border border-border px-3 py-2 text-text">
                  {activeCategoryLabel}
                </span>
              )}
              {filterReciente && (
                <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest border border-border px-3 py-2 text-text">
                  Recién ingreso
                </span>
              )}
              {filterOferta && (
                <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest border border-border px-3 py-2 text-text">
                  En oferta
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[11px] text-muted hidden sm:block">
                {filtered.length}{" "}
                {filtered.length === 1 ? "producto" : "productos"}
              </span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="min-w-[220px] text-[11px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                  <SelectItem value="popular">Más populares</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ProductGrid products={filtered} />
        </div>
      </div>

      {/* Mobile filters overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-surface border-l border-border p-6 overflow-y-auto">
            <FiltersSidebar
              hatStyles={hatStyles}
              categories={categories}
              onClose={() => setMobileFiltersOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
