"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Check, Eye, EyeOff, LockKeyhole, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import {
  isStrongPassword,
  isValidEmail,
  passwordRules,
  safeNext,
} from "@/lib/validation";

export type AuthMode = "ingreso" | "registro" | "recuperar" | "actualizar";

function friendlyAuthError(code?: string): string {
  const messages: Record<string, string> = {
    invalid_credentials:
      "El correo o la contraseña no coinciden. Revisa los datos e inténtalo de nuevo.",
    email_not_confirmed:
      "Confirma tu correo antes de ingresar. Revisa también la carpeta de spam.",
    weak_password:
      "Elige una contraseña más segura que cumpla todos los requisitos.",
    over_request_rate_limit:
      "Hay demasiados intentos. Espera unos minutos antes de volver a intentar.",
    over_email_send_rate_limit:
      "Alcanzamos el límite temporal de correos. Inténtalo más tarde.",
    user_already_exists:
      "Si ya tienes una cuenta, ingresa o recupera tu contraseña.",
    signup_disabled: "El registro no está disponible temporalmente.",
    same_password: "Elige una contraseña diferente de la anterior.",
    session_not_found:
      "Tu sesión expiró. Solicita un nuevo enlace de recuperación.",
  };
  return (
    messages[code ?? ""] ??
    "No pudimos completar la solicitud. Inténtalo de nuevo más tarde."
  );
}

