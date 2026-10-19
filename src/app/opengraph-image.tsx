import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Imagen que muestran WhatsApp, Facebook e Instagram al compartir el sitio.
export const alt = "Farmacova · Promociones del mes en San Carlos, Costa Rica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(
    join(process.cwd(), "public/images/farmacova-logo-transparente.png"),
  );
  const src = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        borderBottom: "28px solid #16a34a",
      }}
    >
      <img src={src} width={666} height={336} alt="" />
      <div
        style={{
          marginTop: 24,
          fontSize: 44,
          fontWeight: 700,
          color: "#172554",
        }}
      >
        Promociones del mes · San Carlos, Costa Rica
      </div>
    </div>,
    size,
  );
}
