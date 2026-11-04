import type { Metadata } from "next";
import { GameLibrary } from "@/components/games/game-library";
import { games } from "@/lib/games/registry";

export const metadata: Metadata = {
  title: "Biblioteca de juegos",
  description:
    "Juegos con conversión de sensibilidad verificada, experimental o pendiente. Sin insignias de compatibilidad inventadas.",
};

export default function GamesPage() {
  const verified = games.filter((game) => game.verification === "verified").length;
  const pending = games.filter((game) => game.verification === "pending").length;

  return (
    <div className="site-container pt-8 sm:pt-10">
      <header className="grid gap-5 border-b-2 border-[var(--ink)] pb-5 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:items-end">
        <div>
          <p className="label">Biblioteca</p>
          <h1 className="display mt-2 text-[clamp(2.2rem,5vw,3.6rem)]">
            Juegos que sí podemos
            <br />
            convertir.
          </h1>
        </div>
        <p className="max-w-md text-[0.88rem] leading-relaxed text-[var(--muted)] md:justify-self-end">
          <span className="mono font-bold text-[var(--ink)]">{verified}</span>{" "}
          juegos con constante verificada.{" "}
          <span className="mono font-bold text-[var(--ink)]">{pending}</span>{" "}
          aparecen como pendientes porque todavía no tenemos una fórmula que
          podamos defender. Preferimos decírtelo a inventar un número.
        </p>
      </header>

      <div className="mt-6">
        <GameLibrary />
      </div>
    </div>
  );
}
