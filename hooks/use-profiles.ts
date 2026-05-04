import { createClient } from "@/lib/supabase/client";
import { getProfiles } from "@/services/profiles";
import { queryKeys } from "@/lib/query-keys";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import type { Profile } from "@/types";

type Data = Profile[];
type Options = Omit<UseQueryOptions<Data>, "queryKey" | "queryFn">;

const useProfiles = (options?: Options) => {
  return useQuery({
    queryKey: queryKeys.profiles.all(),
    queryFn: () => getProfiles(createClient()),
    ...options,
  });
};

export { useProfiles };
