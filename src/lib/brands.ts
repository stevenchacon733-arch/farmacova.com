// Marcas del carrusel de la portada. Los logos están en public/images/marcas/
// (WebP con fondo transparente). Para añadir una marca, guarda su logo ahí y
// agrégala a esta lista; `shape` ajusta el tamaño dentro del círculo.
export type Brand = {
  slug: string;
  name: string;
  logo: string;
  width: number;
  height: number;
  shape: "wide" | "tall" | "round";
};

export const brands: Brand[] = [
  {
    slug: "siegfried",
    name: "Siegfried",
    logo: "/images/marcas/siegfried.webp",
    width: 140,
    height: 192,
    shape: "tall",
  },
  {
    slug: "cerave",
    name: "CeraVe",
    logo: "/images/marcas/cerave.webp",
    width: 320,
    height: 115,
    shape: "wide",
  },
  {
    slug: "la-roche-posay",
    name: "La Roche-Posay",
    logo: "/images/marcas/la-roche-posay.webp",
    width: 320,
    height: 82,
    shape: "wide",
  },
  {
    slug: "bayer",
    name: "Bayer",
    logo: "/images/marcas/bayer.webp",
    width: 319,
    height: 320,
    shape: "round",
  },
  {
    slug: "pfizer",
    name: "Pfizer",
    logo: "/images/marcas/pfizer.webp",
    width: 320,
    height: 126,
    shape: "wide",
  },
  {
    slug: "astrazeneca",
    name: "AstraZeneca",
    logo: "/images/marcas/astrazeneca.webp",
    width: 320,
    height: 79,
    shape: "wide",
  },
  {
    slug: "sanofi",
    name: "Sanofi",
    logo: "/images/marcas/sanofi.webp",
    width: 320,
    height: 255,
    shape: "tall",
  },
  {
    slug: "raven",
    name: "Raven Productos Farmacéuticos",
    logo: "/images/marcas/raven.webp",
    width: 320,
    height: 96,
    shape: "wide",
  },
];
