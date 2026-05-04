import type { SupabaseClient } from "@supabase/supabase-js";

/** Where to send the user after auth, based on `profiles.role`. */
export async function getPostAuthRedirectPath(
  supabase: SupabaseClient,
  userId: string
): Promise<"/dashboard" | "/"> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role === "admin") return "/dashboard";
  return "/";
}
