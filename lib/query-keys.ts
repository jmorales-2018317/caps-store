export const queryKeys = {
  products: {
    all: () => ["products"] as const,
    list: (params?: object) => ["products", "list", params ?? {}] as const,
    detail: (id: string) => ["products", "detail", id] as const,
    featured: () => ["products", "featured"] as const,
  },
  categories: {
    all: () => ["categories"] as const,
    detail: (id: string) => ["categories", "detail", id] as const,
  },
  styles: {
    all: () => ["hat-styles"] as const,
    detail: (id: string) => ["hat-styles", "detail", id] as const,
  },
  discounts: {
    all: () => ["discounts"] as const,
    detail: (id: string) => ["discounts", "detail", id] as const,
  },
  orders: {
    all: () => ["orders"] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
    mine: () => ["orders", "mine"] as const,
  },
  profiles: {
    all: () => ["profiles"] as const,
    detail: (id: string) => ["profiles", "detail", id] as const,
    current: () => ["profiles", "current"] as const,
  },
  cart: {
    session: () => ["cart", "session"] as const,
    items: (sessionId: string) => ["cart", "items", sessionId] as const,
  },
  auth: {
    user: () => ["auth", "user"] as const,
  },
} as const;
