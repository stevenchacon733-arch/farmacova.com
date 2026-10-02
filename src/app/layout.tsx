import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Farmacova | Cuidamos de ti", template: "%s | Farmacova" },
  description:
    "Descubre medicamentos, más vendidos y promociones de Farmacova en Costa Rica. Venta de medicamentos, aplicación de vacunas e inyectables.",
  robots: { index: true, follow: true },
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
