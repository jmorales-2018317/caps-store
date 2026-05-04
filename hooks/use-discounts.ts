import { createClient } from "@/lib/supabase/client";
import { getDiscounts } from "@/services/discounts";
import { queryKeys } from "@/lib/query-keys";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import type { Discount } from "@/types";

type Data = Discount[];
type Options = Omit<UseQueryOptions<Data>, "queryKey" | "queryFn">;

const useDiscounts = (options?: Options) => {
  return useQuery({
    queryKey: queryKeys.discounts.all(),
    queryFn: () => getDiscounts(createClient()),
    ...options,
  });
};

export { useDiscounts };
