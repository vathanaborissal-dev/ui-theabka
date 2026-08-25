import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // The repo sits inside a parent directory that also has a lockfile; pin the
  // workspace root so Turbopack stops guessing.
  turbopack: { root: __dirname },
}

export default nextConfig
