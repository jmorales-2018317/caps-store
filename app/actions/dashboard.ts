"use server";

import { ensureUniqueEntityId, slugifyEntityId } from "@/lib/entity-id";
import { createClient } from "@/lib/supabase/server";
import {
  mapProductRow,
  mapDiscountJoinedRow,
  PRODUCT_SELECT,
  DISCOUNT_SELECT,
  type CategoryRow,
  type DiscountJoinedRow,
  type HatStyleRow,
  type ProductRow,
} from "@/lib/supabase/mappers";
import { normalizeOrderStatus } from "@/lib/order-status";
import type {
  Category,
  Discount,
  DiscountType,
  HatStyle,
  Order,
  Product,
  Profile,
} from "@/types";

type MutationResult = {
  error?: string;
};

type PaginatedResult<T> = {
  data: T[];
  count: number;
  error?: string;
};

function mapCategoryRowForDashboard(row: CategoryRow): Category {
  return {
    id: row.id,
    label: row.label,
    image: row.image ?? undefined,
    description: row.description ?? undefined,
  };
}

function mapStyleRowForDashboard(row: HatStyleRow): HatStyle {
  return {
    id: row.id,
    label: row.label,
    image: row.image ?? undefined,
    description: row.description ?? undefined,
  };
}

function normalizePagination(page: number, pageSize: number) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 10;
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;
  return { safePage, safePageSize, from, to };
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("No autorizado");
  }

  return { supabase, user };
}

