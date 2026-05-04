import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DISCOUNT_SELECT,
  mapDiscountJoinedRow,
  type DiscountJoinedRow,
} from "@/lib/supabase/mappers";
import type { Discount } from "@/types";

export async function getDiscounts(
  supabase: SupabaseClient
): Promise<Discount[]> {
  const { data, error } = await supabase
    .from("discounts")
    .select(DISCOUNT_SELECT)
    .order("start_date", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as DiscountJoinedRow[]).map(mapDiscountJoinedRow);
}
