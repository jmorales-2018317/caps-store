import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Categories } from "@/components/home/Categories";
import { BrandStatement } from "@/components/home/BrandStatement";
import { createClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { getProducts } from "@/services/products";
import { getStylesWithCount } from "@/services/styles";

export default async function HomePage() {
  const supabase = await createClient();
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.featured(),
      queryFn: () => getProducts(supabase, { featured: true, limit: 8 }),
    }),
    queryClient.prefetchQuery({
      queryKey: [...queryKeys.styles.all(), "with-count"] as const,
      queryFn: () => getStylesWithCount(supabase),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Hero />
      <Marquee />
      <FeaturedProducts />
      <Categories />
      <BrandStatement />
    </HydrationBoundary>
  );
}
