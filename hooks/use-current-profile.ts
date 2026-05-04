import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/services/profiles";
import { queryKeys } from "@/lib/query-keys";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import type { Profile } from "@/types";
import { useCurrentUser } from "./use-current-user";

type Data = Profile | null;
type Options = Omit<UseQueryOptions<Data>, "queryKey" | "queryFn">;

const useCurrentProfile = (options?: Options) => {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.profiles.current(),
    queryFn: () => getCurrentProfile(createClient()),
    enabled: !!user,
    ...options,
  });
};

export { useCurrentProfile };
