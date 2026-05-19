import type { CartItem, CartLineRef, Product } from "@/types";

export function hydrateCartItems(
  lines: CartLineRef[],
  products: Product[]
): CartItem[] {
  const byId = new Map(products.map((p) => [p.id, p]));

  return lines.flatMap((line) => {
    const product = byId.get(line.productId);
    if (!product) return [];

    return [
      {
        product,
        quantity: line.quantity,
        selectedColor: { name: line.colorName, hex: line.colorHex },
        selectedSize: line.size,
      },
    ];
  });
}

export function pruneOrphanLines(
  lines: CartLineRef[],
  products: Product[]
): CartLineRef[] {
  const validIds = new Set(products.map((p) => p.id));
  return lines.filter((line) => validIds.has(line.productId));
}
