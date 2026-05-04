import { createClient } from "@/lib/supabase/client";
import {
  type GetProductsParams,
  getProductById,
  getProducts,
} from "@/services/products";
import { queryKeys } from "@/lib/query-keys";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import type { Product } from "@/types";

type ProductsData = Product[];
type ProductsOptions = Omit<
  UseQueryOptions<ProductsData>,
  "queryKey" | "queryFn"
>;

const useProducts = (
  params: GetProductsParams = {},
  options?: ProductsOptions
) => {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => getProducts(createClient(), params),
    ...options,
  });
};

type ProductData = Product | null;
type ProductOptions = Omit<
  UseQueryOptions<ProductData>,
  "queryKey" | "queryFn"
>;

const useProduct = (id: string, options?: ProductOptions) => {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProductById(createClient(), id),
    enabled: !!id,
    ...options,
  });
};

export { useProducts, useProduct };
