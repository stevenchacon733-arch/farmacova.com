import Link from "next/link";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/catalog";
import { demoCampaigns, type Campaign } from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { CampaignEditor } from "@/components/marketing/campaign-editor";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Administrar anuncios",
  robots: { index: false, follow: false },
};

export default async function CampaignAdminPage() {
  const demo = isDemoMode();
  let campaigns: Campaign[] = demoCampaigns;
  if (!demo) {
    if (!hasSupabaseConfig()) redirect("/auth");
    const client = await createClient();
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (error || !user?.email_confirmed_at) redirect("/auth");
    if (user.app_metadata?.role !== "admin")
      return (
        <div className="shell py-12">
          <h1 className="text-3xl font-semibold text-blue-950">
            Acceso restringido
          </h1>
          <p className="mt-4 text-slate-500">
            Este panel está disponible únicamente para administradores de
            Farmacova.
          </p>
          <Link href="/" className="btn-primary mt-6">
            Volver al inicio
          </Link>
        </div>
      );
    const { data, error: readError } = await client
      .from("hero_campaigns")
      .select(
        "id,title,eyebrow,description,image_path,cta_label,cta_href,sponsored,sponsor,position,active,starts_at,ends_at",
      )
      .order("position");
    if (readError) throw new Error("No pudimos cargar el panel de anuncios.");
    campaigns = data ?? [];
  }
  return (
    <div className="shell py-10">
      <Link
        href="/"
        className="text-sm font-semibold text-blue-800 underline underline-offset-4"
      >
        Volver a la portada
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-blue-950">
        Tus ofertas y patrocinios
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
        Elige los anuncios del bloque azul: imagen, texto, botón, fechas y orden
        de aparición.
      </p>
      <CampaignEditor initialCampaigns={campaigns} demo={demo} />
    </div>
  );
}
