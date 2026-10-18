import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { isDemoMode } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const description =
  "Descubre las promociones del mes de Farmacova en Costa Rica. Información de productos, aplicación de vacunas e inyectables y Club Farmacova.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Farmacova | Cuidamos de ti", template: "%s | Farmacova" },
  description,
  // El modo de ejemplo muestra fichas ficticias: no deben indexarse.
  robots: isDemoMode()
    ? { index: false, follow: false }
    : { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_CR",
    siteName: "Farmacova",
    title: "Farmacova | Cuidamos de ti",
    description,
    images: [
      {
        url: "/images/farmacova-logo-transparente.png",
        width: 444,
        height: 224,
        alt: "Farmacova · Cuidamos de ti",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CR">
      <body>
        <a
          href="#contenido"
          className="fixed left-4 top-3 z-50 -translate-y-24 rounded-lg bg-blue-950 px-5 py-3 text-white focus:translate-y-0"
        >
          Saltar al contenido
        </a>
        <Navbar />
        <main id="contenido">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
