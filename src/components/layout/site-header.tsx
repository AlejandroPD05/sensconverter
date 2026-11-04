"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  Calculator,
  BookOpen,
  Gamepad2,
  Gauge,
  LogIn,
  UserRound,
} from "lucide-react";
import { brand } from "@/lib/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatMeasure } from "@/lib/format";
import {
  getLiveReadoutServerSnapshot,
  getLiveReadoutSnapshot,
  subscribeLiveReadout,
} from "@/lib/live-readout";
import { cn } from "@/lib/cn";

export const navItems = [
  { href: "/", label: "Calculadora", icon: Calculator },
  { href: "/games", label: "Juegos", icon: Gamepad2 },
  { href: "/global", label: "Global", icon: Gauge },
  { href: "/methodology", label: "Método", icon: BookOpen },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5"
      aria-label={`${brand.name} — inicio`}
    >
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="size-4" fill="none">
          <path
            d="M12 3v3.4M12 17.6V21M3 12h3.4M17.6 12H21"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="butt"
          />
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.9" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-[0.95rem] font-bold uppercase tracking-[-0.01em] text-[var(--band-ink)]">
          {brand.name}
        </span>
        {!compact ? (
          <span className="mt-1 hidden font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[var(--band-muted)] sm:block">
            cm/360 · conversor
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function LiveStrip() {
  const live = useSyncExternalStore(
    subscribeLiveReadout,
    getLiveReadoutSnapshot,
    getLiveReadoutServerSnapshot,
  );

  return (
    <div className="live-strip" aria-live="off">
      <div className="site-container mono flex h-9 items-center gap-2.5 overflow-hidden text-[0.58rem] font-medium uppercase tracking-[0.05em] sm:gap-3 sm:text-[0.62rem]">
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="live-dot" aria-hidden="true" />
          En directo
        </span>
        <span aria-hidden="true" className="h-3 w-px shrink-0 bg-[var(--ink)]/30" />
        {live ? (
          <>
            <span className="truncate">
              {live.sourceShort} {live.sourceSensitivity} @ {live.sourceDpi} DPI
            </span>
            <span aria-hidden="true" className="shrink-0">
              →
            </span>
            <span className="shrink-0 font-bold">
              {live.targetShort} {live.targetSensitivity}
            </span>
            <span className="hidden shrink-0 sm:inline">
              · {formatMeasure(live.cm360, 1)} cm/360 · eDPI{" "}
              {formatMeasure(live.edpi, 0)}
            </span>
          </>
        ) : (
          <span className="truncate">
            Conversor cm/360 · fórmulas documentadas · sin cuenta obligatoria
          </span>
        )}
      </div>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setEmail(data.user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="site-header">
      <div className="site-container flex h-14 items-center justify-between gap-4">
        <Brand />

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-6 md:flex"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link"
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
              >
                <Icon className="size-3.5 opacity-80" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/my-sensitivities"
            className="nav-link hidden lg:inline-flex"
            aria-current={isActive(pathname, "/my-sensitivities") ? "page" : undefined}
          >
            Mis sensibilidades
          </Link>
          <Link
            href={email ? "/account" : "/login"}
            className={cn("btn btn-sm", email ? "btn-on-dark" : "btn-on-dark")}
          >
            {email ? (
              <>
                <span
                  className="mono grid size-5 place-items-center bg-[var(--ink)] text-[0.55rem] font-bold uppercase text-[var(--field)]"
                  aria-hidden="true"
                >
                  {email.slice(0, 1)}
                </span>
                <span className="max-w-24 truncate">Cuenta</span>
              </>
            ) : (
              <>
                <LogIn className="size-3.5" aria-hidden="true" />
                Entrar
              </>
            )}
          </Link>
          <Link
            href="/my-sensitivities"
            className="btn btn-ghost btn-sm btn-icon text-[var(--band-ink)] hover:bg-[rgba(233,231,222,0.12)] lg:hidden"
            aria-label="Mis sensibilidades"
          >
            <UserRound className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <LiveStrip />
    </header>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const items = [
    ...navItems,
    { href: "/my-sensitivities", label: "Cuenta", icon: UserRound },
  ];

  return (
    <nav className="mobile-nav md:hidden" aria-label="Navegación inferior">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="mobile-nav-link"
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
          >
            <Icon className="size-[1.1rem]" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
