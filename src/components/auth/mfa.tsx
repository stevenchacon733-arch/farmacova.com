"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function friendlyMfaError(code?: string): string {
  const messages: Record<string, string> = {
    mfa_verification_failed:
      "El código no es correcto o ya cambió. Escribe el que muestra tu app ahora.",
    mfa_challenge_expired: "El código expiró. Escribe el nuevo.",
    insufficient_aal:
      "Por seguridad, verifica primero el código de tu app de autenticación.",
    over_request_rate_limit:
      "Hay demasiados intentos. Espera unos minutos antes de volver a intentar.",
    mfa_factor_name_conflict:
      "Ya hay un autenticador en proceso. Recarga la página e inténtalo otra vez.",
  };
  return (
    messages[code ?? ""] ??
    "No pudimos completar la verificación. Inténtalo de nuevo."
  );
}

function CodeInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label htmlFor="mfa-code" className="field-label">
        Código de 6 dígitos
      </label>
      <input
        id="mfa-code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        required
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
        className="field text-center text-2xl tracking-[0.5em]"
        disabled={disabled}
      />
    </div>
  );
}

// Paso extra al ingresar cuando la cuenta tiene verificación en dos pasos.
export function MfaChallengeForm({ next }: { next: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || code.length !== 6) return;
    setPending(true);
    setError("");
    try {
      const client = createClient();
      const { data, error: listError } = await client.auth.mfa.listFactors();
      const factor = data?.totp[0];
      if (listError || !factor) {
        setError(friendlyMfaError(listError?.code));
        return;
      }
      const { error: verifyError } = await client.auth.mfa.challengeAndVerify({
        factorId: factor.id,
        code,
      });
      if (verifyError) {
        setCode("");
        setError(friendlyMfaError(verifyError.code));
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("No pudimos conectar. Revisa tu conexión e inténtalo otra vez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <CodeInput value={code} onChange={setCode} disabled={pending} />
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || code.length !== 6}
        className="btn-primary w-full"
      >
        {pending ? (
          <>
            <LoaderCircle
              size={18}
              className="animate-spin"
              aria-hidden="true"
            />{" "}
            Verificando…
          </>
        ) : (
          "Verificar"
        )}
      </button>
    </form>
  );
}

type Enrollment = { factorId: string; qr: string; secret: string };

// Activar o quitar la verificación en dos pasos (app tipo Google
// Authenticator, Microsoft Authenticator o 1Password).
export function MfaManager() {
  const router = useRouter();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    const { data } = await createClient().auth.mfa.listFactors();
    setFactorId(data?.totp[0]?.id ?? null);
  }

  useEffect(() => {
    let active = true;
    void createClient()
      .auth.mfa.listFactors()
      .then(({ data }) => {
        if (!active) return;
        setFactorId(data?.totp[0]?.id ?? null);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function startEnrollment() {
    setPending(true);
    setError("");
    setSuccess("");
    try {
      const client = createClient();
      // Un intento anterior sin terminar bloquearía uno nuevo.
      const { data: factors } = await client.auth.mfa.listFactors();
      for (const factor of factors?.all ?? [])
        if (factor.status === "unverified")
          await client.auth.mfa.unenroll({ factorId: factor.id });
      const { data, error: enrollError } = await client.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Farmacova",
        issuer: "Farmacova",
      });
      if (enrollError || !data) {
        setError(friendlyMfaError(enrollError?.code));
        return;
      }
      setEnrollment({
        factorId: data.id,
        qr: data.totp.qr_code,
        secret: data.totp.secret,
      });
    } catch {
      setError("No pudimos conectar. Inténtalo otra vez.");
    } finally {
      setPending(false);
    }
  }

  async function confirmEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enrollment || pending || code.length !== 6) return;
    setPending(true);
    setError("");
    try {
      const { error: verifyError } =
        await createClient().auth.mfa.challengeAndVerify({
          factorId: enrollment.factorId,
          code,
        });
      if (verifyError) {
        setCode("");
        setError(friendlyMfaError(verifyError.code));
        return;
      }
      setEnrollment(null);
      setCode("");
      setSuccess("Listo. Te pediremos un código cada vez que ingreses.");
      await load();
      router.refresh();
    } catch {
      setError("No pudimos conectar. Inténtalo otra vez.");
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!factorId || pending) return;
    if (
      !window.confirm(
        "¿Quitar la verificación en dos pasos? Tu cuenta quedará protegida solo con la contraseña.",
      )
    )
      return;
    setPending(true);
    setError("");
    setSuccess("");
    try {
      const client = createClient();
      const { error: removeError } = await client.auth.mfa.unenroll({
        factorId,
      });
      if (removeError) {
        setError(friendlyMfaError(removeError.code));
        return;
      }
      // La sesión sigue marcada como verificada hasta renovarla.
      await client.auth.refreshSession();
      setSuccess("Quitamos la verificación en dos pasos.");
      await load();
      router.refresh();
    } catch {
      setError("No pudimos conectar. Inténtalo otra vez.");
    } finally {
      setPending(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Cargando…</p>;

  return (
    <div className="space-y-5">
      {factorId ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 p-5">
          <p className="flex items-center gap-3 font-semibold text-green-800">
            <ShieldCheck size={22} aria-hidden="true" /> Activada
          </p>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="btn-secondary"
          >
            Quitar
          </button>
        </div>
      ) : enrollment ? (
        <form onSubmit={confirmEnrollment} noValidate className="space-y-5">
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
            <li>
              Abre tu app de autenticación (Google Authenticator, Microsoft
              Authenticator o similar) y escanea este código.
            </li>
            <li>Escribe el código de 6 dígitos que aparece en la app.</li>
          </ol>
          {/* El QR llega de Supabase como imagen SVG en línea (data:). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={enrollment.qr}
            alt="Código QR para tu app de autenticación"
            width={200}
            height={200}
            className="rounded-xl border border-slate-200 bg-white p-2"
          />
          <p className="text-xs text-slate-500">
            ¿No puedes escanear? Escribe esta clave en la app:{" "}
            <code className="break-all font-mono text-slate-700">
              {enrollment.secret}
            </code>
          </p>
          <CodeInput value={code} onChange={setCode} disabled={pending} />
          <button
            type="submit"
            disabled={pending || code.length !== 6}
            className="btn-primary w-full"
          >
            {pending ? "Verificando…" : "Activar"}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={startEnrollment}
          disabled={pending}
          className="btn-primary"
        >
          {pending ? "Preparando…" : "Activar verificación en dos pasos"}
        </button>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {success}
        </p>
      )}
    </div>
  );
}
