import { createClient } from "@/lib/supabase/client";
import {
  getStyles,
  getStylesWithCount,
  type HatStyleWithCount,
} from "@/services/styles";
import { queryKeys } from "@/lib/query-keys";
import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import type { HatStyle } from "@/types";

type StylesData = HatStyle[];
type StylesOptions = Omit<UseQueryOptions<StylesData>, "queryKey" | "queryFn">;

const useStyles = (options?: StylesOptions) => {
  return useQuery({
    queryKey: queryKeys.styles.all(),
    queryFn: () => getStyles(createClient()),
    ...options,
  });
};

type StylesWithCountData = HatStyleWithCount[];
type StylesWithCountOptions = Omit<
  UseQueryOptions<StylesWithCountData>,
  "queryKey" | "queryFn"
>;

const useStylesWithCount = (options?: StylesWithCountOptions) => {
  return useQuery({
    queryKey: [...queryKeys.styles.all(), "with-count"] as const,
    queryFn: () => getStylesWithCount(createClient()),
    ...options,
  });
};

export { useStyles, useStylesWithCount };
