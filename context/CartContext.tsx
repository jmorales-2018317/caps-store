"use client";

import React, { createContext, useContext, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { loadHydratedCart } from "@/lib/cart/load";
import {
  clearLines,
  removeLine,
  setLineQuantity,
  upsertLine,
} from "@/lib/cart/storage";
import type { CartItem, CartState, Product, ProductColor } from "@/types";

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const cartKey = queryKeys.cart.hydrated();

  const { data: items = [], isPending, isFetching } = useQuery({
    queryKey: cartKey,
    queryFn: () => loadHydratedCart(supabase),
    staleTime: 0,
  });

  const isLoading =
    isPending || (isFetching && items.length === 0);

  const addItemMutation = useMutation({
    mutationFn: async ({
      product,
      color,
      size,
      quantity,
    }: {
      product: Product;
      color: ProductColor;
      size: string;
      quantity: number;
    }) => {
      upsertLine(
        {
          productId: product.id,
          colorName: color.name,
          colorHex: color.hex,
          size,
          quantity,
        },
        "add"
      );
    },
    onMutate: async ({ product, color, size, quantity }) => {
      await queryClient.cancelQueries({ queryKey: cartKey });
      const previous = queryClient.getQueryData<CartItem[]>(cartKey) ?? [];

      queryClient.setQueryData<CartItem[]>(cartKey, (old = []) => {
        const idx = old.findIndex(
          (i) =>
            i.product.id === product.id &&
            i.selectedColor.name === color.name &&
            i.selectedSize === size
        );
        if (idx >= 0) {
          return old.map((item, i) =>
            i === idx ? { ...item, quantity: item.quantity + quantity } : item
          );
        }
        return [
          ...old,
          { product, quantity, selectedColor: color, selectedSize: size },
        ];
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(cartKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartKey });
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
      removeLine(productId, color, size);
    },
    onMutate: async ({ productId, color, size }) => {
      await queryClient.cancelQueries({ queryKey: cartKey });
      const previous = queryClient.getQueryData<CartItem[]>(cartKey) ?? [];

      queryClient.setQueryData<CartItem[]>(cartKey, (old = []) =>
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
      if (context) {
        queryClient.setQueryData(cartKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartKey });
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
      if (qty <= 0) {
        removeLine(productId, color, size);
      } else {
        setLineQuantity(productId, color, size, qty);
      }
    },
    onMutate: async ({ productId, color, size, qty }) => {
      await queryClient.cancelQueries({ queryKey: cartKey });
      const previous = queryClient.getQueryData<CartItem[]>(cartKey) ?? [];

      queryClient.setQueryData<CartItem[]>(cartKey, (old = []) => {
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
      if (context) {
        queryClient.setQueryData(cartKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartKey });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      clearLines();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: cartKey });
      const previous = queryClient.getQueryData<CartItem[]>(cartKey) ?? [];
      queryClient.setQueryData<CartItem[]>(cartKey, []);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(cartKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartKey });
    },
  });

  const addItem = useCallback(
    (
      product: Product,
      color: ProductColor,
      size: string,
      quantity = 1
    ) => {
      addItemMutation.mutate({ product, color, size, quantity });
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
