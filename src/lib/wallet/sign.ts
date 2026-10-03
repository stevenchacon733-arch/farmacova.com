// Firma CMS separada según RFC5652; ninguna clave se envía al navegador.
import {
  createPrivateKey,
  X509Certificate,
  webcrypto,
  createHash,
} from "node:crypto";
import * as asn1 from "asn1js";
import * as pki from "pkijs";
import { zipSync } from "fflate";

export async function signPass(
  files: Record<string, Uint8Array>,
  certificatePem: string,
  keyPem: string,
  wwdrPem: string,
  passphrase?: string,
) {
  const certificate = new X509Certificate(certificatePem);
  const wwdr = new X509Certificate(wwdrPem);
  if (!certificate.verify(wwdr.publicKey))
    throw new Error("El certificado WWDR no corresponde al firmante.");
  const key = createPrivateKey({ key: keyPem, passphrase });
  if (!certificate.checkPrivateKey(key))
    throw new Error("El certificado no corresponde a la clave.");
  const now = Date.now();
  if (
    now < Date.parse(certificate.validFrom) ||
    now > Date.parse(certificate.validTo) ||
    now < Date.parse(wwdr.validFrom) ||
    now > Date.parse(wwdr.validTo)
  )
    throw new Error("Certificado vencido o no vigente.");
  if (key.asymmetricKeyType !== "rsa")
    throw new Error("Se requiere un certificado RSA de Pass Type ID.");
  pki.setEngine(
    "farmacova",
    new pki.CryptoEngine({
      name: "farmacova",
      crypto: webcrypto as unknown as Crypto,
    }),
  );
  const signer = pki.Certificate.fromBER(
    Uint8Array.from(certificate.raw).buffer,
  );
  const intermediate = pki.Certificate.fromBER(
    Uint8Array.from(wwdr.raw).buffer,
  );
  const manifest = Buffer.from(
    JSON.stringify(
      Object.fromEntries(
        Object.entries(files).map(([path, data]) => [
          path,
          createHash("sha1").update(data).digest("hex"),
        ]),
      ),
    ),
  );
  const keyDer = key.export({ type: "pkcs8", format: "der" });
  const privateKey = await webcrypto.subtle.importKey(
    "pkcs8",
    Uint8Array.from(keyDer),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = new pki.SignedData({
    encapContentInfo: new pki.EncapsulatedContentInfo({
      eContentType: pki.ContentInfo.DATA,
    }),
    certificates: [signer, intermediate],
    signerInfos: [
      new pki.SignerInfo({
        sid: new pki.IssuerAndSerialNumber({
          issuer: signer.issuer,
          serialNumber: signer.serialNumber,
        }),
        signedAttrs: new pki.SignedAndUnsignedAttributes({
          type: 0,
          attributes: [
            new pki.Attribute({
              type: "1.2.840.113549.1.9.3",
              values: [
                new asn1.ObjectIdentifier({ value: pki.ContentInfo.DATA }),
              ],
            }),
            new pki.Attribute({
              type: "1.2.840.113549.1.9.5",
              values: [new asn1.UTCTime({ valueDate: new Date() })],
            }),
            new pki.Attribute({
              type: "1.2.840.113549.1.9.4",
              values: [
                new asn1.OctetString({
                  valueHex: Uint8Array.from(
                    createHash("sha256").update(manifest).digest(),
                  ).buffer,
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
  await signed.sign(
    privateKey as CryptoKey,
    0,
    "SHA-256",
    Uint8Array.from(manifest).buffer,
  );
  const cms = new pki.ContentInfo({
    contentType: pki.ContentInfo.SIGNED_DATA,
    content: signed.toSchema(true),
  });
  return zipSync({
    ...files,
    "manifest.json": manifest,
    signature: new Uint8Array(cms.toSchema().toBER(false)),
  });
}
