"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="shell py-16">
      <h1 className="text-3xl font-bold text-blue-950">
        No pudimos cargar esta página
      </h1>
      <p className="mt-4 text-slate-600">
        El servicio no está disponible temporalmente. Inténtalo de nuevo en unos
        minutos.
      </p>
      <button type="button" onClick={reset} className="btn-primary mt-7">
        Intentar de nuevo
      </button>
    </div>
  );
}
