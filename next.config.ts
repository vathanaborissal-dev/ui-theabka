import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // The repo sits inside a parent directory that also has a lockfile; pin the
  // workspace root so Turbopack stops guessing.
  turbopack: { root: __dirname },
  // Allows a disposable E2E dev server to run beside the normal dev server.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  /*
   * Phones on the LAN, for testing the invitation and the camera on a real
   * device. Next blocks cross-origin requests to dev-only assets by default,
   * so without this the page loads and its dev assets do not.
   *
   * Development only — it has no effect on a production build — and a LAN
   * address, not a wildcard: this opens the dev server to anything that can
   * reach it on the network.
   */
  allowedDevOrigins: ["192.168.100.154"],
  /*
   * The API, served from this app's own origin.
   *
   * The browser asks this server for `/api/...` and this server forwards it to
   * Spring, which means a phone on the LAN needs to reach exactly one port —
   * the one it already loaded the page from. Pointing it at the API directly
   * needs three other things to line up: the API's address baked into the
   * bundle, that host allowed through CORS, and macOS letting java accept
   * connections at all. It is also what makes an HTTPS dev server possible,
   * since one origin cannot be half secure.
   *
   * Same-origin in production too, if it is deployed behind one host.
   */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_ORIGIN ?? "http://localhost:8080"}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