export function AuthForm({
  mode = "ingreso",
  initialMessage = "",
  next = "/cuenta",
}: {
  mode?: AuthMode;
  initialMessage?: string;
  next?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmation: false,
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const configured = hasSupabaseConfig();
  const isRegistration = mode === "registro";
  const isUpdate = mode === "actualizar";
  const isRecovery = mode === "recuperar";
  const showRules = isRegistration || isUpdate;
  const emailError =
    touched.email && !isValidEmail(email)
      ? "Escribe un correo válido, por ejemplo nombre@dominio.com."
      : "";
  const passwordError =
    touched.password && !isStrongPassword(password)
      ? "Usa al menos 8 caracteres, mayúscula, minúscula, número y símbolo; máximo 128 caracteres."
      : "";
  const confirmationError =
    touched.confirmation && confirmation !== password
      ? "Las contraseñas deben coincidir."
      : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    setSuccess("");
    setTouched({ email: true, password: true, confirmation: true });
    if (
      (!isUpdate && !isValidEmail(email)) ||
      (!isRecovery && !isStrongPassword(password)) ||
      (showRules && password !== confirmation)
    )
      return;
    if (!configured) {
      setError(
        "El acceso a cuentas todavía no está habilitado. Puedes explorar el catálogo sin registrarte.",
      );
      return;
    }
    setPending(true);
    try {
      const client = createClient();
      const normalizedEmail = email.trim().toLowerCase();
      if (isRecovery) {
        const { error: authError } = await client.auth.resetPasswordForEmail(
          normalizedEmail,
          {
            redirectTo: `${window.location.origin}/auth/callback?next=/auth/actualizar-clave`,
          },
        );
        if (authError) {
          setError(friendlyAuthError(authError.code));
          return;
        }
        setSuccess(
          "Si hay una cuenta asociada, recibirás un enlace para cambiar tu contraseña. Revisa tu correo.",
        );
      } else if (isUpdate) {
        // Verificar la identidad con el servidor antes de cambiar credenciales.
        const { data: userData, error: userError } =
          await client.auth.getUser();
        if (userError || !userData.user) {
          setError(
            "El enlace expiró. Solicita uno nuevo en Recuperar contraseña.",
          );
          return;
        }
        const { error: authError } = await client.auth.updateUser({ password });
        if (authError) {
          setError(friendlyAuthError(authError.code));
          return;
        }
        setPassword("");
        setConfirmation("");
        router.replace("/cuenta");
        router.refresh();
      } else {
        const result = isRegistration
          ? await client.auth.signUp({
              email: normalizedEmail,
              password,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}`,
              },
            })
          : await client.auth.signInWithPassword({
              email: normalizedEmail,
              password,
            });
        if (result.error) {
          setError(friendlyAuthError(result.error.code));
          return;
        }
        setPassword("");
        setConfirmation("");
        if (isRegistration) {
          // No anunciar cuentas existentes ni aceptar registro sin confirmación.
          if (result.data.session && !result.data.user?.email_confirmed_at)
            await client.auth.signOut();
          setSuccess(
            "Si el correo puede registrarse, recibirás un enlace de confirmación. Ábrelo para activar tu perfil.",
          );
        } else {
          if (!result.data.user?.email_confirmed_at) {
            await client.auth.signOut();
            setError("Confirma tu correo antes de ingresar.");
            return;
          }
          router.replace(safeNext(next));
          router.refresh();
        }
      }
    } catch {
      setError("No pudimos conectar. Revisa tu conexión e inténtalo otra vez.");
    } finally {
      setPending(false);
    }
  }

  const labels = {
    ingreso: "Ingresar a mi cuenta",
    registro: "Crear mi perfil",
    recuperar: "Enviar enlace",
    actualizar: "Guardar contraseña",
  };
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {!configured && (
        <p className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">
          El acceso a cuentas todavía no está habilitado. El catálogo y las
          promociones están disponibles sin registro.
        </p>
      )}
      {initialMessage && (
        <p
          role="status"
          className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900"
        >
          {initialMessage}
        </p>
      )}
      {!isUpdate && (
        <div>
          <label htmlFor="auth-email" className="field-label">
            Correo electrónico
          </label>
          <input
            id="auth-email"
            type="email"
            name="email"
            autoComplete="email"
            maxLength={254}
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setTouched((value) => ({ ...value, email: true }))}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "email-error" : undefined}
            placeholder="nombre@correo.com"
            className="field"
            disabled={pending}
          />
          {emailError && (
            <p id="email-error" className="field-error" aria-live="polite">
              {emailError}
            </p>
          )}
        </div>
      )}
      {!isRecovery && (
        <div>
          <label htmlFor="auth-password" className="field-label">
            {isUpdate ? "Nueva contraseña" : "Contraseña"}
          </label>
          <div className="relative">
            <input
              id="auth-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={showRules ? "new-password" : "current-password"}
              minLength={8}
              maxLength={128}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() =>
                setTouched((value) => ({ ...value, password: true }))
              }
              aria-invalid={Boolean(passwordError)}
              aria-describedby={
                showRules ? "password-rules password-error" : "password-error"
              }
              className="field pr-14"
              disabled={pending}
            />
            <button
              type="button"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              aria-pressed={showPassword}
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-3 text-slate-500"
            >
              {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
            </button>
          </div>
          {passwordError && (
            <p id="password-error" className="field-error" aria-live="polite">
              {passwordError}
            </p>
          )}
          {showRules && (
            <ul
              id="password-rules"
              className="mt-3 grid gap-2 text-xs sm:grid-cols-2"
            >
              {passwordRules.map((rule) => (
                <li
                  key={rule.label}
                  className={`flex items-center gap-2 ${rule.test(password) ? "text-green-700" : "text-slate-500"}`}
                >
                  <Check size={14} aria-hidden="true" />
                  <span>
                    {rule.label}
                    {rule.test(password) && (
                      <span className="sr-only">, cumplido</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {showRules && (
        <div>
          <label htmlFor="auth-confirmation" className="field-label">
            Confirmar contraseña
          </label>
          <input
            id="auth-confirmation"
            name="confirmation"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            maxLength={128}
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            onBlur={() =>
              setTouched((value) => ({ ...value, confirmation: true }))
            }
            aria-invalid={Boolean(confirmationError)}
            aria-describedby={
              confirmationError ? "confirmation-error" : undefined
            }
            className="field"
            disabled={pending}
          />
          {confirmationError && (
            <p
              id="confirmation-error"
              className="field-error"
              aria-live="polite"
            >
              {confirmationError}
            </p>
          )}
        </div>
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
      <button
        type="submit"
        disabled={pending || !configured}
        className="btn-primary w-full"
      >
        {pending ? (
          <>
            <LoaderCircle
              size={18}
              className="animate-spin"
              aria-hidden="true"
            />{" "}
            Procesando…
          </>
        ) : (
          labels[mode]
        )}
      </button>
      {mode === "ingreso" && (
        <p className="text-center text-sm">
          <Link
            href="/auth?mode=recuperar"
            className="text-blue-800 underline underline-offset-4"
          >
            Recuperar contraseña
          </Link>
        </p>
      )}
      <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <LockKeyhole size={14} aria-hidden="true" /> Tu contraseña se gestiona
        con Supabase Auth.
      </p>
      {isRegistration && (
        <p className="text-center text-xs leading-relaxed text-slate-500">
          Confirmaremos tu correo para activar el perfil. Consulta el{" "}
          <Link href="/privacidad" className="underline">
            aviso de privacidad
          </Link>
          .
        </p>
      )}
    </form>
  );
}
