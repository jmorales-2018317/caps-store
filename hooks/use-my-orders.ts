import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { getMyOrders } from "@/services/orders";
import {
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import type { OrderWithItems } from "@/types";

type Data = OrderWithItems[];
type Options = Omit<UseQueryOptions<Data>, "queryKey" | "queryFn">;

export function useMyOrders(enabled: boolean, options?: Options) {
  return useQuery({
    queryKey: queryKeys.orders.mine(),
    queryFn: () => getMyOrders(createClient()),
    enabled,
    staleTime: 60_000,
    ...options,
  });
}
