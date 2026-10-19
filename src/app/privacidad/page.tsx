import Link from "next/link";
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
          Política de privacidad
        </h1>
        <p>
          Farmacova trata tus datos personales conforme a la Ley 8968 de
          Protección de la Persona frente al Tratamiento de sus Datos Personales
          y su reglamento. Solo pedimos lo necesario para atenderte y nunca
          vendemos tu información.
        </p>
        <h2 className="text-xl font-bold text-blue-950">
          Responsable y contacto
        </h2>
        <p>
          Responsable de la base de datos: Farmacova, Costa Rica. Para consultas
          sobre tus datos llama a la atención central al{" "}
          <a href="tel:+50640006769" className="font-semibold text-blue-800">
            4000-6769
          </a>{" "}
          o acércate a cualquiera de nuestras{" "}
          <Link href="/sucursales" className="font-semibold text-blue-800">
            sucursales
          </Link>
          .
        </p>
        <h2 className="text-xl font-bold text-blue-950">Tu cuenta</h2>
        <p>
          La cuenta utiliza tu correo y una contraseña administrada por Supabase
          Auth. Las cookies de sesión permiten mantener tu acceso al perfil.
          Explorar medicamentos, promociones y servicios no requiere registro.
        </p>
        <h2 className="text-xl font-bold text-blue-950">Club Farmacova</h2>
        <p>
          Para emitir tu tarjeta se guardan tu nombre, un identificador de
          socio, la aceptación de las condiciones, los importes y referencias de
          facturas, los sellos y los canjes. El equipo autorizado de Farmacova
          administra estos registros. La tarjeta descargada para Apple Wallet
          incluye tu nombre, identificador, sellos y cupones disponibles en el
          momento de descargarla. Su QR identifica tu tarjeta; el canje requiere
          validación en sucursal.
        </p>
        <h2 className="text-xl font-bold text-blue-950">
          Información del catálogo
        </h2>
        <p>
          Esta página no recibe recetas, listas de tratamiento ni datos
          clínicos. Tampoco permite realizar pagos o compras en línea.
        </p>
        <h2 className="text-xl font-bold text-blue-950">WhatsApp y llamadas</h2>
        <p>
          Si nos escribes por WhatsApp o nos llamas, usamos tu número y tu
          mensaje solo para responder tu consulta. WhatsApp es un servicio de
          Meta y se rige por sus propias condiciones de privacidad.
        </p>
        <h2 className="text-xl font-bold text-blue-950">
          Cookies y estadísticas
        </h2>
        <p>
          Usamos cookies necesarias para mantener tu sesión. Si activamos
          herramientas de medición como Google Analytics o el Píxel de Meta,
          estas registran de forma agregada cómo se usa el sitio (páginas
          visitadas, dispositivo, origen de la visita) para mejorar las
          promociones. Puedes bloquear o borrar las cookies desde tu navegador.
        </p>
        <h2 className="text-xl font-bold text-blue-950">
          Conservación y seguridad
        </h2>
        <p>
          Guardamos tus datos mientras tengas una cuenta o participes en el
          programa de lealtad, y el tiempo que exija la ley. Solo el personal
          autorizado puede consultarlos.
        </p>
        <h2 className="text-xl font-bold text-blue-950">Tus derechos</h2>
        <p>
          Puedes solicitar en cualquier momento el acceso, la rectificación o la
          eliminación de tus datos, o retirar tu consentimiento, por los medios
          de contacto indicados arriba. Si consideras que no atendimos tu
          solicitud, puedes acudir a la Agencia de Protección de Datos de los
          Habitantes (PRODHAB).
        </p>
      </article>
    </div>
  );
}
