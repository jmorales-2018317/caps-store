import type { SupabaseClient } from "@supabase/supabase-js";
import { mapHatStyleRow, type HatStyleRow } from "@/lib/supabase/mappers";
import type { HatStyle } from "@/types";

export type HatStyleWithCount = HatStyle & { count: number };

export async function getStyles(
  supabase: SupabaseClient
): Promise<HatStyle[]> {
  const { data, error } = await supabase.from("hat_styles").select("*");
  if (error) throw new Error(error.message);
  return ((data ?? []) as HatStyleRow[]).map(mapHatStyleRow);
}

export async function getStyleById(
  supabase: SupabaseClient,
  id: string
): Promise<HatStyle | null> {
  const { data, error } = await supabase
    .from("hat_styles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapHatStyleRow(data as HatStyleRow);
}

export async function getStylesWithCount(
  supabase: SupabaseClient
): Promise<HatStyleWithCount[]> {
  const [{ data: hatStyleRows }, { data: styleCountRows }] = await Promise.all([
    supabase.from("hat_styles").select("*"),
    supabase.from("products").select("hat_style_id"),
  ]);

  const counts = ((styleCountRows ?? []) as { hat_style_id: string }[]).reduce<
    Record<string, number>
  >((acc, row) => {
    acc[row.hat_style_id] = (acc[row.hat_style_id] ?? 0) + 1;
    return acc;
  }, {});

  return ((hatStyleRows ?? []) as HatStyleRow[]).map((row) => ({
    ...mapHatStyleRow(row),
    count: counts[row.id] ?? 0,
  }));
}
