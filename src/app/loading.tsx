export default function Loading() {
  return (
    <div className="shell py-16" role="status">
      <p className="text-lg font-semibold text-blue-900">Cargando Farmacova…</p>
      <div
        className="mt-6 h-40 rounded-2xl bg-slate-100 motion-safe:animate-pulse"
        aria-hidden="true"
      />
    </div>
  );
}
