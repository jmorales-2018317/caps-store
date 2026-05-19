export interface HatStyle {
  id: string;
  label: string;
  image?: string;
  description?: string;
}

export interface Category {
  id: string;
  label: string;
  image?: string;
  description?: string;
}

export type DiscountType = "percentage" | "fixed";

export interface DiscountProductRef {
  id: string;
  name: string;
}

export interface Discount {
  id: string;
  name: string;
  description?: string;
  value: number;
  type: DiscountType;
  start_date: string;
  end_date: string;
  products?: DiscountProductRef[];
}

export interface ProductDiscountRef {
  id: string;
  name: string;
}

export type Badge = "new" | "limited" | "bestseller" | "reciente";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  hat_style: HatStyle;
  categories: Category[];
  discounts?: ProductDiscountRef[];
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  description: string;
  featured?: boolean;
  created_at?: string;
}

export interface CartLineRef {
  productId: string;
  colorName: string;
  colorHex: string;
  size: string;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: ProductColor;
  selectedSize: string;
}

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  addItem: (
    product: Product,
    color: ProductColor,
    size: string,
    quantity?: number
  ) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQty: (productId: string, color: string, size: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

export interface FilterState {
  hatStyles: string[];
  categories: string[];
  maxPrice: number;
  colors: string[];
  sortBy: SortOption;
}

export type SortOption = "newest" | "price-asc" | "price-desc" | "popular";

export interface Order {
  id: string;
  created_at: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  shipping_method: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  /** Set for orders placed while logged in (Supabase `orders.user_id`). */
  user_id?: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  color_name?: string;
  color_hex?: string;
  size?: string;
  quantity: number;
  unit_price: number;
}

/** Pedido del cliente con líneas cargadas desde `order_items`. */
export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  email?: string | null;
}
