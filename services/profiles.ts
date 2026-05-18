import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/types";

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  email?: string | null;
};

function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    role: row.role,
    email: row.email ?? null,
  };
}

export async function getProfiles(
  supabase: SupabaseClient
): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as ProfileRow[]).map(mapProfileRow);
}

export async function getProfileById(
  supabase: SupabaseClient,
  id: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapProfileRow(data as ProfileRow);
}

export async function getCurrentProfile(
  supabase: SupabaseClient
): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapProfileRow(data as ProfileRow);
}
