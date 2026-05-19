"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Star } from "lucide-react";
import { ProductBadge } from "@/components/ui/product-badge";
import { useCart } from "@/context/CartContext";
import { getProductCardBadges } from "@/lib/product-badges";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.colors[0], product.sizes[0]);
  }

  const discountPct = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : null;

  const cardBadges = getProductCardBadges(product);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block"
    >
      {/* Image container */}
      <div className="relative aspect-3/4 bg-surface overflow-hidden mb-4">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {cardBadges.length > 0 ? (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {cardBadges.map((b) => (
              <ProductBadge key={b.key} type={b.type} />
            ))}
          </div>
        ) : null}

        {/* Discount % */}
        {discountPct && (
          <div className="absolute top-3 right-3 z-10 bg-accent text-bg text-[10px] font-black px-2 py-0.5">
            -{discountPct}%
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-bg/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
          <button
            onClick={handleQuickAdd}
            className="flex items-center gap-2 bg-accent text-bg text-[10px] font-black uppercase tracking-widest px-5 py-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-accent-hover"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Añadir rápido
          </button>
        </div>

        {/* Color dots */}
        {product.colors.length > 1 && (
          <div className="absolute bottom-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color.name}
                title={color.name}
                className="w-3 h-3 rounded-full border border-white/20 ring-1 ring-offset-1 ring-offset-bg ring-transparent"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="space-y-1.5">
        {/* Category tag */}
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
          {product.hat_style.label}
        </p>

        {/* Name */}
        <h3 className="text-sm font-bold text-text group-hover:text-accent transition-colors duration-200 leading-tight">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
