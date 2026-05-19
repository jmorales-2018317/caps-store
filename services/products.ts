import type { SupabaseClient } from "@supabase/supabase-js";
import {
  PRODUCT_SELECT,
  mapProductRow,
  type ProductRow,
} from "@/lib/supabase/mappers";
import type { Product } from "@/types";

export type GetProductsParams = {
  featured?: boolean;
  limit?: number;
};

export async function getProducts(
  supabase: SupabaseClient,
  params: GetProductsParams = {}
): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  if (params.featured) query = query.eq("featured", true);
  if (params.limit) query = query.limit(params.limit);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as ProductRow[]).map(mapProductRow);
}

export async function getProductsByIds(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Product[]> {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return [];

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .in("id", uniqueIds);

  if (error) throw new Error(error.message);

  const byId = new Map(
    ((data ?? []) as ProductRow[]).map((row) => [row.id, mapProductRow(row)])
  );

  return uniqueIds.flatMap((id) => {
    const product = byId.get(id);
    return product ? [product] : [];
  });
}

export async function getProductById(
  supabase: SupabaseClient,
  id: string
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .single();

  if (error) return null;
  return mapProductRow(data as ProductRow);
}

export async function getRelatedProducts(
  supabase: SupabaseClient,
  excludeId: string,
  hatStyleId: string,
  limit = 4
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .neq("id", excludeId);

  if (error) throw new Error(error.message);
  return ((data ?? []) as ProductRow[])
    .filter((r) => r.hat_style_id === hatStyleId)
    .slice(0, limit)
    .map(mapProductRow);
}
