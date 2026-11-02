import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow, SensitivityProfileRow } from "./types";

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, default_dpi, global_cm360, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  if (error) return null;
  return data;
}

export async function getSensitivityProfiles(
  userId: string,
): Promise<SensitivityProfileRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("sensitivity_profiles")
    .select(
      "id, user_id, name, game_id, dpi, sensitivity, fov, method, cm360, notes, is_favorite, is_preferred, created_at, updated_at",
    )
    .eq("user_id", userId)
    .order("is_preferred", { ascending: false })
    .order("is_favorite", { ascending: false })
    .order("updated_at", { ascending: false })
    .returns<SensitivityProfileRow[]>();

  if (error) return [];
  return data ?? [];
}
