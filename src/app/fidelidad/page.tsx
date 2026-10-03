import Link from "next/link";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { isDemoMode } from "@/lib/catalog";
import { getSettings } from "@/lib/management";
import { walletConfigured } from "@/lib/wallet/config";
import { LoyaltyCard } from "@/components/loyalty/loyalty-card";
import type { Member, Reward } from "@/lib/loyalty";
import { getRewards } from "@/lib/loyalty-server";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Club Farmacova · Tarjeta de fidelidad",
  robots: { index: false, follow: false },
};
export default async function LoyaltyPage() {
  const demo = isDemoMode();
  let member: Member | null = null;
  let rewards: Reward[] = [];
  if (!demo && !hasSupabaseConfig())
    return (
      <div className="shell py-12">
        <h1 className="text-3xl font-bold text-blue-950">Club Farmacova</h1>
        <p className="mt-4">La inscripción estará disponible próximamente.</p>
      </div>
    );
  const settings = await getSettings();
  if (!demo) {
    if (!hasSupabaseConfig())
      return (
        <div className="shell py-12">
          <h1 className="text-3xl font-bold text-blue-950">Club Farmacova</h1>
          <p className="mt-4">La inscripción estará disponible próximamente.</p>
        </div>
      );
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user?.email_confirmed_at)
      return (
        <div className="shell py-16 text-center">
          <span className="eyebrow">Club Farmacova</span>
          <h1 className="mt-4 text-4xl font-bold text-blue-950">
            6 sellos te dan un 15% de descuento.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-slate-600">
            Un sello por cada ₡10.000 en compras en la farmacia. Crea tu cuenta
            y confirma tu correo para obtener tu tarjeta.
          </p>
          <Link
            href="/auth?mode=registro&next=/fidelidad"
            className="btn-primary mt-7"
          >
            Crear cuenta y obtener tarjeta
          </Link>
          <Link
            href="/auth?next=/fidelidad"
            className="btn-secondary mt-7 ml-3"
          >
            Ya tengo cuenta
          </Link>
        </div>
      );
    const { data, error } = await client
      .from("loyalty_members")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error)
      throw new Error("No pudimos cargar tu tarjeta. Intenta nuevamente.");
    member = data;
    if (member) {
      rewards = await getRewards(client, [member.id]);
    }
  }
  const qr = member
    ? await QRCode.toDataURL(member.member_number, {
        width: 240,
        margin: 2,
        errorCorrectionLevel: "M",
      })
    : null;
  return (
    <section className="shell py-12">
      <h1 className="sr-only">Tu tarjeta de fidelidad Farmacova</h1>
      <LoyaltyCard
        member={member}
        rewards={rewards}
        qr={qr}
        demo={demo}
        walletReady={walletConfigured()}
        terms={settings.loyalty_terms}
        version={settings.program_version}
        enabled={settings.loyalty_enabled}
        accumulate={settings.accumulate_remainder}
      />
    </section>
  );
}