export async function getProductsPage(
  page: number,
  pageSize: number
): Promise<PaginatedResult<Product>> {
  const { from, to } = normalizePagination(page, pageSize);
  const supabase = await createClient();

  const { data, count, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return {
    data: ((data ?? []) as ProductRow[]).map(mapProductRow),
    count: count ?? 0,
  };
}

export async function updateProduct(input: {
  id: string;
  name: string;
  price: number;
  description: string;
  hat_style_id: string;
  categories: string[];
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  discount_ids: string[];
}): Promise<MutationResult> {
  try {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("products")
      .update({
        name: input.name,
        price: input.price,
        description: input.description,
        hat_style_id: input.hat_style_id,
        images: input.images,
        colors: input.colors,
        sizes: input.sizes,
      })
      .eq("id", input.id)
      .select("id");

    if (error) return { error: error.message };
    if (!data || data.length === 0) {
      return { error: "No se pudo actualizar el producto." };
    }

    const { error: deleteDiscountsError } = await supabase
      .from("product_discounts")
      .delete()
      .eq("product_id", input.id);
    if (deleteDiscountsError) return { error: deleteDiscountsError.message };

    const { error: deleteCategoriesError } = await supabase
      .from("product_categories")
      .delete()
      .eq("product_id", input.id);
    if (deleteCategoriesError) return { error: deleteCategoriesError.message };

    if (input.categories.length > 0) {
      const { error: insertCategoriesError } = await supabase
        .from("product_categories")
        .insert(
          input.categories.map((category_id) => ({
            product_id: input.id,
            category_id,
          }))
        );
      if (insertCategoriesError) return { error: insertCategoriesError.message };
    }

    if (input.discount_ids.length > 0) {
      const { error: insertDiscountsError } = await supabase
        .from("product_discounts")
        .insert(
          input.discount_ids.map((discount_id) => ({
            product_id: input.id,
            discount_id,
          }))
        );
      if (insertDiscountsError) return { error: insertDiscountsError.message };
    }

    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error inesperado" };
  }
}

export async function deleteProduct(id: string): Promise<MutationResult> {
  try {
    const { supabase } = await requireUser();
    await supabase.from("product_categories").delete().eq("product_id", id);

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return { error: error.message };

    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error inesperado" };
  }
}

export async function createProduct(input: {
  name: string;
  price: number;
  description: string;
  hat_style_id: string;
  categories: string[];
  discount_ids: string[];
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
}): Promise<MutationResult & { id?: string }> {
  try {
    const { supabase } = await requireUser();
    const productId = await ensureUniqueEntityId(
      supabase,
      "products",
      slugifyEntityId(input.name)
    );
    const { data: row, error } = await supabase
      .from("products")
      .insert({
        id: productId,
        name: input.name,
        price: input.price,
        description: input.description,
        hat_style_id: input.hat_style_id,
        images: input.images,
        colors: input.colors,
        sizes: input.sizes,
        original_price: null,
        featured: false,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    if (!row?.id) return { error: "No se pudo crear el producto." };

    if (input.categories.length > 0) {
      const { error: pcError } = await supabase.from("product_categories").insert(
        input.categories.map((category_id) => ({
          product_id: row.id,
          category_id,
        }))
      );
      if (pcError) return { error: pcError.message };
    }

    if (input.discount_ids.length > 0) {
      const { error: pdError } = await supabase.from("product_discounts").insert(
        input.discount_ids.map((discount_id) => ({
          product_id: row.id,
          discount_id,
        }))
      );
      if (pdError) return { error: pdError.message };
    }

    return { id: row.id };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error inesperado" };
  }
}

export async function getCategoriesPage(
  page: number,
  pageSize: number
): Promise<PaginatedResult<Category>> {
  const { from, to } = normalizePagination(page, pageSize);
  const supabase = await createClient();

  const { data, count, error } = await supabase
    .from("categories")
    .select("*", { count: "exact" })
    .range(from, to);

  if (error) return { data: [], count: 0, error: error.message };
  return {
    data: ((data ?? []) as CategoryRow[]).map(mapCategoryRowForDashboard),
    count: count ?? 0,
  };
}

export async function createCategory(input: {
  label: string;
  description: string | null;
  image: string | null;
}): Promise<MutationResult> {
  try {
    const { supabase } = await requireUser();
    const id = await ensureUniqueEntityId(
      supabase,
      "categories",
      slugifyEntityId(input.label)
    );
    const { data, error } = await supabase
      .from("categories")
      .insert({
        id,
        label: input.label,
        description: input.description,
        image: input.image,
      })
      .select("id");

    if (error) return { error: error.message };
    if (!data?.length) return { error: "No se pudo crear la categoria." };

    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error inesperado" };
  }
}

export async function updateCategory(input: {
  id: string;
  label: string;
  description: string | null;
  image: string | null;
}): Promise<MutationResult> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase
      .from("categories")
      .update({
        label: input.label,
        description: input.description,
        image: input.image,
      })
      .eq("id", input.id);

    if (error) return { error: error.message };
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error inesperado" };
  }
}

export async function deleteCategory(id: string): Promise<MutationResult> {
  try {
    const { supabase } = await requireUser();
    await supabase.from("product_categories").delete().eq("category_id", id);

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return { error: error.message };
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error inesperado" };
  }
}

export async function getStylesPage(
  page: number,
  pageSize: number
): Promise<PaginatedResult<HatStyle>> {
  const { from, to } = normalizePagination(page, pageSize);
  const supabase = await createClient();

  const { data, count, error } = await supabase
    .from("hat_styles")
    .select("*", { count: "exact" })
    .range(from, to);

  if (error) return { data: [], count: 0, error: error.message };
  return {
    data: ((data ?? []) as HatStyleRow[]).map(mapStyleRowForDashboard),
    count: count ?? 0,
  };
}

export async function createStyle(input: {
  label: string;
  description: string | null;
  image: string | null;
}): Promise<MutationResult> {
  try {
    const { supabase } = await requireUser();
    const id = await ensureUniqueEntityId(
      supabase,
      "hat_styles",
      slugifyEntityId(input.label)
    );
    const { data, error } = await supabase
      .from("hat_styles")
      .insert({
        id,
        label: input.label,
        description: input.description,
        image: input.image,
      })
      .select("id");

    if (error) return { error: error.message };
    if (!data?.length) return { error: "No se pudo crear el estilo." };

    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error inesperado" };
  }
}

export async function updateStyle(input: {
  id: string;
  label: string;
  description: string | null;
  image: string | null;
}): Promise<MutationResult> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase
      .from("hat_styles")
      .update({
        label: input.label,
        description: input.description,
        image: input.image,
      })
      .eq("id", input.id);
    if (error) return { error: error.message };
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error inesperado" };
  }
}

