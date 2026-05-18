import type { Product } from "@/types";

const RECENT_MS = 30 * 24 * 60 * 60 * 1000;

/** Producto creado en los últimos 30 días (requiere `created_at`). */
export function isProductRecent(product: Product): boolean {
  if (!product.created_at) return false;
  const t = new Date(product.created_at).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < RECENT_MS;
}

export function isProductOnSale(product: Product): boolean {
  return (
    product.originalPrice != null && product.originalPrice > product.price
  );
}

export type ProductCardBadge = { key: string; type: string };

/** Badges derivados para tarjetas y detalle (sin columna en BD). */
export function getProductCardBadges(product: Product): ProductCardBadge[] {
  const out: ProductCardBadge[] = [];
  if (isProductRecent(product)) {
    out.push({ key: "reciente", type: "reciente" });
  }
  return out;
}
