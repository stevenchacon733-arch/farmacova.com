import Image from "next/image";
import { brands, type Brand } from "@/lib/brands";

const logoSize = {
  wide: "w-[80%] max-h-[46%]",
  tall: "h-[72%] max-w-[60%]",
  round: "w-[88%] h-[88%]",
};

function BrandBadge({ brand, index }: { brand: Brand; index: number }) {
  return (
    <div className="flex w-24 shrink-0 flex-col items-center gap-2 sm:w-28">
      <div
        className="brand-shine relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_6px_18px_-8px_rgb(15_23_42/0.35)] ring-1 ring-slate-200 sm:h-24 sm:w-24"
        style={{ "--shine-delay": `${index * 0.9}s` } as React.CSSProperties}
      >
        <Image
          src={brand.logo}
          alt=""
          width={brand.width}
          height={brand.height}
          sizes="96px"
          className={`${logoSize[brand.shape]} object-contain`}
        />
      </div>
      <span className="text-center text-xs font-medium text-slate-600">
        {brand.name}
      </span>
    </div>
  );
}

// Carrusel continuo de marcas: se detiene al pasar el cursor y queda fijo si
// el visitante prefiere menos movimiento.
export function BrandsRail() {
  return (
    <section aria-labelledby="brands-title" className="shell py-8 sm:py-10">
      <h2
        id="brands-title"
        className="text-center text-sm font-bold uppercase tracking-[0.16em] text-green-700"
      >
        Marcas que encuentras en Farmacova
      </h2>
      <div className="brands-viewport mt-6 overflow-hidden">
        <ul className="brands-track flex w-max gap-4 sm:gap-8">
          {brands.map((brand, index) => (
            <li key={brand.slug}>
              <BrandBadge brand={brand} index={index} />
            </li>
          ))}
          {/* Copia para que el desplazamiento sea continuo. */}
          {brands.map((brand, index) => (
            <li key={`${brand.slug}-copia`} aria-hidden="true">
              <BrandBadge brand={brand} index={index} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
