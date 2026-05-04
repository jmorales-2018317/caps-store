import type { SupabaseClient } from "@supabase/supabase-js";
import type { Order } from "@/types";

type OrderRow = Omit<Order, "contact_phone" | "address" | "city" | "state"> & {
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
};

function mapOrderRow(row: OrderRow): Order {
  return {
    ...row,
    contact_phone: row.contact_phone ?? undefined,
    address: row.address ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
  };
}

export async function getOrders(supabase: SupabaseClient): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as OrderRow[]).map(mapOrderRow);
}
