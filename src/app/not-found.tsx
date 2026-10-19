import Link from "next/link";
import { BadgePercent, Home, MapPin, MessageCircle } from "lucide-react";
import { getPublishedBranches } from "@/lib/branches-server";
import { whatsappHref } from "@/lib/branches";

export default async function NotFound() {
  const branches = await getPublishedBranches();
  const contacts = branches.flatMap((branch) => {
    const href = whatsappHref(branch);
    return href ? [{ id: branch.id, name: branch.name, href }] : [];
  });
  return (
    <div className="shell py-16">
      <span className="eyebrow">Error 404</span>
      <h1 className="mt-3 text-3xl font-bold text-blue-950 sm:text-4xl">
        No encontramos esta página
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
        Puede que el enlace haya cambiado o que la promoción ya terminó. Vuelve
        al inicio, revisa las ofertas vigentes o escríbenos y te ayudamos.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link href="/" className="btn-primary">
          <Home size={17} aria-hidden="true" /> Volver al inicio
        </Link>
        <Link href="/promociones" className="btn-secondary">
          <BadgePercent size={17} aria-hidden="true" /> Promociones del mes
        </Link>
        <Link href="/sucursales" className="btn-secondary">
          <MapPin size={17} aria-hidden="true" /> Sucursales
        </Link>
      </div>
      {contacts.length > 0 && (
        <section aria-labelledby="ayuda-whatsapp" className="mt-10 max-w-2xl">
          <h2
            id="ayuda-whatsapp"
            className="flex items-center gap-2 text-lg font-bold text-blue-950"
          >
            <MessageCircle
              size={20}
              className="text-green-700"
              aria-hidden="true"
            />
            ¿Buscabas algo en particular? Escríbenos por WhatsApp
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {contacts.map((contact) => (
              <li key={contact.id}>
                <a
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-100"
                >
                  {contact.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
