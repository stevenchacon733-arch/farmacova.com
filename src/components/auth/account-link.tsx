"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export function AccountLink({ dark = false }: { dark?: boolean }) {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (!hasSupabaseConfig()) return;
    let active = true;
    let unsubscribe = () => {};
    // Carga diferida: el cliente de Supabase (~70 KB) no bloquea la página.
    void import("@/lib/supabase/client").then(({ createClient }) => {
      if (!active) return;
      const client = createClient();
      void client.auth.getUser().then(({ data }) => {
        if (active) setSignedIn(Boolean(data.user?.email_confirmed_at));
      });
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, session) =>
        setSignedIn(Boolean(session?.user.email_confirmed_at)),
      );
      unsubscribe = () => subscription.unsubscribe();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
  return (
    <Link
      href={signedIn ? "/cuenta" : "/auth"}
      className={
        dark
          ? "flex shrink-0 flex-col items-center gap-1 text-xs text-white hover:text-green-300"
          : "inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-blue-900 hover:bg-slate-50"
      }
    >
      <UserRound
        size={dark ? 25 : 19}
        strokeWidth={dark ? 1.6 : 2}
        aria-hidden="true"
      />
      <span>{signedIn ? "Mi perfil" : "Mi cuenta"}</span>
    </Link>
  );
}
