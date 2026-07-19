import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /** Çoklu lockfile olduğunda üst klasör yanlış workspace seçilmesin diye kök sabitlenir */
  turbopack: {
    root: dirname,
  },
};

export default nextConfig;
