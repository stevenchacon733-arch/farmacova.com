"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function signOut() {
    setPending(true);
    setError("");
    try {
      const { error: authError } = await createClient().auth.signOut();
      if (authError) {
        setError("No pudimos cerrar tu sesión. Inténtalo de nuevo.");
        return;
      }
      router.replace("/auth");
      router.refresh();
    } catch {
      setError("No pudimos conectar. Inténtalo otra vez.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={signOut}
        className="btn-secondary"
      >
        {pending ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
