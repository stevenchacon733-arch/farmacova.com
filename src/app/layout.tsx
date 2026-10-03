import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Farmacova | Cuidamos de ti", template: "%s | Farmacova" },
  description:
    "Descubre las promociones del mes de Farmacova en Costa Rica. Información de productos, aplicación de vacunas e inyectables y Club Farmacova.",
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
