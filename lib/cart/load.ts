import type { SupabaseClient } from "@supabase/supabase-js";
import { hydrateCartItems, pruneOrphanLines } from "@/lib/cart/hydrate";
import { readCartLines, writeCartLines } from "@/lib/cart/storage";
import { getProductsByIds } from "@/services/products";
import type { CartItem } from "@/types";

export async function loadHydratedCart(
  supabase: SupabaseClient
): Promise<CartItem[]> {
  const lines = readCartLines();
  if (lines.length === 0) return [];

  const productIds = [...new Set(lines.map((l) => l.productId))];
  const products = await getProductsByIds(supabase, productIds);

  const pruned = pruneOrphanLines(lines, products);
  if (pruned.length !== lines.length) {
    writeCartLines(pruned);
  }

  return hydrateCartItems(pruned, products);
}
