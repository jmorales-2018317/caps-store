"use client";

import React, { createContext, useContext, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getOrCreateCartSession, getCartItems } from "@/services/cart";
import type { CartItem, CartState, Product, ProductColor } from "@/types";

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const { data: sessionId = null, isPending: sessionPending } = useQuery({
    queryKey: queryKeys.cart.session(),
    queryFn: () => getOrCreateCartSession(supabase),
    staleTime: Infinity,
  });

  const {
    data: items = [],
    isPending: itemsPending,
  } = useQuery({
    queryKey: queryKeys.cart.items(sessionId ?? ""),
    queryFn: () => getCartItems(supabase, sessionId!),
    enabled: !!sessionId,
  });

  /** Incluye creación de sesión y carga de ítems; evita tratar el carrito como vacío antes de tiempo */
  const isLoading = sessionPending || (!!sessionId && itemsPending);

  const addItemMutation = useMutation({
    mutationFn: async ({
      product,
      color,
      size,
    }: {
      product: Product;
      color: ProductColor;
      size: string;
    }) => {
      if (!sessionId) return;

      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("session_id", sessionId)
        .eq("product_id", product.id)
        .eq("color_name", color.name)
        .eq("size", size)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("cart_items")
          .update({ quantity: (existing.quantity as number) + 1 })
          .eq("id", existing.id);
      } else {
        await supabase.from("cart_items").insert({
          session_id: sessionId,
          product_id: product.id,
          color_name: color.name,
          color_hex: color.hex,
          size,
          quantity: 1,
        });
      }
    },
    onMutate: async ({ product, color, size }) => {
      if (!sessionId) return;
      const key = queryKeys.cart.items(sessionId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CartItem[]>(key) ?? [];

      queryClient.setQueryData<CartItem[]>(key, (old = []) => {
        const idx = old.findIndex(
          (i) =>
            i.product.id === product.id &&
            i.selectedColor.name === color.name &&
            i.selectedSize === size
        );
        if (idx >= 0) {
          return old.map((item, i) =>
            i === idx ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [
          ...old,
          { product, quantity: 1, selectedColor: color, selectedSize: size },
        ];
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (!sessionId || !context) return;
      queryClient.setQueryData(queryKeys.cart.items(sessionId), context.previous);
    },
    onSettled: () => {
      if (sessionId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.cart.items(sessionId),
        });
      }
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async ({
      productId,
      color,
      size,
    }: {
      productId: string;
      color: string;
      size: string;
    }) => {
      if (!sessionId) return;
      await supabase
        .from("cart_items")
        .delete()
        .eq("session_id", sessionId)
        .eq("product_id", productId)
        .eq("color_name", color)
        .eq("size", size);
    },
    onMutate: async ({ productId, color, size }) => {
      if (!sessionId) return;
      const key = queryKeys.cart.items(sessionId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CartItem[]>(key) ?? [];

      queryClient.setQueryData<CartItem[]>(key, (old = []) =>
        old.filter(
          (i) =>
            !(
              i.product.id === productId &&
              i.selectedColor.name === color &&
              i.selectedSize === size
            )
        )
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (!sessionId || !context) return;
      queryClient.setQueryData(queryKeys.cart.items(sessionId), context.previous);
    },
    onSettled: () => {
      if (sessionId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.cart.items(sessionId),
        });
      }
    },
  });

  const updateQtyMutation = useMutation({
    mutationFn: async ({
      productId,
      color,
      size,
      qty,
    }: {
      productId: string;
      color: string;
      size: string;
      qty: number;
    }) => {
      if (!sessionId) return;
      if (qty <= 0) {
        await supabase
          .from("cart_items")
          .delete()
          .eq("session_id", sessionId)
          .eq("product_id", productId)
          .eq("color_name", color)
          .eq("size", size);
      } else {
        await supabase
          .from("cart_items")
          .update({ quantity: qty })
          .eq("session_id", sessionId)
          .eq("product_id", productId)
          .eq("color_name", color)
          .eq("size", size);
      }
    },
    onMutate: async ({ productId, color, size, qty }) => {
      if (!sessionId) return;
      const key = queryKeys.cart.items(sessionId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CartItem[]>(key) ?? [];

      queryClient.setQueryData<CartItem[]>(key, (old = []) => {
        if (qty <= 0) {
          return old.filter(
            (i) =>
              !(
                i.product.id === productId &&
                i.selectedColor.name === color &&
                i.selectedSize === size
              )
          );
        }
        return old.map((item) =>
          item.product.id === productId &&
          item.selectedColor.name === color &&
          item.selectedSize === size
            ? { ...item, quantity: qty }
            : item
        );
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (!sessionId || !context) return;
      queryClient.setQueryData(queryKeys.cart.items(sessionId), context.previous);
    },
    onSettled: () => {
      if (sessionId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.cart.items(sessionId),
        });
      }
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) return;
      await supabase
        .from("cart_items")
        .delete()
        .eq("session_id", sessionId);
    },
    onMutate: async () => {
      if (!sessionId) return;
      const key = queryKeys.cart.items(sessionId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CartItem[]>(key) ?? [];
      queryClient.setQueryData<CartItem[]>(key, []);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (!sessionId || !context) return;
      queryClient.setQueryData(queryKeys.cart.items(sessionId), context.previous);
    },
    onSettled: () => {
      if (sessionId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.cart.items(sessionId),
        });
      }
    },
  });

  const addItem = useCallback(
    (product: Product, color: ProductColor, size: string) => {
      addItemMutation.mutate({ product, color, size });
    },
    [addItemMutation]
  );

  const removeItem = useCallback(
    (productId: string, color: string, size: string) => {
      removeItemMutation.mutate({ productId, color, size });
    },
    [removeItemMutation]
  );

  const updateQty = useCallback(
    (productId: string, color: string, size: string, qty: number) => {
      updateQtyMutation.mutate({ productId, color, size, qty });
    },
    [updateQtyMutation]
  );

  const clearCart = useCallback(() => {
    clearCartMutation.mutate();
  }, [clearCartMutation]);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
