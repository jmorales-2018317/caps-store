import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeOrderStatus } from "@/lib/order-status";
import type { Order, OrderItem, OrderWithItems } from "@/types";

type OrderRow = Omit<Order, "contact_phone" | "address" | "city" | "state"> & {
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
};

function mapOrderRow(row: OrderRow): Order {
  return {
    ...row,
    status: normalizeOrderStatus(row.status),
    contact_phone: row.contact_phone ?? undefined,
    address: row.address ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
  };
}

function mapOrderItemRow(row: Record<string, unknown>): OrderItem {
  return {
    id: String(row.id),
    order_id: String(row.order_id),
    product_id: String(row.product_id),
    product_name: String(row.product_name),
    color_name: row.color_name != null ? String(row.color_name) : undefined,
    color_hex: row.color_hex != null ? String(row.color_hex) : undefined,
    size: row.size != null ? String(row.size) : undefined,
    quantity: Number(row.quantity),
    unit_price: Number(row.unit_price),
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

export async function getOrderById(
  supabase: SupabaseClient,
  id: string
): Promise<OrderWithItems | null> {
  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (orderError || !orderRow) return null;

  const order = mapOrderRow(orderRow as OrderRow);

  const { data: itemRows, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  if (itemsError) throw new Error(itemsError.message);

  const items = (itemRows ?? []).map((raw) =>
    mapOrderItemRow(raw as Record<string, unknown>)
  );

  return { ...order, items };
}

export async function getMyOrders(supabase: SupabaseClient): Promise<OrderWithItems[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  /** Por user_id (pedidos nuevos con cuenta). */
  const byUserId = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (byUserId.error) throw new Error(byUserId.error.message);

  /** Pedidos sin user_id pero mismo correo que la cuenta (legacy o sesión perdida al crear). */
  const email = user.email?.trim();
  let legacy: OrderRow[] = [];

  if (email) {
    const legacyRes = await supabase
      .from("orders")
      .select("*")
      .is("user_id", null)
      .ilike("contact_email", email)
      .order("created_at", { ascending: false });

    if (legacyRes.error) throw new Error(legacyRes.error.message);
    legacy = legacyRes.data ?? [];
  }

  const merged = new Map<string, OrderRow>();
  for (const row of [...(byUserId.data ?? []), ...legacy]) {
    merged.set(row.id as string, row as OrderRow);
  }

  const ordersSorted = Array.from(merged.values()).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const mapped = ordersSorted.map(mapOrderRow);
  const ids = mapped.map((o) => o.id);
  if (ids.length === 0) return [];

  const { data: itemRows, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", ids);

  if (itemsError) throw new Error(itemsError.message);

  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const raw of itemRows ?? []) {
    const item = mapOrderItemRow(raw as Record<string, unknown>);
    const list = itemsByOrder.get(item.order_id) ?? [];
    list.push(item);
    itemsByOrder.set(item.order_id, list);
  }

  return mapped.map((o) => ({
    ...o,
    items: itemsByOrder.get(o.id) ?? [],
  }));
}
