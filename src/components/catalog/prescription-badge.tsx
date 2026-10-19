// Icono estándar "Rx" para medicamentos con receta; el texto completo queda
// disponible para lectores de pantalla y como ayuda al pasar el cursor.
export function PrescriptionBadge({
  withLabel = false,
  className = "",
}: {
  withLabel?: boolean;
  className?: string;
}) {
  return (
    <span
      title="Requiere receta médica"
      className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 py-1 pl-1 text-xs font-semibold text-blue-900 ring-1 ring-blue-100 ${withLabel ? "pr-2.5" : "pr-1"} ${className}`}
    >
      <span
        aria-hidden="true"
        className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-800 font-serif text-[10px] font-bold italic text-white"
      >
        Rx
      </span>
      {withLabel ? (
        "Requiere receta"
      ) : (
        <span className="sr-only">Requiere receta médica</span>
      )}
    </span>
  );
}
