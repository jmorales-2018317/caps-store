import type {
  Product,
  ProductColor,
  HatStyle,
  Category,
  Discount,
  DiscountType,
} from "@/types";

// Shape of a hat_style row returned by Supabase
export interface HatStyleRow {
  id: string;
  label: string;
  image: string | null;
  description: string | null;
}

// Shape of a category row returned by Supabase
export interface CategoryRow {
  id: string;
  label: string;
  image: string | null;
  description: string | null;
}

export interface DiscountRow {
  id: string;
  name: string;
  description: string | null;
  value: number | string;
  type: string;
  start_date: string;
  end_date: string;
}

/** Row from select with product_discounts(product:products(id,name)) */
export interface DiscountJoinedRow extends DiscountRow {
  product_discounts?: { product: { id: string; name: string } | null }[];
}

// Full product row shape including joined relations.
// Query string: select('*, hat_style:hat_styles(*), categories:product_categories(category:categories(*))')
export interface ProductRow {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  hat_style_id: string;
  hat_style: HatStyleRow;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  description: string;
  featured: boolean | null;
  created_at?: string;
  // joined product_categories rows, each with a nested category
  categories: { category: CategoryRow }[];
  // joined product_discounts rows, each with a nested discount
  discounts?: { discount: { id: string; name: string } | null }[];
}

export function mapHatStyleRow(row: HatStyleRow): HatStyle {
  return {
    id: row.id,
    label: row.label,
    image: row.image ?? undefined,
    description: row.description ?? undefined,
  };
}

export function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    label: row.label,
    image: row.image ?? undefined,
    description: row.description ?? undefined,
  };
}

export function mapDiscountRow(
  row: DiscountRow,
  products?: { id: string; name: string }[]
): Discount {
  const value =
    typeof row.value === "string" ? Number(row.value) : row.value;
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    value,
    type: row.type as DiscountType,
    start_date: row.start_date,
    end_date: row.end_date,
    ...(products !== undefined ? { products } : {}),
  };
}

export function mapDiscountJoinedRow(row: DiscountJoinedRow): Discount {
  const products = (row.product_discounts ?? [])
    .map((pd) => pd.product)
    .filter((p): p is { id: string; name: string } => p != null);
  return mapDiscountRow(row, products);
}

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    hat_style: mapHatStyleRow(row.hat_style),
    categories: (row.categories ?? []).map((pc) => mapCategoryRow(pc.category)),
    discounts: (row.discounts ?? [])
      .map((pd) => pd.discount)
      .filter((d): d is { id: string; name: string } => d != null),
    images: row.images ?? [],
    colors: (row.colors ?? []) as ProductColor[],
    sizes: row.sizes ?? [],
    description: row.description,
    featured: row.featured ?? undefined,
    created_at: row.created_at,
  };
}

// Supabase select string to use whenever fetching products with their relations
export const PRODUCT_SELECT =
  "*, hat_style:hat_styles(*), categories:product_categories(category:categories(*)), discounts:product_discounts(discount:discounts(id,name))";

/** Listado de descuentos (sin productos vinculados). */
export const DISCOUNT_LIST_SELECT = "*";

/** Detalle de descuento con productos asociados. */
export const DISCOUNT_SELECT =
  "*, product_discounts(product:products(id,name))";
