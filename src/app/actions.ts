"use server";

import { revalidatePath } from "next/cache";
import { cm360For } from "@/lib/conversion/engine";
import { getGame } from "@/lib/games/registry";
import { isConvertible } from "@/lib/games/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ActionResult, SensitivityProfileRow } from "@/lib/db/types";
import {
  accountSettingsSchema,
  globalPreferenceSchema,
  idSchema,
  saveCalculatorSchema,
  updateProfileSchema,
} from "@/lib/validation";

const NOT_CONFIGURED =
  "Supabase no está configurado en este entorno. Añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY y reinicia el servidor. La calculadora anónima sigue funcionando.";
const NOT_AUTHENTICATED =
  "Necesitas iniciar sesión para guardar. La calculadora sigue disponible sin cuenta.";

function dbError(): ActionResult {
  return {
    ok: false,
    message:
      "No se pudo completar la operación en la base de datos. Revisa la configuración de Supabase y vuelve a intentarlo.",
  };
}

export async function saveCalculatorProfile(raw: unknown): Promise<ActionResult> {
  const parsed = saveCalculatorSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Los datos del perfil no son válidos.",
    };
  }

  const game = getGame(parsed.data.gameId);
  if (!game || !isConvertible(game)) {
    return {
      ok: false,
      message:
        "Ese juego no tiene una fórmula verificada. No se puede guardar una conversión sin base matemática.",
    };
  }

  if (!isSupabaseConfigured) return { ok: false, message: NOT_CONFIGURED };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: NOT_CONFIGURED };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: NOT_AUTHENTICATED };

  const cm360 = cm360For(
    parsed.data.dpi,
    parsed.data.sensitivity,
    game.yaw,
  );

  const { error } = await supabase.from("sensitivity_profiles").insert({
    user_id: user.id,
    name: parsed.data.name,
    game_id: game.id,
    dpi: parsed.data.dpi,
    sensitivity: parsed.data.sensitivity,
    fov: parsed.data.fov ?? null,
    method: parsed.data.method,
    cm360,
    notes: parsed.data.notes || null,
    is_favorite: false,
    is_preferred: false,
  });

  if (error) return dbError();

  revalidatePath("/my-sensitivities");
  return { ok: true, message: "Perfil guardado. Puedes verlo en Mis sensibilidades." };
}

export async function updateSensitivityProfile(raw: unknown): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Los datos del perfil no son válidos.",
    };
  }

  if (!isSupabaseConfigured) return { ok: false, message: NOT_CONFIGURED };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: NOT_CONFIGURED };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: NOT_AUTHENTICATED };

  const { data: existing, error: readError } = await supabase
    .from("sensitivity_profiles")
    .select(
      "id, user_id, name, game_id, dpi, sensitivity, fov, method, cm360, notes, is_favorite, is_preferred, created_at, updated_at",
    )
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .maybeSingle<SensitivityProfileRow>();

  if (readError || !existing) {
    return { ok: false, message: "No encontramos ese perfil en tu cuenta." };
  }

  const game = getGame(existing.game_id);
  if (!game || !isConvertible(game)) {
    return { ok: false, message: "El juego de este perfil ya no tiene una fórmula disponible." };
  }

  const dpi = parsed.data.dpi ?? Number(existing.dpi);
  const sensitivity = parsed.data.sensitivity ?? Number(existing.sensitivity);
  const cm360 = cm360For(dpi, sensitivity, game.yaw);

  const update: Record<string, unknown> = {
    dpi,
    sensitivity,
    cm360,
    updated_at: new Date().toISOString(),
  };
  if (parsed.data.name !== undefined) update.name = parsed.data.name;
  if (parsed.data.notes !== undefined) update.notes = parsed.data.notes || null;
  if (parsed.data.isFavorite !== undefined) update.is_favorite = parsed.data.isFavorite;

  const { error } = await supabase
    .from("sensitivity_profiles")
    .update(update)
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);

  if (error) return dbError();

  revalidatePath("/my-sensitivities");
  return { ok: true, message: "Perfil actualizado." };
}

export async function setProfileFavorite(
  id: string,
  favorite: boolean,
): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: "Perfil no válido." };

  return updateSensitivityProfile({ id: parsedId.data, isFavorite: favorite });
}

