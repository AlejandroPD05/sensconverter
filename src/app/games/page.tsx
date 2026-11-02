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
    <div className="site-container pt-10 sm:pt-14">
      <header className="max-w-3xl animate-fade-up">
        <p className="eyebrow">Biblioteca</p>
        <h1 className="display mt-3 text-[clamp(2.2rem,5vw,3.6rem)]">
          Juegos que sí podemos <span className="text-gradient">convertir</span>
        </h1>
        <p className="mt-4 text-[0.92rem] leading-relaxed text-[var(--muted)]">
          {verified} juegos con constante verificada. {pending} aparecen como
          pendientes porque todavía no tenemos una fórmula que podamos defender.
          Preferimos decírtelo a inventar un número.
        </p>
      </header>

      <div className="mt-8">
        <GameLibrary />
      </div>
    </div>
  );
}
