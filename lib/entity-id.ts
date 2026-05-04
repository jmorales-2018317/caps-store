import type { SupabaseClient } from "@supabase/supabase-js";

/** Convierte un nombre/etiqueta en un id tipo `dad-hat` o `gorras-deportivas`. */
export function slugifyEntityId(source: string): string {
  const s = source
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  if (s.length > 0) return s;
  return `id-${Date.now()}`;
}

type IdTable = "categories" | "hat_styles" | "products";

/**
 * Garantiza un `id` unico en la tabla. Si el base ya existe, prueba
 * `base-2`, `base-3`, etc.
 */
export async function ensureUniqueEntityId(
  supabase: SupabaseClient,
  table: IdTable,
  baseId: string
): Promise<string> {
  let candidate = baseId;
  let n = 2;
  for (;;) {
    const { data } = await supabase
      .from(table)
      .select("id")
      .eq("id", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${baseId}-${n}`;
    n += 1;
    if (n > 500) {
      return `${baseId}-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
    }
  }
}
