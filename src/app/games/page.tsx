import type { Metadata } from "next";
import { GameLibrary } from "@/components/games/game-library";
import { games } from "@/lib/games/registry";
import { PageHero } from "@/components/layout/page-hero";

export const metadata: Metadata = {
  title: "Biblioteca de juegos",
  description:
    "Juegos con conversión de sensibilidad verificada, experimental o pendiente. Sin insignias de compatibilidad inventadas.",
};

export default function GamesPage() {
  const verified = games.filter((game) => game.verification === "verified").length;
  const pending = games.filter((game) => game.verification === "pending").length;

  return (
    <>
      <PageHero lines={["Juegos que sí podemos", "convertir."]}>
        <p>
          <span className="mono font-semibold text-[var(--fg)]">{verified}</span>{" "}
          juegos con constante verificada.{" "}
          <span className="mono font-semibold text-[var(--fg)]">{pending}</span>{" "}
          aparecen como pendientes porque todavía no tenemos una fórmula que
          podamos defender. Preferimos decírtelo a inventar un número.
        </p>
      </PageHero>
      <div className="site-container pt-8 sm:pt-10">

      <div className="mt-6">
        <GameLibrary />
      </div>
    </div>
    </>
  );
}
