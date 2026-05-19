"use client";

import { StorefrontHero2 } from "@/components/storefront-hero-2";
import { useProducts } from "@/hooks/use-products";

export function Hero() {
  const { data: products = [], isLoading } = useProducts({ limit: 4 });

  return <StorefrontHero2 products={products} isLoading={isLoading} />;
}
