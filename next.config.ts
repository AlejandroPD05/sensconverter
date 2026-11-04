import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Las E2E sin Supabase levantan un segundo `next dev` con otra carpeta de
  // salida para no chocar con el servidor principal.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
