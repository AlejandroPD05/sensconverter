import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader, MobileNav } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { brand, siteUrl } from "@/lib/brand";
import { DEFAULT_THEME, themeBootScript } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} — Conversor de sensibilidad y cm/360`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  applicationName: brand.name,
  keywords: [
    "sensibilidad",
    "conversor de sensibilidad",
    "cm/360",
    "eDPI",
    "mouse sensitivity",
    "CS2",
    "Valorant",
    "Apex Legends",
  ],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: brand.name,
    title: `${brand.name} — Conversor de sensibilidad`,
    description: brand.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — Conversor de sensibilidad`,
    description: brand.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[var(--surface)] focus:shadow-md focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--fg)]"
        >
          Saltar al contenido
        </a>
        <SiteHeader />
        <main id="main" className="relative z-10">
          <ViewTransition default="page">{children}</ViewTransition>
        </main>
        <SiteFooter />
        <MobileNav />
      </body>
    </html>
  );
}
