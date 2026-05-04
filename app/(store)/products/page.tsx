import { Suspense } from "react";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { ProductsContent } from "./ProductsContent";
import { createClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { getProducts } from "@/services/products";
import { getStyles } from "@/services/styles";
import { getCategories } from "@/services/categories";

export const metadata = {
  title: "Tienda — Todas las gorras",
  description:
    "Explora todas las gorras Crea Caps: snapbacks, fitted, dad hats y buckets.",
};

export default async function ProductsPage() {
  const supabase = await createClient();
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.list(),
      queryFn: () => getProducts(supabase),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.styles.all(),
      queryFn: () => getStyles(supabase),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.all(),
      queryFn: () => getCategories(supabase),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="flex flex-col gap-3">
              <div className="h-3 w-24 bg-surface-2 animate-pulse" />
              <div className="h-12 w-48 bg-surface-2 animate-pulse" />
            </div>
          </div>
        }
      >
        <ProductsContent />
      </Suspense>
    </HydrationBoundary>
  );
}
