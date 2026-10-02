"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export function AccountLink() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (!hasSupabaseConfig()) return;
    const client = createClient();
    let active = true;
    void client.auth.getUser().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.user?.email_confirmed_at));
    });
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) =>
      setSignedIn(Boolean(session?.user.email_confirmed_at)),
    );
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  return (
    <Link
      href={signedIn ? "/cuenta" : "/auth"}
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-blue-900 hover:bg-slate-50"
    >
      <UserRound size={19} aria-hidden="true" />
      <span>{signedIn ? "Mi perfil" : "Mi cuenta"}</span>
    </Link>
  );
}
