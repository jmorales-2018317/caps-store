import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DISCOUNT_LIST_SELECT,
  DISCOUNT_SELECT,
  mapDiscountJoinedRow,
  mapDiscountRow,
  type DiscountJoinedRow,
  type DiscountRow,
} from "@/lib/supabase/mappers";
import type { Discount } from "@/types";

export async function getDiscounts(
  supabase: SupabaseClient
): Promise<Discount[]> {
  const { data, error } = await supabase
    .from("discounts")
    .select(DISCOUNT_LIST_SELECT)
    .order("start_date", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as DiscountRow[]).map((row) => mapDiscountRow(row));
}

export async function getDiscountById(
  supabase: SupabaseClient,
  id: string
): Promise<Discount | null> {
  const { data, error } = await supabase
    .from("discounts")
    .select(DISCOUNT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapDiscountJoinedRow(data as DiscountJoinedRow);
}