export async function setPreferredSensitivityProfile(
  id: string,
): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: "Perfil no válido." };

  if (!isSupabaseConfigured) return { ok: false, message: NOT_CONFIGURED };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: NOT_CONFIGURED };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: NOT_AUTHENTICATED };

  const { data: existing, error: readError } = await supabase
    .from("sensitivity_profiles")
    .select(
      "id, user_id, game_id, is_preferred",
    )
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .maybeSingle<Pick<SensitivityProfileRow, "id" | "user_id" | "game_id" | "is_preferred">>();

  if (readError || !existing) {
    return { ok: false, message: "No encontramos ese perfil en tu cuenta." };
  }

  if (existing.is_preferred) {
    return { ok: true, message: "Ese perfil ya es el preferido del juego." };
  }

  const { error: clearError } = await supabase
    .from("sensitivity_profiles")
    .update({ is_preferred: false })
    .eq("user_id", user.id)
    .eq("game_id", existing.game_id)
    .eq("is_preferred", true);

  if (clearError) return dbError();

  const { error } = await supabase
    .from("sensitivity_profiles")
    .update({ is_preferred: true, updated_at: new Date().toISOString() })
    .eq("id", parsedId.data)
    .eq("user_id", user.id);

  if (error) return dbError();

  revalidatePath("/my-sensitivities");
  return { ok: true, message: "Perfil marcado como preferido para ese juego." };
}

export async function deleteSensitivityProfile(id: string): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: "Perfil no válido." };

  if (!isSupabaseConfigured) return { ok: false, message: NOT_CONFIGURED };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: NOT_CONFIGURED };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: NOT_AUTHENTICATED };

  const { error } = await supabase
    .from("sensitivity_profiles")
    .delete()
    .eq("id", parsedId.data)
    .eq("user_id", user.id);

  if (error) return dbError();

  revalidatePath("/my-sensitivities");
  return { ok: true, message: "Perfil eliminado." };
}

export async function duplicateSensitivityProfile(id: string): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: "Perfil no válido." };

  if (!isSupabaseConfigured) return { ok: false, message: NOT_CONFIGURED };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: NOT_CONFIGURED };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: NOT_AUTHENTICATED };

  const { data: existing, error: readError } = await supabase
    .from("sensitivity_profiles")
    .select(
      "id, user_id, name, game_id, dpi, sensitivity, fov, method, cm360, notes, is_favorite, is_preferred, created_at, updated_at",
    )
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .maybeSingle<SensitivityProfileRow>();

  if (readError || !existing) {
    return { ok: false, message: "No encontramos ese perfil en tu cuenta." };
  }

  const baseName = `${existing.name} (copia)`;
  const { error } = await supabase.from("sensitivity_profiles").insert({
    user_id: user.id,
    name: baseName.slice(0, 80),
    game_id: existing.game_id,
    dpi: existing.dpi,
    sensitivity: existing.sensitivity,
    fov: existing.fov,
    method: existing.method,
    cm360: existing.cm360,
    notes: existing.notes,
    is_favorite: false,
    is_preferred: false,
  });

  if (error) return dbError();

  revalidatePath("/my-sensitivities");
  return { ok: true, message: "Perfil duplicado." };
}

export async function saveGlobalPreference(raw: unknown): Promise<ActionResult> {
  const parsed = globalPreferenceSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "La preferencia no es válida.",
    };
  }

  if (!isSupabaseConfigured) return { ok: false, message: NOT_CONFIGURED };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: NOT_CONFIGURED };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: NOT_AUTHENTICATED };

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      global_cm360: parsed.data.cm360,
      default_dpi: parsed.data.dpi,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) return dbError();

  revalidatePath("/global");
  revalidatePath("/account");
  return { ok: true, message: "Preferencia global guardada en tu cuenta." };
}

export async function updateAccountSettings(raw: unknown): Promise<ActionResult> {
  const parsed = accountSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Los ajustes no son válidos.",
    };
  }

  if (!isSupabaseConfigured) return { ok: false, message: NOT_CONFIGURED };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: NOT_CONFIGURED };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: NOT_AUTHENTICATED };

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: parsed.data.displayName || null,
      default_dpi: parsed.data.defaultDpi,
      global_cm360: parsed.data.globalCm360,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) return dbError();

  revalidatePath("/account");
  revalidatePath("/global");
  return { ok: true, message: "Ajustes guardados." };
}

export async function deleteOwnAccount(confirmation: unknown): Promise<ActionResult> {
  if (confirmation !== "ELIMINAR") {
    return { ok: false, message: "Escribe ELIMINAR para confirmar el borrado." };
  }

  if (!isSupabaseConfigured) return { ok: false, message: NOT_CONFIGURED };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: NOT_CONFIGURED };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: NOT_AUTHENTICATED };

  // La función solo borra auth.uid(); no recibe ningún id del cliente.
  const { error } = await supabase.rpc("delete_own_account");
  if (error) {
    if (error.code === "PGRST202") {
      return {
        ok: false,
        message:
          "El borrado de cuenta no está instalado en la base de datos: aplica la migración 0003_delete_own_account.sql.",
      };
    }
    return dbError();
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { ok: true, message: "Cuenta eliminada." };
}
