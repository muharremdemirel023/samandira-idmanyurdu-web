import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const CANONICAL_ORIGIN = "https://www.samandiraidmanyurdu.com";

const nextConfig: NextConfig = {
  /** Çoklu lockfile olduğunda üst klasör yanlış workspace seçilmesin diye kök sabitlenir */
  turbopack: {
    root: dirname,
  },
  /**
   * Tek kanonik origin: https://www.samandiraidmanyurdu.com
   * Vercel'de aynı kurallar vercel.json üzerinden edge'de çalışır; buradaki kopya
   * başka bir hosting'e taşınırsa davranışın korunması içindir. Hedefler birebir
   * aynı olduğu için çift yönlendirme/döngü oluşmaz.
   */
  async redirects() {
    return [
      // www olmayan apex host -> www (host değeri ^...$ ile eşleştiği için www hostu bu kurala girmez)
      {
        source: "/:path*",
        has: [{ type: "host", value: "samandiraidmanyurdu.com" }],
        destination: `${CANONICAL_ORIGIN}/:path*`,
        permanent: true,
      },
      // http -> https (yerel geliştirmede bu başlık gelmediği için kural tetiklenmez)
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: `${CANONICAL_ORIGIN}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
