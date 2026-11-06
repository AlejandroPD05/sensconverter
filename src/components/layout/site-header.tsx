"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Calculator,
  BookOpen,
  Coffee,
  Gamepad2,
  Gauge,
  LogIn,
  UserRound,
} from "lucide-react";
import { brand, donation } from "@/lib/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "./theme-toggle";

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
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.9" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-[0.95rem] font-semibold tracking-[-0.01em] text-[var(--fg)]">
          {brand.name}
        </span>
        {!compact ? (
          <span className="mt-0.5 hidden text-xs text-[var(--faint)] sm:block">
            Conversor de sensibilidad
          </span>
        ) : null}
      </span>
    </Link>
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
    <header className="site-header" style={{ viewTransitionName: "site-header" }}>
      <div className="site-container flex h-14 items-center justify-between gap-4">
        <Brand />

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-1 md:flex"
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
                <Icon className="size-4 opacity-70" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {donation.url ? (
            <a
              href={donation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link hidden lg:inline-flex"
            >
              <Coffee className="size-4 opacity-70" aria-hidden="true" />
              Apoyar
              <span className="sr-only"> en {donation.provider} (se abre en otra pestaña)</span>
            </a>
          ) : null}
          <Link
            href="/my-sensitivities"
            className="nav-link hidden lg:inline-flex"
            aria-current={isActive(pathname, "/my-sensitivities") ? "page" : undefined}
          >
            Mis sensibilidades
          </Link>
          <ThemeToggle />
          <Link
            href={email ? "/account" : "/login"}
            className={cn("btn btn-sm", email ? "btn-secondary" : "btn-primary")}
          >
            {email ? (
              <>
                <span
                  className="grid size-5 place-items-center rounded-full bg-[var(--accent)] text-[0.65rem] font-semibold text-[var(--on-accent)]"
                  aria-hidden="true"
                >
                  {email.slice(0, 1).toUpperCase()}
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
            className="btn btn-ghost btn-sm btn-icon lg:hidden"
            aria-label="Mis sensibilidades"
          >
            <UserRound className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
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
    <nav
      className="mobile-nav md:hidden"
      aria-label="Navegación inferior"
      style={{ viewTransitionName: "mobile-nav" }}
    >
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
