import type { SupabaseClient } from "@supabase/supabase-js";
import { mapCategoryRow, type CategoryRow } from "@/lib/supabase/mappers";
import type { Category } from "@/types";

export async function getCategories(
  supabase: SupabaseClient
): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) throw new Error(error.message);
  return ((data ?? []) as CategoryRow[]).map(mapCategoryRow);
}

export async function getCategoryById(
  supabase: SupabaseClient,
  id: string
): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapCategoryRow(data as CategoryRow);
}
