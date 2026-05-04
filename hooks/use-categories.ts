import { createClient } from "@/lib/supabase/client";
import { getCategories } from "@/services/categories";
import { queryKeys } from "@/lib/query-keys";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import type { Category } from "@/types";

type Data = Category[];
type Options = Omit<UseQueryOptions<Data>, "queryKey" | "queryFn">;

const useCategories = (options?: Options) => {
  return useQuery({
    queryKey: queryKeys.categories.all(),
    queryFn: () => getCategories(createClient()),
    ...options,
  });
};

export { useCategories };
