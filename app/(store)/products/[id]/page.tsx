import { notFound } from "next/navigation";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { getProductById, getRelatedProducts } from "@/services/products";
import { ProductDetailClient } from "@/components/products/ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProductById(supabase, id),
  });

  const product = queryClient.getQueryData<Awaited<
    ReturnType<typeof getProductById>
  >>(queryKeys.products.detail(id));

  if (!product) notFound();

  await queryClient.prefetchQuery({
    queryKey: [...queryKeys.products.detail(id), "related"] as const,
    queryFn: () => getRelatedProducts(supabase, id, product.hat_style.id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetailClient productId={id} />
    </HydrationBoundary>
  );
}
