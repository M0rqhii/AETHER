/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /**
   * `next build` and `next dev` share `.next` by default, so running a build while
   * the dev server is up overwrites the chunks it is serving and the running page
   * loses its CSS and client bundle. Verification builds set NEXT_DIST_DIR to keep
   * out of the dev server's way; deployments use the default.
   */
  distDir: process.env.NEXT_DIST_DIR || '.next',
  async headers() {
    // Models and the Draco decoder keep the same URL across deploys (no content
    // hash), so they must not be `immutable` — a returning visitor would keep an
    // outdated model, or pair a new decoder wrapper with a stale wasm, for a year.
    // Cache for a day, then revalidate by ETag. The decoder's JS and wasm share one
    // policy so they always expire together.
    const assetCache = [{ key: 'Cache-Control', value: 'public, max-age=86400, must-revalidate' }]
    return [
      { source: '/models/:path*', headers: assetCache },
      { source: '/draco/:path*', headers: assetCache },
    ]
  },
}

export default nextConfig
