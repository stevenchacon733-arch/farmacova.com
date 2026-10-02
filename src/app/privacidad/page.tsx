import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidad",
  robots: { index: false, follow: true },
};
export default function PrivacyPage() {
  return (
    <div className="shell py-12">
      <article className="max-w-2xl space-y-6 leading-relaxed text-slate-600">
        <h1 className="text-3xl font-bold text-blue-950">
          Información sobre privacidad
        </h1>
        <p>
          La cuenta utiliza tu correo y una contraseña administrada por Supabase
          Auth. Las cookies de sesión permiten mantener tu acceso al perfil.
          Explorar medicamentos, promociones y servicios no requiere registro.
        </p>
        <h2 className="text-xl font-bold text-blue-950">
          Información del catálogo
        </h2>
        <p>
          Esta página no recibe recetas, listas de tratamiento ni datos
          clínicos. Tampoco permite realizar pagos o compras en línea.
        </p>
        <h2 className="text-xl font-bold text-blue-950">
          Antes de habilitar cuentas
        </h2>
        <p>
          Este texto describe el comportamiento de la versión inicial. Farmacova
          debe completar su aviso de privacidad con la identidad del
          responsable, contacto, finalidades, conservación de datos y
          procedimiento para ejercer derechos antes de habilitar cuentas al
          público.
        </p>
      </article>
    </div>
  );
}
