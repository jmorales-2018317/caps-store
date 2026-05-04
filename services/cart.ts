import type { SupabaseClient } from "@supabase/supabase-js";
import { mapProductRow } from "@/lib/supabase/mappers";
import type { CartItem } from "@/types";

const STORAGE_KEY = "cart_session_id";

export async function getOrCreateCartSession(
  supabase: SupabaseClient
): Promise<string | null> {
  let sid = localStorage.getItem(STORAGE_KEY);

  if (sid) {
    const { data: existing, error } = await supabase
      .from("cart_sessions")
      .select("id")
      .eq("id", sid)
      .maybeSingle();

    if (error) {
      console.error("cart session lookup:", error);
      return sid;
    }
    if (existing) {
      return sid;
    }
    localStorage.removeItem(STORAGE_KEY);
    sid = null;
  }

  const { data, error: insertError } = await supabase
    .from("cart_sessions")
    .insert({})
    .select("id")
    .single();

  if (insertError) {
    console.error("cart session create:", insertError);
    return null;
  }
  if (!data) {
    return null;
  }

  const newId = data.id as string;
  localStorage.setItem(STORAGE_KEY, newId);
  return newId;
}

export async function getCartItems(
  supabase: SupabaseClient,
  sessionId: string
): Promise<CartItem[]> {
  const { data: cartData } = await supabase
    .from("cart_items")
    .select("*, product:products(*)")
    .eq("session_id", sessionId);

  if (!cartData) return [];

  return cartData
    .filter((row) => row.product !== null)
    .map((row) => ({
      product: mapProductRow(row.product),
      quantity: row.quantity as number,
      selectedColor: {
        name: row.color_name as string,
        hex: row.color_hex as string,
      },
      selectedSize: row.size as string,
    }));
}

export { STORAGE_KEY };
