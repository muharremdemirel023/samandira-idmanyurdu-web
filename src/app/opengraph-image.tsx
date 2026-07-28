import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Samandıra İdman Yurdu S.K. Akademi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), "public/Samandiralogo.png"), "base64");
  const logoSrc = `data:image/png;base64,${logoData}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4a1220 0%, #7a1f30 60%, #4a1220 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={180} height={180} style={{ objectFit: "contain" }} />
        <div
          style={{
            marginTop: 36,
            fontSize: 56,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
          }}
        >
          Samandıra İdman Yurdu S.K.
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 34,
            fontWeight: 600,
            color: "#f97316",
            textAlign: "center",
          }}
        >
          Futbol Akademisi
        </div>
      </div>
    ),
    { ...size }
  );
}
