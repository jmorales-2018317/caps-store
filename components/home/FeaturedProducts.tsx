"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { useProducts } from "@/hooks/use-products";

export function FeaturedProducts() {
  const { data: products = [] } = useProducts({ featured: true, limit: 8 });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Header */}
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-accent mb-2">
            Selección destacada
          </p>
          <h2 className="font-black uppercase text-4xl sm:text-5xl tracking-tighter text-text leading-none">
            Destacados
          </h2>
        </div>
        <Link
          href="/products"
          className="hidden sm:flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted hover:text-text transition-colors duration-200"
        >
          Ver todo
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Mobile view all */}
      <div className="mt-10 text-center sm:hidden">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted hover:text-text transition-colors duration-200"
        >
          Ver todos los productos
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );
}
