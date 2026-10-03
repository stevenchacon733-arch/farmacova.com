// Ejecutar localmente cuando Apple solicite el CSR. Nunca publicar esta clave.
import { generateKeyPairSync, webcrypto } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import * as pki from "pkijs";
import * as asn1 from "asn1js";
const passphrase = process.env.WALLET_CSR_PASSPHRASE;
if (!passphrase || passphrase.length < 16)
  throw new Error(
    "Define WALLET_CSR_PASSPHRASE con al menos 16 caracteres antes de generar la clave.",
  );
pki.setEngine(
  "wallet-csr",
  new pki.CryptoEngine({ name: "wallet-csr", crypto: webcrypto }),
);
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const privateCrypto = await webcrypto.subtle.importKey(
  "pkcs8",
  privateKey.export({ type: "pkcs8", format: "der" }),
  { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
  false,
  ["sign"],
);
const publicCrypto = await webcrypto.subtle.importKey(
  "spki",
  publicKey.export({ type: "spki", format: "der" }),
  { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
  true,
  ["verify"],
);
const csr = new pki.CertificationRequest();
csr.version = 0;
csr.subject.typesAndValues.push(
  new pki.AttributeTypeAndValue({
    type: "2.5.4.3",
    value: new asn1.Utf8String({ value: "Farmacova Wallet" }),
  }),
);
await csr.subjectPublicKeyInfo.importKey(publicCrypto);
await csr.sign(privateCrypto, "SHA-256");
const directory = new URL("../wallet-secrets/", import.meta.url);
await mkdir(directory, { recursive: true });
const encrypted = privateKey.export({
  type: "pkcs8",
  format: "pem",
  cipher: "aes-256-cbc",
  passphrase,
});
// wx impide sustituir una clave existente y perder acceso al certificado.
await writeFile(new URL("signer-key.pem", directory), encrypted, {
  flag: "wx",
  mode: 0o600,
});
const request = Buffer.from(csr.toSchema().toBER(false))
  .toString("base64")
  .match(/.{1,64}/g)
  .join("\n");
await writeFile(
  new URL("Farmacova.certSigningRequest", directory),
  `-----BEGIN CERTIFICATE REQUEST-----\n${request}\n-----END CERTIFICATE REQUEST-----\n`,
  { flag: "wx", mode: 0o600 },
);
console.log(
  "CSR creado en wallet-secrets/Farmacova.certSigningRequest. Sube únicamente ese archivo a Apple. Conserva signer-key.pem y su contraseña en un lugar privado.",
);
