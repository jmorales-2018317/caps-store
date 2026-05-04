import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import {
  type UseQueryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

type Data = User | null;
type Options = Omit<UseQueryOptions<Data>, "queryKey" | "queryFn">;

const useCurrentUser = (options?: Options) => {
  const [supabase] = useState(() => createClient());
  const queryClient = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.auth.user(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.profiles.current(),
      });
    });

    return () => subscription.unsubscribe();
  }, [supabase, queryClient]);

  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
    ...options,
  });
};

export { useCurrentUser };
