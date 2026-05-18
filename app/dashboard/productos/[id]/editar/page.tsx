import { notFound } from "next/navigation";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { getProductById } from "@/services/products";
import { getStyles } from "@/services/styles";
import { getCategories } from "@/services/categories";
import { getDiscounts } from "@/services/discounts";
import { EntityFormShell } from "@/components/dashboard/entity-form-shell";
import { ProductForm } from "@/components/dashboard/product-form";
import { dashboardBreadcrumbs } from "@/lib/dashboard-breadcrumbs";

type EditarProductoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarProductoPage({ params }: EditarProductoPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const queryClient = getQueryClient();

  const product = await getProductById(supabase, id);
  if (!product) {
    notFound();
  }

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(id),
      queryFn: () => product,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.styles.all(),
      queryFn: () => getStyles(supabase),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.all(),
      queryFn: () => getCategories(supabase),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.discounts.all(),
      queryFn: () => getDiscounts(supabase),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EntityFormShell
        breadcrumbs={dashboardBreadcrumbs.productos.editar(product.name, id)}
        badge="Productos"
        title="Editar producto"
        description="Actualiza los datos del producto seleccionado."
      >
        <ProductForm mode="edit" product={product} />
      </EntityFormShell>
    </HydrationBoundary>
  );
}
