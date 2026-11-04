import type { Metadata, Viewport } from "next";
import { Archivo, Martian_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader, MobileNav } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { brand, siteUrl } from "@/lib/brand";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
  themeColor: "#e9e7de",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${martianMono.variable} antialiased`}
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[var(--field)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--ink)]"
        >
          Saltar al contenido
        </a>
        <div className="page-backdrop" aria-hidden="true" />
        <SiteHeader />
        <main id="main" className="relative z-10">
          {children}
        </main>
        <SiteFooter />
        <MobileNav />
      </body>
    </html>
  );
}
