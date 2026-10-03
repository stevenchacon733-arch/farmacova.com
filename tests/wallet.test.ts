import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto, createHash } from "node:crypto";
import * as asn1 from "asn1js";
import * as pki from "pkijs";
import { unzipSync } from "fflate";
import { signPass } from "../src/lib/wallet/sign.ts";

test("pkpass: manifiesto, certificados, firma separada y detección de cambios", async () => {
  pki.setEngine(
    "test",
    new pki.CryptoEngine({
      name: "test",
      crypto: webcrypto as unknown as Crypto,
    }),
  );
  const keys = await webcrypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );
  const certificate = new pki.Certificate();
  certificate.version = 2;
  certificate.serialNumber = new asn1.Integer({ value: 1 });
  const subject = new pki.AttributeTypeAndValue({
    type: "2.5.4.3",
    value: new asn1.Utf8String({ value: "Farmacova test only" }),
  });
  certificate.subject.typesAndValues.push(subject);
  certificate.issuer.typesAndValues.push(subject);
  certificate.notBefore.value = new Date(Date.now() - 60000);
  certificate.notAfter.value = new Date(Date.now() + 3600000);
  await certificate.subjectPublicKeyInfo.importKey(keys.publicKey as CryptoKey);
  await certificate.sign(keys.privateKey as CryptoKey, "SHA-256");
  const pem = (label: string, data: ArrayBuffer) =>
    `-----BEGIN ${label}-----\n${Buffer.from(data)
      .toString("base64")
      .match(/.{1,64}/g)
      ?.join("\n")}\n-----END ${label}-----\n`;
  const cert = pem("CERTIFICATE", certificate.toSchema().toBER(false));
  const key = pem(
    "PRIVATE KEY",
    await webcrypto.subtle.exportKey("pkcs8", keys.privateKey),
  );
  const files = {
    "pass.json": Buffer.from('{"formatVersion":1}'),
    "icon.png": Buffer.from("test icon"),
  };
  const zip = await signPass(files, cert, key, cert);
  const unpacked = unzipSync(zip);
  const manifest = JSON.parse(
    Buffer.from(unpacked["manifest.json"]).toString("utf8"),
  );
  assert.equal(
    manifest["pass.json"],
    createHash("sha1").update(files["pass.json"]).digest("hex"),
  );
  const cms = pki.ContentInfo.fromBER(
    Uint8Array.from(unpacked.signature).buffer,
  );
  const signed = new pki.SignedData({ schema: cms.content });
  assert.equal(signed.certificates?.length, 2);
  assert.equal(signed.encapContentInfo.eContent, undefined);
  assert.ok(
    signed.signerInfos[0].signedAttrs?.attributes.some(
      (attribute) => attribute.type === "1.2.840.113549.1.9.5",
    ),
  );
  assert.equal(
    await signed.verify({
      signer: 0,
      data: Uint8Array.from(unpacked["manifest.json"]).buffer,
      checkChain: false,
    }),
    true,
  );
  await assert.rejects(
    signed.verify({
      signer: 0,
      data: new TextEncoder().encode("changed manifest").buffer,
      checkChain: false,
    }),
  );
});
