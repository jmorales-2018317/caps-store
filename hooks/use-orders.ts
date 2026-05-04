import { createClient } from "@/lib/supabase/client";
import { getOrders } from "@/services/orders";
import { queryKeys } from "@/lib/query-keys";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import type { Order } from "@/types";

type Data = Order[];
type Options = Omit<UseQueryOptions<Data>, "queryKey" | "queryFn">;

const useOrders = (options?: Options) => {
  return useQuery({
    queryKey: queryKeys.orders.all(),
    queryFn: () => getOrders(createClient()),
    ...options,
  });
};

export { useOrders };
