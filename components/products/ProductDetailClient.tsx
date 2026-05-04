"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ShoppingBag,
  Star,
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { getProductCardBadges } from "@/lib/product-badges";
import {
  formatPrice,
  FREE_SHIPPING_MINIMUM_GTQ,
  cn,
} from "@/lib/utils";
import type { ProductColor } from "@/types";
import { useProduct } from "@/hooks/use-products";
import { useQuery } from "@tanstack/react-query";
import { getRelatedProducts } from "@/services/products";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";

interface ProductDetailClientProps {
  productId: string;
}

export function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const { data: p, isLoading } = useProduct(productId);

  const { data: related = [] } = useQuery({
    queryKey: [...queryKeys.products.detail(productId), "related"] as const,
    queryFn: () =>
      getRelatedProducts(createClient(), productId, p!.hat_style.id),
    enabled: !!p?.hat_style.id,
  });

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(
    undefined
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addItem } = useCart();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center">
        <div className="flex flex-col gap-3 w-full max-w-2xl">
          <div className="h-4 w-48 bg-surface-2 animate-pulse" />
          <div className="h-10 w-72 bg-surface-2 animate-pulse" />
          <div className="aspect-square w-full max-w-sm bg-surface-2 animate-pulse mt-6" />
        </div>
      </div>
    );
  }

  if (!p) {
    notFound();
    return null;
  }

  const activeColor = selectedColor ?? p.colors[0];
  const activeSize = selectedSize ?? p.sizes[0];

  function handleAddToCart() {
    addItem(p!, activeColor, activeSize);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  const discountPct = p.originalPrice
    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
    : null;

  const detailBadges = getProductCardBadges(p);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-10 text-[11px] uppercase tracking-widest">
        <Link href="/" className="text-muted hover:text-text transition-colors">
          Inicio
        </Link>
        <ChevronRight className="w-3 h-3 text-faint" />
        <Link
          href="/products"
          className="text-muted hover:text-text transition-colors"
        >
          Tienda
        </Link>
        <ChevronRight className="w-3 h-3 text-faint" />
        <Link
          href={`/products?style=${p.hat_style.id}`}
          className="text-muted hover:text-text transition-colors"
        >
          {p.hat_style.label}
        </Link>
        <ChevronRight className="w-3 h-3 text-faint" />
        <span className="text-text truncate max-w-[150px]">{p.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square bg-surface overflow-hidden">
            <Image
              src={p.images[selectedImage]}
              alt={p.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {detailBadges.length > 0 ? (
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {detailBadges.map((b) => (
                  <Badge key={b.key} type={b.type} />
                ))}
              </div>
            ) : null}
          </div>

          {p.images.length > 1 && (
            <div className="flex gap-2">
              {p.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative w-20 h-20 overflow-hidden border-2 transition-colors duration-200",
                    selectedImage === i
                      ? "border-accent"
                      : "border-border hover:border-muted"
                  )}
                >
                  <Image
                    src={img}
                    alt={`${p.name} view ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="lg:pt-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-bold">
              {p.hat_style.label}
            </p>
          </div>

          <h1 className="font-black uppercase text-3xl sm:text-4xl tracking-tighter text-text leading-tight mb-4">
            {p.name}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-black text-text">
              {formatPrice(p.price)}
            </span>
            {p.originalPrice && (
              <span className="text-lg text-muted line-through">
                {formatPrice(p.originalPrice)}
              </span>
            )}
            {discountPct && (
              <span className="text-xs font-black text-bg bg-accent px-2 py-0.5">
                -{discountPct}%
              </span>
            )}
          </div>

          <p className="text-sm text-muted leading-relaxed mb-8 border-t border-border pt-6">
            {p.description}
          </p>

          {/* Color selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text">
                Color
              </p>
              <span className="text-[11px] text-muted">
                {activeColor.name}
              </span>
            </div>
            <div className="flex gap-2.5">
              {p.colors.map((color) => (
                <button
                  key={color.name}
                  title={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-8 h-8 transition-all duration-200",
                    activeColor.name === color.name
                      ? "ring-2 ring-accent ring-offset-2 ring-offset-bg"
                      : "ring-1 ring-border hover:ring-muted"
                  )}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>

          {/* Size selector */}
          {p.sizes.length > 1 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text">
                  Talla
                </p>
                <button className="text-[10px] uppercase tracking-widest text-accent hover:text-accent-hover transition-colors font-bold">
                  Guía de tallas
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "min-w-[48px] px-3 py-2 text-xs font-bold border transition-all duration-200",
                      activeSize === size
                        ? "border-text bg-text text-bg"
                        : "border-border text-muted hover:border-muted hover:text-text"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + CTA */}
          <div className="flex items-stretch gap-3 mb-6">
            <div className="flex items-center border border-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-full flex items-center justify-center text-muted hover:text-text transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center text-sm font-bold text-text">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-full flex items-center justify-center text-muted hover:text-text transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <Button
              size="lg"
              onClick={handleAddToCart}
              className={cn(
                "flex-1 transition-all duration-300",
                addedToCart && "bg-green-600 hover:bg-green-600"
              )}
            >
              {addedToCart ? (
                <>
                  <Check className="w-4 h-4" />
                  Añadido al carrito
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Añadir al carrito
                </>
              )}
            </Button>
          </div>

          {/* Trust signals */}
          <div className="border-t border-border pt-6 space-y-2.5">
            {[
              `Envío gratis en pedidos superiores a Q${FREE_SHIPPING_MINIMUM_GTQ}`,
              "Devoluciones gratuitas en 30 días",
              "Autenticidad garantizada",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="w-1 h-1 rounded-full bg-accent shrink-0" />
                <p className="text-[11px] text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-24 pt-12 border-t border-border">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-black uppercase text-2xl sm:text-3xl tracking-tighter text-text">
              También te puede gustar
            </h2>
            <Link
              href="/products"
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted hover:text-text transition-colors"
            >
              <ArrowLeft className="w-3 h-3 rotate-180" />
              Todos los productos
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
