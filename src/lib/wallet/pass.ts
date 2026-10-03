import "server-only";
import sharp from "sharp";
import { X509Certificate } from "node:crypto";
import { visibleStamps, type Member } from "@/lib/loyalty";
import { signPass } from "./sign";
import { walletConfigured } from "./config";

async function png(svg: string, width: number, height: number) {
  return sharp(Buffer.from(svg)).resize(width, height).png().toBuffer();
}
export async function generatePass(
  member: Member,
  available: number,
  terms: string,
) {
  if (!walletConfigured()) throw new Error("WALLET_NOT_CONFIGURED");
  const cert = Buffer.from(
    process.env.APPLE_WALLET_CERT_BASE64!,
    "base64",
  ).toString("utf8");
  const signer = new X509Certificate(cert);
  const subject = signer.subject.split(/\n|,\s*/);
  if (
    !subject.includes(`UID=${process.env.APPLE_WALLET_PASS_TYPE_ID}`) ||
    !subject.includes(`OU=${process.env.APPLE_WALLET_TEAM_ID}`)
  )
    throw new Error("WALLET_CERTIFICATE_MISMATCH");
  const base = new URL(process.env.SITE_URL!);
  if (base.protocol !== "https:") throw new Error("HTTPS_REQUIRED");
  const stamps = visibleStamps(member.total_stamps, available);
  const strip = `<svg xmlns="http://www.w3.org/2000/svg" width="375" height="123"><rect width="375" height="123" fill="#1e40af"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${16 + i * 59}" y="29" width="48" height="60" rx="12" fill="${i < stamps ? "#16a34a" : "#3559b3"}"/><text x="${40 + i * 59}" y="68" text-anchor="middle" font-family="Arial" font-size="25" fill="white">${i < stamps ? "✓" : i + 1}</text>`).join("")}</svg>`;
  const icon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="87" height="87"><rect width="87" height="87" rx="20" fill="#1e40af"/><path d="M34 16h19v18h18v19H53v18H34V53H16V34h18z" fill="#22c55e"/></svg>';
  const files: Record<string, Uint8Array> = {};
  await Promise.all(
    [1, 2, 3].map(async (scale) => {
      files[`icon${scale === 1 ? "" : `@${scale}x`}.png`] = await png(
        icon,
        29 * scale,
        29 * scale,
      );
      files[`strip${scale === 1 ? "" : `@${scale}x`}.png`] = await png(
        strip,
        375 * scale,
        123 * scale,
      );
    }),
  );
  files["pass.json"] = Buffer.from(
    JSON.stringify({
      formatVersion: 1,
      passTypeIdentifier: process.env.APPLE_WALLET_PASS_TYPE_ID,
      teamIdentifier: process.env.APPLE_WALLET_TEAM_ID,
      serialNumber: member.id,
      organizationName: "Farmacova",
      description: "Tarjeta de fidelidad Farmacova",
      logoText: "Farmacova · CUIDAMOS DE TI",
      backgroundColor: "rgb(30,64,175)",
      foregroundColor: "rgb(255,255,255)",
      labelColor: "rgb(191,219,254)",
      sharingProhibited: true,
      storeCard: {
        headerFields: [{ key: "reward", label: "BENEFICIO", value: "15%" }],
        secondaryFields: [
          { key: "name", label: "CLIENTE", value: member.display_name },
          {
            key: "progress",
            label: "SELLOS AL ACTUALIZAR",
            value: `${stamps}/6`,
          },
        ],
        auxiliaryFields: [
          { key: "available", label: "CUPONES DISPONIBLES", value: available },
        ],
        backFields: [
          {
            key: "rules",
            label: "CÓMO FUNCIONA",
            value: `Un sello por cada ₡10.000. Completa seis sellos para obtener un cupón de 15% para una compra posterior. Canje único en sucursal. ${terms}`,
          },
          {
            key: "updated",
            label: "ÚLTIMA ACTUALIZACIÓN",
            value: new Date().toISOString(),
          },
          {
            key: "live",
            label: "VER MI TARJETA ACTUAL",
            value: new URL("/fidelidad", base).href,
          },
          {
            key: "refresh",
            label: "ACTUALIZAR LOS SELLOS",
            value:
              "Después de comprar o canjear, abre tu tarjeta web y pulsa Agregar a Apple Wallet nuevamente. Se reemplaza esta misma tarjeta.",
          },
        ],
      },
      barcodes: [
        {
          format: "PKBarcodeFormatQR",
          message: member.member_number,
          messageEncoding: "iso-8859-1",
          altText: member.member_number,
        },
      ],
    }),
  );
  return signPass(
    files,
    cert,
    Buffer.from(process.env.APPLE_WALLET_KEY_BASE64!, "base64").toString(
      "utf8",
    ),
    Buffer.from(process.env.APPLE_WALLET_WWDR_BASE64!, "base64").toString(
      "utf8",
    ),
    process.env.APPLE_WALLET_KEY_PASSPHRASE,
  );
}
