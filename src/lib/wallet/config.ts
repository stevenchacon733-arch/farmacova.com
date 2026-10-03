import "server-only";
const required = [
  "APPLE_WALLET_PASS_TYPE_ID",
  "APPLE_WALLET_TEAM_ID",
  "APPLE_WALLET_CERT_BASE64",
  "APPLE_WALLET_KEY_BASE64",
  "APPLE_WALLET_WWDR_BASE64",
  "SITE_URL",
] as const;
export function walletConfigured() {
  return (
    required.every((key) => !!process.env[key]?.trim()) &&
    /^https:\/\//.test(process.env.SITE_URL ?? "")
  );
}
export function walletMissing() {
  return required.filter((key) => !process.env[key]?.trim());
}
