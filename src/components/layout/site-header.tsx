"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
      className="flex items-center gap-2.5 rounded-lg"
      aria-label={`${brand.name} — inicio`}
    >
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="size-5" fill="none">
          <path
            d="M12 3v3.2M12 17.8V21M3 12h3.2M17.8 12H21"
            stroke="white"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="4.1" stroke="white" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="1.15" fill="white" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-[1.02rem] font-semibold tracking-[-0.03em]">
          {brand.name}
        </span>
        {!compact ? (
          <span className="mt-1 hidden text-[0.58rem] font-medium uppercase tracking-[0.2em] text-[var(--faint)] sm:block">
            sensitivity lab
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
    <header className="site-header">
      <div className="site-container flex h-16 items-center justify-between gap-4">
        <Brand />

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-0.5 md:flex"
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
                <Icon className="size-3.5 opacity-70" aria-hidden="true" />
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
            className={cn(
              "btn btn-sm",
              email ? "btn-secondary" : "btn-primary",
            )}
          >
            {email ? (
              <>
                <span
                  className="grid size-5 place-items-center rounded-full bg-[var(--accent)]/15 text-[0.6rem] font-bold uppercase text-[var(--accent)]"
                  aria-hidden="true"
                >
                  {email.slice(0, 1)}
                </span>
                <span className="max-w-28 truncate">Cuenta</span>
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
            <Icon className="size-[1.15rem]" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
