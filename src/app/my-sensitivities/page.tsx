import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SavedProfiles, type SavedProfileView } from "@/components/profile/saved-profiles";
import { SetupNotice } from "@/components/auth/setup-notice";
import { getSensitivityProfiles } from "@/lib/db/profiles";
import { getGame } from "@/lib/games/registry";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Mis sensibilidades" };

export default async function MySensitivitiesPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="site-container max-w-3xl pt-8 sm:pt-10">
        <h1 className="display mt-2 text-[clamp(2rem,4.5vw,3rem)]">
          Mis sensibilidades
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          El guardado en la nube necesita Supabase configurado. La calculadora
          sigue funcionando sin cuenta.
        </p>
        <div className="mt-6">
          <SetupNotice />
        </div>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/my-sensitivities");

  const rows = await getSensitivityProfiles(user.id);
  const profiles: SavedProfileView[] = rows.map((row) => {
    const game = getGame(row.game_id);
    return {
      id: row.id,
      name: row.name,
      gameId: row.game_id,
      gameName: game?.name ?? row.game_id,
      gameShortName: game?.shortName ?? row.game_id,
      dpi: Number(row.dpi),
      sensitivity: Number(row.sensitivity),
      sensitivityDecimals: game?.sensitivity.decimals ?? 3,
      sensitivityUnit: game?.sensitivity.unit,
      method: row.method,
      cm360: row.cm360 === null ? null : Number(row.cm360),
      notes: row.notes,
      isFavorite: row.is_favorite,
      isPreferred: row.is_preferred,
      updatedAt: row.updated_at,
    };
  });

  return (
    <div className="site-container pt-8 sm:pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[var(--line)] pb-5">
        <div className="min-w-0">
          <h1 className="display mt-2 text-[clamp(2rem,5vw,3.2rem)]">
            Mis sensibilidades
          </h1>
          <p className="mt-2 max-w-2xl text-[0.8125rem] leading-relaxed text-[var(--muted)]">
            Perfiles guardados en tu cuenta. Puedes tener varias configuraciones
            por juego, marcarlas como favoritas y cargarlas en la calculadora.
          </p>
        </div>
        <Link href="/" className="btn btn-primary shrink-0">
          Nueva conversión
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </header>

      <div className="mt-5">
        <SavedProfiles profiles={profiles} />
      </div>
    </div>
  );
}
