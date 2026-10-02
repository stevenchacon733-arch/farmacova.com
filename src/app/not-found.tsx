import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell py-16">
      <span className="eyebrow">404</span>
      <h1 className="mt-3 text-3xl font-bold text-blue-950">
        No encontramos esta página
      </h1>
      <p className="mt-4 text-slate-600">
        Puedes volver al inicio o explorar el catálogo.
      </p>
      <Link href="/" className="btn-primary mt-7">
        Volver al inicio
      </Link>
    </div>
  );
}
