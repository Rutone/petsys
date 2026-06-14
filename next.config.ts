import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
  images: {
    // Профайл зургийг дурын https эх сурвалжаас зөвшөөрнө (хэрэглэгчийн оруулсан URL)
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
