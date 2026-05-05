import type { SupabaseClient } from "@supabase/supabase-js";
import { mapProductRow } from "@/lib/supabase/mappers";
import type { CartItem } from "@/types";

const STORAGE_KEY = "cart_session_id";

async function mergeCartInto(
  supabase: SupabaseClient,
  targetSessionId: string,
  sourceSessionId: string
) {
  if (targetSessionId === sourceSessionId) return;

  const { data: sourceItems } = await supabase
    .from("cart_items")
    .select("id, product_id, color_name, color_hex, size, quantity")
    .eq("session_id", sourceSessionId);

  if (!sourceItems?.length) {
    await supabase.from("cart_sessions").delete().eq("id", sourceSessionId);
    return;
  }

  for (const row of sourceItems) {
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("session_id", targetSessionId)
      .eq("product_id", row.product_id as string)
      .eq("color_name", row.color_name as string)
      .eq("size", row.size as string)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({
          quantity: (existing.quantity as number) + (row.quantity as number),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        session_id: targetSessionId,
        product_id: row.product_id,
        color_name: row.color_name,
        color_hex: row.color_hex,
        size: row.size,
        quantity: row.quantity,
      });
    }
  }

  await supabase.from("cart_items").delete().eq("session_id", sourceSessionId);
  await supabase.from("cart_sessions").delete().eq("id", sourceSessionId);
}

async function mergeDuplicateUserSessions(
  supabase: SupabaseClient,
  userId: string,
  keepSessionId: string
) {
  const { data: sessions } = await supabase
    .from("cart_sessions")
    .select("id")
    .eq("user_id", userId);

  if (!sessions?.length) return;

  for (const s of sessions) {
    const id = s.id as string;
    if (id === keepSessionId) continue;
    await mergeCartInto(supabase, keepSessionId, id);
  }
}

export async function getOrCreateCartSession(
  supabase: SupabaseClient
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let sid = localStorage.getItem(STORAGE_KEY);

  if (user && sid) {
    const { error: claimErr } = await supabase
      .from("cart_sessions")
      .update({ user_id: user.id })
      .eq("id", sid)
      .is("user_id", null);

    if (!claimErr) {
      await mergeDuplicateUserSessions(supabase, user.id, sid);
    }
  }

  if (sid) {
    const { data: existing, error: lookupErr } = await supabase
      .from("cart_sessions")
      .select("id")
      .eq("id", sid)
      .maybeSingle();

    if (lookupErr) {
      console.error("cart session lookup:", lookupErr);
      return sid;
    }
    if (existing) {
      return sid;
    }

    localStorage.removeItem(STORAGE_KEY);
    sid = null;
  }

  if (user && !sid) {
    const { data: sessions } = await supabase
      .from("cart_sessions")
      .select("id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (sessions?.length) {
      const canonical = sessions[0]!.id as string;
      if (sessions.length > 1) {
        for (let i = 1; i < sessions.length; i++) {
          await mergeCartInto(
            supabase,
            canonical,
            sessions[i]!.id as string
          );
        }
      }
      localStorage.setItem(STORAGE_KEY, canonical);
      return canonical;
    }
  }

  const insertPayload =
    user != null ? ({ user_id: user.id } as Record<string, unknown>) : {};

  const { data, error: insertError } = await supabase
    .from("cart_sessions")
    .insert(insertPayload)
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