export async function deleteStyle(id: string): Promise<MutationResult> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.from("hat_styles").delete().eq("id", id);
    if (error) return { error: error.message };
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error inesperado" };
  }
}

export async function createDiscount(input: {
  name: string;
  description: string | null;
  value: number;
  type: DiscountType;
  start_date: string;
  end_date: string;
}): Promise<MutationResult> {
  try {
    const { supabase } = await requireUser();
    const { data: row, error } = await supabase
      .from("discounts")
      .insert({
        name: input.name,
        description: input.description,
        value: input.value,
        type: input.type,
        start_date: input.start_date,
        end_date: input.end_date,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    if (!row?.id) return { error: "No se pudo crear el descuento." };

    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error inesperado" };
  }
}

export async function updateDiscount(input: {
  id: string;
  name: string;
  description: string | null;
  value: number;
  type: DiscountType;
  start_date: string;
  end_date: string;
}): Promise<MutationResult> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase
      .from("discounts")
      .update({
        name: input.name,
        description: input.description,
        value: input.value,
        type: input.type,
        start_date: input.start_date,
        end_date: input.end_date,
      })
      .eq("id", input.id);

    if (error) return { error: error.message };
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error inesperado" };
  }
}

export async function deleteDiscount(id: string): Promise<MutationResult> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.from("discounts").delete().eq("id", id);
    if (error) return { error: error.message };
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error inesperado" };
  }
}

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

export async function getOrdersPage(
  page: number,
  pageSize: number
): Promise<PaginatedResult<Order>> {
  const { from, to } = normalizePagination(page, pageSize);
  const supabase = await createClient();

  const { data, count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return { data: [], count: 0, error: error.message };
  return {
    data: ((data ?? []) as OrderRow[]).map(mapOrderRow),
    count: count ?? 0,
  };
}

export async function updateOrder(input: {
  id: string;
  status: Order["status"];
  contact_name: string;
  address: string | null;
}): Promise<MutationResult> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase
      .from("orders")
      .update({
        status: input.status,
        contact_name: input.contact_name,
        address: input.address,
      })
      .eq("id", input.id);

    if (error) return { error: error.message };
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error inesperado" };
  }
}

export async function updateOrdersStatus(input: {
  ids: string[];
  status: Order["status"];
}): Promise<MutationResult> {
  if (input.ids.length === 0) {
    return { error: "No hay ordenes seleccionadas." };
  }

  try {
    const { supabase } = await requireUser();
    const { error } = await supabase
      .from("orders")
      .update({ status: input.status })
      .in("id", input.ids);

    if (error) return { error: error.message };
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error inesperado" };
  }
}

export async function deleteOrder(id: string): Promise<MutationResult> {
  try {
    const { supabase } = await requireUser();
    await supabase.from("order_items").delete().eq("order_id", id);
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return { error: error.message };
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error inesperado" };
  }
}

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  email?: string | null;
};

function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    role: row.role,
    email: row.email ?? null,
  };
}

export async function getProfilesPage(
  page: number,
  pageSize: number
): Promise<PaginatedResult<Profile>> {
  const { from, to } = normalizePagination(page, pageSize);
  const supabase = await createClient();

  const { data, count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("id", { ascending: true })
    .range(from, to);

  if (error) return { data: [], count: 0, error: error.message };
  return {
    data: ((data ?? []) as ProfileRow[]).map(mapProfileRow),
    count: count ?? 0,
  };
}

export async function updateProfile(input: {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}): Promise<MutationResult> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: input.full_name,
        avatar_url: input.avatar_url,
        role: input.role,
      })
      .eq("id", input.id);

    if (error) return { error: error.message };
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error inesperado" };
  }
}

export async function deleteProfile(id: string): Promise<MutationResult> {
  try {
    const { supabase, user } = await requireUser();
    if (id === user.id) {
      return { error: "No puedes eliminar tu propio perfil." };
    }
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) return { error: error.message };
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error inesperado" };
  }
}
